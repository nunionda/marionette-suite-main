from __future__ import annotations

from pathlib import Path

from fpdf import FPDF
from PIL import Image, ImageDraw, ImageFont

from .scene_parser import Scene
from .style_selector import ArtistStyle
from .post_processor import PostProcessor


class SheetComposer:
    """Composes storyboard sheets in professional Hollywood format.

    Layout reference: J. Todd Anderson / Coen Brothers style storyboard.
    Each frame gets a full card with header (title + scene/setup info),
    bordered frame image, and bottom caption (shot number + description).
    """

    def __init__(self, columns: int = 3, rows: int = 2, output_width: int = 1920):
        self.columns = columns
        self.rows = rows
        self.output_width = output_width

    def _get_font(self, size: int = 14, bold: bool = False):
        # Korean-capable fonts first, then fallback
        if bold:
            candidates = [
                ("/System/Library/Fonts/AppleSDGothicNeo.ttc", 5),   # Bold
                ("/System/Library/Fonts/Helvetica.ttc", 1),
                ("/Library/Fonts/NotoSansGothic-Regular.ttf", 0),
                ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 0),
            ]
        else:
            candidates = [
                ("/System/Library/Fonts/AppleSDGothicNeo.ttc", 0),   # Regular
                ("/System/Library/Fonts/Helvetica.ttc", 0),
                ("/Library/Fonts/NotoSansGothic-Regular.ttf", 0),
                ("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 0),
            ]
        for path, index in candidates:
            try:
                return ImageFont.truetype(path, size, index=index)
            except Exception:
                continue
        return ImageFont.load_default()

    def _draw_storyboard_card(self, draw: ImageDraw.Draw, sheet: Image.Image,
                               x: int, y: int, card_w: int, card_h: int,
                               img_path: str | None, scene: Scene,
                               style: ArtistStyle, project_name: str,
                               frame_index: int):
        """Draw a single storyboard card in professional format."""

        font_title = self._get_font(13, bold=True)
        font_scene_info = self._get_font(16, bold=True)
        font_shot_num = self._get_font(14, bold=True)
        font_desc = self._get_font(12)

        header_h = 36
        caption_h = 44
        border = 2
        frame_h = card_h - header_h - caption_h

        # --- Card background ---
        draw.rectangle([x, y, x + card_w, y + card_h], fill="white", outline="#999999", width=1)

        # --- Header: title left, SCENE / SET UP right ---
        draw.rectangle([x, y, x + card_w, y + header_h], fill="#f5f5f0")
        draw.line([(x, y + header_h), (x + card_w, y + header_h)], fill="#999999", width=1)

        # Title (left) — project name in quotes
        title_text = f'"{project_name.upper()}"'
        draw.text((x + 8, y + 6), title_text, fill="black", font=font_title)

        # SCENE / SET UP (right)
        scene_num = scene.scene_id.replace("SC", "").lstrip("0") or "1"
        scene_label = f"SCENE  {scene_num}"
        setup_label = f"SET UP  {frame_index}"

        # Measure text for right alignment
        scene_bbox = draw.textbbox((0, 0), scene_label, font=font_scene_info)
        scene_tw = scene_bbox[2] - scene_bbox[0]
        setup_bbox = draw.textbbox((0, 0), setup_label, font=font_scene_info)
        setup_tw = setup_bbox[2] - setup_bbox[0]

        gap = 30
        total_right = scene_tw + gap + setup_tw + 12
        rx = x + card_w - total_right
        draw.text((rx, y + 8), scene_label, fill="black", font=font_scene_info)
        draw.text((rx + scene_tw + gap, y + 8), setup_label, fill="black", font=font_scene_info)

        # --- Frame image ---
        frame_x = x + border
        frame_y = y + header_h
        frame_w = card_w - border * 2

        draw.rectangle([frame_x - 1, frame_y - 1, frame_x + frame_w + 1, frame_y + frame_h + 1],
                       outline="#333333", width=2)

        if img_path and Path(img_path).is_file():
            frame_img = Image.open(img_path).convert("RGB")
            # Center crop to frame aspect ratio (no distortion), then resize
            frame_ratio = frame_w / frame_h
            frame_img = PostProcessor.center_crop(frame_img, frame_ratio)
            frame_img = frame_img.resize((frame_w, frame_h), Image.LANCZOS)
            sheet.paste(frame_img, (frame_x, frame_y))
        else:
            draw.rectangle([frame_x, frame_y, frame_x + frame_w, frame_y + frame_h],
                           fill="#e8e8e8")
            no_img_font = self._get_font(16)
            draw.text((frame_x + frame_w // 2 - 40, frame_y + frame_h // 2 - 10),
                      "No image", fill="#999999", font=no_img_font)

        # --- Caption: shot number + description ---
        cap_y = frame_y + frame_h
        draw.rectangle([x, cap_y, x + card_w, y + card_h], fill="white")
        draw.line([(x, cap_y), (x + card_w, cap_y)], fill="#999999", width=1)

        # Shot number
        shot_text = f"{frame_index}."
        draw.text((x + 8, cap_y + 4), shot_text, fill="black", font=font_shot_num)

        # Camera + description
        parts = []
        if scene.camera_angle and scene.camera_angle != "medium shot":
            parts.append(scene.camera_angle.upper())
        desc = scene.description
        if len(desc) > 80:
            desc = desc[:77] + "..."
        parts.append(desc)
        caption_text = " ".join(parts)
        draw.text((x + 30, cap_y + 4), caption_text, fill="black", font=font_desc)

        # Style note (small, bottom right)
        style_font = self._get_font(9)
        style_text = f"{style.name} / {style.medium}"
        st_bbox = draw.textbbox((0, 0), style_text, font=style_font)
        st_w = st_bbox[2] - st_bbox[0]
        draw.text((x + card_w - st_w - 8, cap_y + 26), style_text,
                  fill="#aaaaaa", font=style_font)

    def compose_grid(self, image_paths: list[str], scenes: list[Scene],
                     style: ArtistStyle, output_path: str,
                     project_name: str = "Storyboard") -> str:
        pad = 16
        card_w = (self.output_width - pad * (self.columns + 1)) // self.columns
        card_h = int(card_w * 0.72)  # Slightly taller than wide for storyboard cards

        frames_per_page = self.columns * self.rows
        pages = []

        for page_start in range(0, len(image_paths), frames_per_page):
            page_imgs = image_paths[page_start:page_start + frames_per_page]
            page_scenes = scenes[page_start:page_start + frames_per_page]

            sheet_h = pad + (card_h + pad) * self.rows
            sheet = Image.new("RGB", (self.output_width, sheet_h), "#e0ddd5")
            draw = ImageDraw.Draw(sheet)

            for idx, (img_path, scene) in enumerate(zip(page_imgs, page_scenes)):
                col = idx % self.columns
                row = idx // self.columns
                x = pad + col * (card_w + pad)
                y = pad + row * (card_h + pad)

                self._draw_storyboard_card(
                    draw, sheet, x, y, card_w, card_h,
                    img_path, scene, style, project_name,
                    frame_index=page_start + idx + 1,
                )

            pages.append(sheet)

        if pages:
            pages[0].save(output_path)
            for i, page in enumerate(pages[1:], 2):
                extra_path = output_path.replace(".png", f"_page{i}.png")
                page.save(extra_path)

        return output_path

    def compose_comparison(self, scene: Scene,
                           style_images: dict[str, tuple[ArtistStyle, str]],
                           output_path: str) -> str:
        n = len(style_images)
        pad = 16
        card_w = (self.output_width - pad * (n + 1)) // n
        card_h = int(card_w * 0.72)

        sheet_h = pad * 2 + card_h
        sheet = Image.new("RGB", (self.output_width, sheet_h), "#e0ddd5")
        draw = ImageDraw.Draw(sheet)

        for idx, (key, (style, img_path)) in enumerate(style_images.items()):
            x = pad + idx * (card_w + pad)
            y = pad

            self._draw_storyboard_card(
                draw, sheet, x, y, card_w, card_h,
                img_path, scene, style, "Style Comparison",
                frame_index=idx + 1,
            )

        sheet.save(output_path)
        return output_path

    def compose_pdf(self, image_paths: list[str], scenes: list[Scene],
                    style: ArtistStyle, output_path: str,
                    project_name: str = "Storyboard") -> str:
        """Compose PDF using pre-rendered storyboard card images."""

        # Render each card as an image first, then place in PDF
        # This avoids fpdf unicode issues entirely
        pad = 16
        card_w = 900
        card_h = int(card_w * 0.72)

        pdf = FPDF(orientation="L", unit="mm", format="A4")
        pdf.set_auto_page_break(auto=False)

        page_w_mm = 277  # A4 landscape usable width
        page_h_mm = 190  # A4 landscape usable height

        cols = min(self.columns, 3)
        rows = min(self.rows, 2)
        frames_per_page = cols * rows

        cell_w_mm = (page_w_mm - 10 * (cols + 1)) / cols
        cell_h_mm = cell_w_mm * 0.72

        for page_start in range(0, len(image_paths), frames_per_page):
            pdf.add_page()
            page_imgs = image_paths[page_start:page_start + frames_per_page]
            page_scenes = scenes[page_start:page_start + frames_per_page]

            for idx, (img_path, scene) in enumerate(zip(page_imgs, page_scenes)):
                # Render card as temp image
                card_img = Image.new("RGB", (card_w, card_h), "#e0ddd5")
                card_draw = ImageDraw.Draw(card_img)
                self._draw_storyboard_card(
                    card_draw, card_img, 0, 0, card_w, card_h,
                    img_path, scene, style, project_name,
                    frame_index=page_start + idx + 1,
                )

                # Save temp
                tmp_path = Path(output_path).parent / f"_tmp_card_{page_start + idx}.png"
                card_img.save(str(tmp_path))

                col = idx % cols
                row = idx // cols
                x_mm = 10 + col * (cell_w_mm + 10)
                y_mm = 8 + row * (cell_h_mm + 8)

                pdf.image(str(tmp_path), x=x_mm, y=y_mm, w=cell_w_mm, h=cell_h_mm)

                # Clean up temp
                tmp_path.unlink(missing_ok=True)

        pdf.output(output_path)
        return output_path
