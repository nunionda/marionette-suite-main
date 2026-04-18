from __future__ import annotations

import numpy as np
from pathlib import Path
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

from .style_selector import ArtistStyle


# Standard aspect ratios: width / height
ASPECT_RATIOS = {
    "16:9": 16 / 9,
    "1.85:1": 1.85,
    "2.35:1": 2.35,
    "2.39:1": 2.39,
    "4:3": 4 / 3,
    "1:1": 1.0,
}


class PostProcessor:
    def __init__(self):
        self._filters = {
            "high_contrast": self._high_contrast,
            "threshold_binarize": self._threshold_binarize,
            "denoise": self._denoise,
            "watercolor_filter": self._watercolor_filter,
            "brush_texture_overlay": self._brush_texture_overlay,
            "saturation_adjust": self._saturation_adjust,
            "ink_line_enhance": self._ink_line_enhance,
            "grayscale_convert": self._grayscale_convert,
            "comic_hatching": self._comic_hatching,
        }

    # ==================================================================
    # Center Crop — distortion-free aspect ratio adjustment
    # ==================================================================

    @staticmethod
    def center_crop(img: Image.Image, target_ratio: float) -> Image.Image:
        """Center-crop image to target aspect ratio without stretching."""
        w, h = img.size
        current_ratio = w / h

        if abs(current_ratio - target_ratio) < 0.01:
            return img  # Already correct ratio

        if current_ratio > target_ratio:
            # Too wide — crop sides
            new_w = int(h * target_ratio)
            left = (w - new_w) // 2
            return img.crop((left, 0, left + new_w, h))
        else:
            # Too tall — crop top/bottom
            new_h = int(w / target_ratio)
            top = (h - new_h) // 2
            return img.crop((0, top, w, top + new_h))

    @staticmethod
    def parse_aspect_ratio(ar_string: str) -> float:
        """Parse aspect ratio string to float. e.g. '16:9' → 1.778, '2.35:1' → 2.35"""
        if ar_string in ASPECT_RATIOS:
            return ASPECT_RATIOS[ar_string]
        if ":" in ar_string:
            parts = ar_string.split(":")
            return float(parts[0]) / float(parts[1])
        try:
            return float(ar_string)
        except ValueError:
            return 16 / 9  # Default fallback

    # ==================================================================
    # Film Gate Overlay — professional storyboard frame lines
    # ==================================================================

    @staticmethod
    def draw_film_gate(img: Image.Image, aspect_ratio: str = "16:9",
                       line_color: str = "#FF3333", line_width: int = 2,
                       show_label: bool = True) -> Image.Image:
        """Draw film gate lines on image showing the active frame area.

        Creates a professional storyboard look with:
        - Semi-transparent letterbox bars outside the gate
        - Gate boundary lines in red/specified color
        - Aspect ratio label in corner
        - Corner tick marks
        """
        img = img.copy().convert("RGBA")
        w, h = img.size
        target_ratio = PostProcessor.parse_aspect_ratio(aspect_ratio)
        current_ratio = w / h

        # Create overlay for semi-transparent bars
        overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        draw_overlay = ImageDraw.Draw(overlay)
        draw_main = ImageDraw.Draw(img)

        bar_alpha = 100  # Semi-transparent black bars (0-255)
        tick_len = max(12, min(w, h) // 40)

        if abs(current_ratio - target_ratio) < 0.02:
            # Aspect ratios match — draw border frame only
            gate_left, gate_top = 0, 0
            gate_right, gate_bottom = w, h
        elif current_ratio > target_ratio:
            # Wider than target — vertical pillarbox bars on sides
            gate_w = int(h * target_ratio)
            gate_left = (w - gate_w) // 2
            gate_right = gate_left + gate_w
            gate_top, gate_bottom = 0, h

            # Draw side bars
            draw_overlay.rectangle([0, 0, gate_left, h], fill=(0, 0, 0, bar_alpha))
            draw_overlay.rectangle([gate_right, 0, w, h], fill=(0, 0, 0, bar_alpha))
        else:
            # Taller than target — horizontal letterbox bars top/bottom
            gate_h = int(w / target_ratio)
            gate_top = (h - gate_h) // 2
            gate_bottom = gate_top + gate_h
            gate_left, gate_right = 0, w

            # Draw top/bottom bars
            draw_overlay.rectangle([0, 0, w, gate_top], fill=(0, 0, 0, bar_alpha))
            draw_overlay.rectangle([0, gate_bottom, w, h], fill=(0, 0, 0, bar_alpha))

        # Composite overlay
        img = Image.alpha_composite(img, overlay)
        draw_main = ImageDraw.Draw(img)

        # Draw gate boundary lines
        # Top line
        draw_main.line([(gate_left, gate_top), (gate_right, gate_top)],
                       fill=line_color, width=line_width)
        # Bottom line
        draw_main.line([(gate_left, gate_bottom - 1), (gate_right, gate_bottom - 1)],
                       fill=line_color, width=line_width)
        # Left line
        draw_main.line([(gate_left, gate_top), (gate_left, gate_bottom)],
                       fill=line_color, width=line_width)
        # Right line
        draw_main.line([(gate_right - 1, gate_top), (gate_right - 1, gate_bottom)],
                       fill=line_color, width=line_width)

        # Corner tick marks (cross-hair style)
        tick_color = line_color
        corners = [
            (gate_left, gate_top),         # top-left
            (gate_right - 1, gate_top),    # top-right
            (gate_left, gate_bottom - 1),  # bottom-left
            (gate_right - 1, gate_bottom - 1),  # bottom-right
        ]
        for cx, cy in corners:
            # Horizontal tick
            dx = tick_len if cx == gate_left else -tick_len
            draw_main.line([(cx, cy), (cx + dx, cy)], fill=tick_color, width=line_width + 1)
            # Vertical tick
            dy = tick_len if cy == gate_top else -tick_len
            draw_main.line([(cx, cy), (cx, cy + dy)], fill=tick_color, width=line_width + 1)

        # Center crosshair (small)
        center_x = (gate_left + gate_right) // 2
        center_y = (gate_top + gate_bottom) // 2
        ch_size = max(6, min(w, h) // 80)
        draw_main.line([(center_x - ch_size, center_y), (center_x + ch_size, center_y)],
                       fill=line_color, width=1)
        draw_main.line([(center_x, center_y - ch_size), (center_x, center_y + ch_size)],
                       fill=line_color, width=1)

        # Aspect ratio label
        if show_label:
            label = f"  {aspect_ratio}  "
            try:
                font = ImageFont.truetype("/System/Library/Fonts/Menlo.ttc", max(11, h // 60))
            except Exception:
                try:
                    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
                                             max(11, h // 60))
                except Exception:
                    font = ImageFont.load_default()

            bbox = draw_main.textbbox((0, 0), label, font=font)
            tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
            label_x = gate_right - tw - 8
            label_y = gate_bottom - th - 8

            # Background pill for label
            draw_main.rounded_rectangle(
                [label_x - 4, label_y - 2, label_x + tw + 4, label_y + th + 2],
                radius=4, fill=(0, 0, 0, 180),
            )
            draw_main.text((label_x, label_y), label, fill="white", font=font)

        return img.convert("RGB")

    # ==================================================================
    # Safe Area Guide — TV safe / action safe overlay
    # ==================================================================

    @staticmethod
    def draw_safe_area(img: Image.Image, aspect_ratio: str = "16:9") -> Image.Image:
        """Draw TV-safe action safe / title safe guides (90% / 80%)."""
        img = img.copy()
        draw = ImageDraw.Draw(img)
        w, h = img.size

        # Action safe (93%)
        action_margin_x = int(w * 0.035)
        action_margin_y = int(h * 0.035)
        draw.rectangle(
            [action_margin_x, action_margin_y, w - action_margin_x, h - action_margin_y],
            outline="#FFFF00", width=1,
        )

        # Title safe (80%)
        title_margin_x = int(w * 0.1)
        title_margin_y = int(w * 0.1)
        draw.rectangle(
            [title_margin_x, title_margin_y, w - title_margin_x, h - title_margin_y],
            outline="#00FF00", width=1,
        )

        return img

    # ==================================================================
    # Main processing pipeline
    # ==================================================================

    def process(self, image_path: str, style: ArtistStyle,
                canvas_ratio: str = "4:3", film_gate: bool = True) -> str:
        """Process image: crop to 4:3 canvas, apply filters, overlay film gate.

        Pipeline:
        1. Center-crop to 4:3 canvas (removes generation artifacts at edges)
        2. Apply style-specific filters (watercolor, ink, etc.)
        3. Overlay film gate lines (2.35:1, 1.85:1, 16:9) on the 4:3 canvas
           — no further crop, full image visible with gate marking the active frame
        """
        img = Image.open(image_path).convert("RGB")

        # 1. Center crop to 4:3 canvas (clean up generation artifacts)
        canvas_r = self.parse_aspect_ratio(canvas_ratio)
        img = self.center_crop(img, canvas_r)

        # 2. Apply style-specific filters
        for filter_name in style.post_processing:
            fn = self._filters.get(filter_name)
            if fn:
                img = fn(img)

        # 3. Draw film gate overlay on the 4:3 canvas
        if film_gate:
            img = self.draw_film_gate(img, aspect_ratio=style.aspect_ratio)

        output_path = image_path.replace(".png", f"_processed.png")
        img.save(output_path)
        return output_path

    def process_batch(self, image_paths: list[str], style: ArtistStyle,
                      canvas_ratio: str = "4:3", film_gate: bool = True) -> list[str]:
        results = []
        for path in image_paths:
            if path:
                results.append(self.process(path, style, canvas_ratio=canvas_ratio, film_gate=film_gate))
            else:
                results.append(None)
        return results

    # === Saul Bass filters ===

    def _high_contrast(self, img: Image.Image) -> Image.Image:
        import cv2
        arr = np.array(img)
        gray = cv2.cvtColor(arr, cv2.COLOR_RGB2GRAY)
        clahe = cv2.createCLAHE(clipLimit=4.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)
        return Image.fromarray(cv2.cvtColor(enhanced, cv2.COLOR_GRAY2RGB))

    def _threshold_binarize(self, img: Image.Image) -> Image.Image:
        import cv2
        arr = np.array(img)
        gray = cv2.cvtColor(arr, cv2.COLOR_RGB2GRAY)
        _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        return Image.fromarray(cv2.cvtColor(binary, cv2.COLOR_GRAY2RGB))

    def _denoise(self, img: Image.Image) -> Image.Image:
        import cv2
        arr = np.array(img)
        gray = cv2.cvtColor(arr, cv2.COLOR_RGB2GRAY)
        denoised = cv2.fastNlMeansDenoising(gray, None, h=10, templateWindowSize=7,
                                             searchWindowSize=21)
        return Image.fromarray(cv2.cvtColor(denoised, cv2.COLOR_GRAY2RGB))

    # === Akira Kurosawa filters ===

    def _watercolor_filter(self, img: Image.Image) -> Image.Image:
        import cv2
        arr = np.array(img)
        for _ in range(3):
            arr = cv2.bilateralFilter(arr, 9, 75, 75)
        result = cv2.edgePreservingFilter(arr, flags=1, sigma_s=60, sigma_r=0.4)
        return Image.fromarray(result)

    def _brush_texture_overlay(self, img: Image.Image) -> Image.Image:
        arr = np.array(img, dtype=np.float32)
        noise = np.random.normal(0, 8, arr.shape).astype(np.float32)
        result = np.clip(arr + noise, 0, 255).astype(np.uint8)
        return Image.fromarray(result)

    def _saturation_adjust(self, img: Image.Image) -> Image.Image:
        enhancer = ImageEnhance.Color(img)
        return enhancer.enhance(1.4)

    # === J. Todd Anderson filters ===

    def _ink_line_enhance(self, img: Image.Image) -> Image.Image:
        import cv2
        arr = np.array(img)
        gray = cv2.cvtColor(arr, cv2.COLOR_RGB2GRAY)
        edges = cv2.Canny(gray, 50, 150)
        edges_inv = 255 - edges
        edges_rgb = cv2.cvtColor(edges_inv, cv2.COLOR_GRAY2RGB)
        blended = cv2.addWeighted(arr, 0.7, edges_rgb, 0.3, 0)
        return Image.fromarray(blended)

    def _grayscale_convert(self, img: Image.Image) -> Image.Image:
        gray = img.convert("L")
        enhancer = ImageEnhance.Contrast(gray)
        enhanced = enhancer.enhance(1.2)
        return enhanced.convert("RGB")

    def _comic_hatching(self, img: Image.Image) -> Image.Image:
        arr = np.array(img)
        gray = np.mean(arr, axis=2)

        h, w = gray.shape
        hatching = np.ones((h, w), dtype=np.uint8) * 255
        for y in range(h):
            for x in range(w):
                if (x + y) % 6 < 2:
                    hatching[y, x] = 0

        shadow_mask = (gray < 100).astype(np.uint8)

        hatching_rgb = np.stack([hatching] * 3, axis=-1)
        mask_rgb = np.stack([shadow_mask] * 3, axis=-1)

        result = arr.copy().astype(np.float32)
        hatching_f = hatching_rgb.astype(np.float32)
        result = np.where(
            mask_rgb == 1,
            result * 0.65 + hatching_f * 0.35,
            result,
        )
        return Image.fromarray(np.clip(result, 0, 255).astype(np.uint8))
