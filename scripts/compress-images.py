"""批量压缩 content/ 目录下的图片"""
import io
import os
import sys
from pathlib import Path
from PIL import Image
from concurrent.futures import ThreadPoolExecutor, as_completed

# 支持命令行参数指定目录，默认当前工作目录
if len(sys.argv) > 1:
    CONTENT_DIR = Path(sys.argv[1])
else:
    CONTENT_DIR = Path.cwd() / "content"
MIN_SIZE_KB = 50
MAX_WIDTH = 1200
WORKERS = 8

stats = {"total": 0, "skipped_small": 0, "compressed": 0, "errors": 0, "saved_kb": 0}


def compress_image(filepath: Path) -> dict:
    size_kb_before = filepath.stat().st_size / 1024

    if size_kb_before < MIN_SIZE_KB:
        return {"status": "skip_small", "before": size_kb_before}

    try:
        img = Image.open(filepath)
        fmt = img.format
        mode = img.mode
        w, h = img.size

        # Step 1: Resize if too wide
        if w > MAX_WIDTH:
            ratio = MAX_WIDTH / w
            new_h = int(h * ratio)
            img = img.resize((MAX_WIDTH, new_h), Image.LANCZOS)
            w, h = MAX_WIDTH, new_h

        # Step 2: Optimize based on format
        save_kwargs = {}
        if fmt == "PNG":
            save_kwargs["optimize"] = True
            # For large PNGs, try palette mode (256 colors) for huge savings
            if size_kb_before > 200 and mode in ("RGBA", "RGB"):
                try:
                    if mode == "RGBA":
                        img_q = img.quantize(colors=256, method=Image.Quantize.MEDIANCUT)
                    else:
                        img_q = img.convert("P", palette=Image.Palette.ADAPTIVE, colors=256)
                    # Save to temp to check if it actually reduced size
                    buf_orig = io.BytesIO()
                    buf_quant = io.BytesIO()
                    img.save(buf_orig, format="PNG", optimize=True)
                    img_q.save(buf_quant, format="PNG", optimize=True)

                    if len(buf_quant.getvalue()) < len(buf_orig.getvalue()) * 0.7:
                        # Quantized version is significantly smaller, use it
                        img = img_q
                    # else keep original (diagram/screenshot with fine details)
                except Exception:
                    pass  # quantization can fail, fall through to normal save

        elif fmt in ("JPEG", "JPG"):
            save_kwargs["optimize"] = True
            save_kwargs["quality"] = 85
            if mode == "RGBA":
                bg = Image.new("RGB", img.size, (255, 255, 255))
                bg.paste(img, mask=img.split()[3])
                img = bg

        # Save to buffer first, compare size, only overwrite if smaller
        buf = io.BytesIO()
        img.save(buf, format=fmt, **save_kwargs)
        new_size = buf.tell()

        if new_size < filepath.stat().st_size:
            with open(filepath, "wb") as f:
                f.write(buf.getvalue())
            size_kb_after = new_size / 1024
            saved = size_kb_before - size_kb_after
        else:
            size_kb_after = size_kb_before  # unchanged
            saved = 0

        return {
            "status": "compressed",
            "before": size_kb_before,
            "after": size_kb_after,
            "saved": saved,
            "path": str(filepath.relative_to(CONTENT_DIR.parent)),
        }

    except Exception as e:
        return {"status": "error", "before": size_kb_before, "error": str(e), "path": str(filepath)}


def main():
    # Collect all images
    extensions = {"*.png", "*.jpg", "*.jpeg"}
    images = []
    for ext in extensions:
        images.extend(CONTENT_DIR.rglob(ext))

    print(f"Found {len(images)} images in content/")
    stats["total"] = len(images)

    total_before = 0
    total_after = 0

    with ThreadPoolExecutor(max_workers=WORKERS) as executor:
        futures = {executor.submit(compress_image, p): p for p in images}
        for future in as_completed(futures):
            result = future.result()
            if result["status"] == "skip_small":
                stats["skipped_small"] += 1
                total_before += result["before"]
                total_after += result["before"]
            elif result["status"] == "compressed":
                stats["compressed"] += 1
                total_before += result["before"]
                total_after += result["after"]
                stats["saved_kb"] += result["saved"]
                pct = (1 - result["after"] / result["before"]) * 100
                if result["saved"] > 50:
                    print(f"  -{result['saved']:.0f}KB ({pct:.0f}%) {result['path']}")
            else:
                stats["errors"] += 1
                print(f"  ERROR: {result['error']} - {result.get('path', '?')}")

    print(f"\n{'='*50}")
    print(f"Total:   {stats['total']} images")
    print(f"Skipped: {stats['skipped_small']} (<{MIN_SIZE_KB}KB)")
    print(f"Compressed: {stats['compressed']}")
    print(f"Errors:  {stats['errors']}")
    print(f"Before:  {total_before/1024:.1f} MB")
    print(f"After:   {total_after/1024:.1f} MB")
    if total_before > 0:
        print(f"Saved:   {stats['saved_kb']/1024:.1f} MB ({(1-total_after/total_before)*100:.1f}%)")


if __name__ == "__main__":
    main()
