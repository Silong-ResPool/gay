#!/usr/bin/env python3
"""Generate the iOS AppIcon and launch assets from the canonical snake logo.

The repository stores text only. GitHub Actions runs this before xcodegen so the
binary PNGs never need to live in git. The source logo is the same 512px WebP
used by the web/Android/PC builds.
"""
from __future__ import annotations

import base64
import io
import json
import os

from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(ROOT, "SilongResource", "Assets.xcassets")
APPICON = os.path.join(ASSETS, "AppIcon.appiconset")
LAUNCH = os.path.join(ASSETS, "LaunchLogo.imageset")
COLORS = os.path.join(ASSETS, "LaunchBackground.colorset")
LOGO_B64 = os.path.join(ROOT, "SilongResource", "logo.b64")

OBSIDIAN = (8, 7, 12)
VIOLET = (143, 123, 255)
BONE = (237, 228, 214)


def load_logo() -> Image.Image:
    with open(LOGO_B64, "r", encoding="ascii") as handle:
        data = base64.b64decode("".join(handle.read().split()))
    image = Image.open(io.BytesIO(data)).convert("RGBA")
    if image.width < 64 or image.height < 64:
        raise ValueError("logo too small")
    print("logo source: embedded", image.size)
    return image


def make_icon(source: Image.Image, size: int) -> Image.Image:
    canvas = Image.new("RGBA", (1024, 1024), OBSIDIAN + (255,))

    glow = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    draw = ImageDraw.Draw(glow)
    for radius in range(500, 40, -10):
        alpha = int(14 * (1.0 - radius / 500.0))
        draw.ellipse((512 - radius, 512 - radius, 512 + radius, 512 + radius), fill=VIOLET + (alpha,))
    glow = glow.filter(ImageFilter.GaussianBlur(86))
    canvas = Image.alpha_composite(canvas, glow)

    mark = source.copy()
    bbox = mark.getbbox()
    if bbox:
        mark = mark.crop(bbox)
    ratio = min(1000.0 / mark.width, 1000.0 / mark.height)
    mark = mark.resize((max(1, int(mark.width * ratio)), max(1, int(mark.height * ratio)),), Image.LANCZOS)
    x = (1024 - mark.width) // 2
    y = 1024 - mark.height
    canvas.alpha_composite(mark, (x, y))

    ring = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    ImageDraw.Draw(ring).ellipse(
        (88, 88, 936, 936),
        outline=BONE + (34,),
        width=2,
    )
    canvas = Image.alpha_composite(canvas, ring)
    return canvas.convert("RGB").resize((size, size), Image.LANCZOS)


def make_launch(source: Image.Image, size: int) -> Image.Image:
    image = source.copy()
    bbox = image.getbbox()
    if bbox:
        image = image.crop(bbox)
    limit = int(size * 0.86)
    ratio = min(limit / image.width, limit / image.height)
    image = image.resize((max(1, int(image.width * ratio)), max(1, int(image.height * ratio))), Image.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    canvas.alpha_composite(image, ((size - image.width) // 2, (size - image.height) // 2))
    return canvas


def write_json(path: str, payload: dict) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="\n") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2)
        handle.write("\n")


def main() -> None:
    source = load_logo()
    for path in (ASSETS, APPICON, LAUNCH, COLORS):
        os.makedirs(path, exist_ok=True)

    write_json(os.path.join(ASSETS, "Contents.json"), {
        "info": {"author": "xcode", "version": 1},
    })

    specs = [
        ("iphone", "20x20", "2x", 40), ("iphone", "20x20", "3x", 60),
        ("iphone", "29x29", "2x", 58), ("iphone", "29x29", "3x", 87),
        ("iphone", "40x40", "2x", 80), ("iphone", "40x40", "3x", 120),
        ("iphone", "60x60", "2x", 120), ("iphone", "60x60", "3x", 180),
        ("ipad", "20x20", "1x", 20), ("ipad", "20x20", "2x", 40),
        ("ipad", "29x29", "1x", 29), ("ipad", "29x29", "2x", 58),
        ("ipad", "40x40", "1x", 40), ("ipad", "40x40", "2x", 80),
        ("ipad", "76x76", "1x", 76), ("ipad", "76x76", "2x", 152),
        ("ipad", "83.5x83.5", "2x", 167),
        ("ios-marketing", "1024x1024", "1x", 1024),
    ]
    images = []
    for idiom, size_name, scale, pixels in specs:
        filename = "Icon-%s@%s.png" % (size_name.replace(".", "_"), scale)
        make_icon(source, pixels).save(os.path.join(APPICON, filename), optimize=True)
        images.append({
            "filename": filename,
            "idiom": idiom,
            "scale": scale,
            "size": size_name,
        })
    write_json(os.path.join(APPICON, "Contents.json"), {
        "images": images,
        "info": {"author": "xcode", "version": 1},
    })

    launch_images = []
    for scale, pixels in (("1x", 200), ("2x", 400), ("3x", 600)):
        filename = "LaunchLogo@%s.png" % scale
        make_launch(source, pixels).save(os.path.join(LAUNCH, filename), optimize=True)
        launch_images.append({"filename": filename, "idiom": "universal", "scale": scale})
    write_json(os.path.join(LAUNCH, "Contents.json"), {
        "images": launch_images,
        "info": {"author": "xcode", "version": 1},
    })

    write_json(os.path.join(COLORS, "Contents.json"), {
        "colors": [{
            "color": {
                "color-space": "srgb",
                "components": {
                    "alpha": "1.000",
                    "blue": "0.047",
                    "green": "0.027",
                    "red": "0.031",
                },
            },
            "idiom": "universal",
        }],
        "info": {"author": "xcode", "version": 1},
    })
    print("generated", len(images), "app icons")


if __name__ == "__main__":
    main()
