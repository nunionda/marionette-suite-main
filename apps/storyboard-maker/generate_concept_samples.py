#!/usr/bin/env python3
"""Generate sample concept art images for each designer × category."""

import os
import sys
import time
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# --- Providers (simplified from image_generator.py) ---

def generate_gemini(prompt: str, api_key: str) -> bytes | None:
    from google import genai
    from google.genai import types

    client = genai.Client(api_key=api_key)
    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash-preview-05-20",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_modalities=["image", "text"],
                    temperature=0.9,
                ),
            )
            for part in response.candidates[0].content.parts:
                if hasattr(part, "inline_data") and part.inline_data:
                    return part.inline_data.data
            return None
        except Exception as e:
            if "429" in str(e) and attempt < max_retries - 1:
                wait = 25 * (attempt + 1)
                print(f"  ⏳ Rate limited, waiting {wait}s ({attempt+2}/{max_retries})...")
                time.sleep(wait)
            else:
                print(f"  ❌ Error: {e}")
                return None


def generate_pollinations(prompt: str) -> bytes | None:
    import urllib.request
    import urllib.parse
    encoded = urllib.parse.quote(prompt)
    url = f"https://image.pollinations.ai/prompt/{encoded}?width=1024&height=768&model=flux&nologo=true"
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=60) as resp:
            return resp.read()
    except Exception as e:
        print(f"  ❌ Pollinations error: {e}")
        return None


# --- Sample Definitions ---
# Each entry: (designer_key, category, prompt)

SCENE = "A lone warrior stands at the edge of a crumbling futuristic citadel overlooking a vast alien canyon at twilight"

SAMPLES = [
    # Character Design
    ("mccaig_char", "character",
     "Character concept design sheet. Iain McCaig style, pencil and ink illustration, "
     "narrative-driven character design. A mysterious warrior with intricate facial tattoos "
     "inspired by muscle anatomy, wearing battle-worn armor with cultural symbolism. "
     "Fear and beauty balance, dramatic side-lighting on portrait. Film-quality character sheet, "
     "front and three-quarter view. Dark background."),

    ("giger_char", "character",
     "H.R. Giger biomechanical creature concept. Dark surreal airbrush technique. "
     "Alien creature with elongated skull, eyeless face, ribbed exoskeleton, "
     "organic-mechanical fusion body. Industrial bone texture, monochrome nightmare aesthetic. "
     "Necronom IV inspired. Full body concept art sheet on dark background."),

    ("mcquarrie_char", "character",
     "Ralph McQuarrie style character concept art. Gouache painting technique. "
     "A heroic space pilot in iconic helmet and flight suit, standing against a dramatic "
     "sunset sky with two suns. Warm and cool light contrast, atmospheric lighting, "
     "Star Wars retro-futurism aesthetic. Painterly brushstrokes, cinematic composition."),

    ("crash_char", "character",
     "Crash McCreery style creature concept. Detailed pencil rendering with luminous "
     "graphite work. A massive alien predator in dynamic bird-of-prey attack stance, "
     "anatomically accurate warm-blooded creature. Cinematic lighting, realistic texture detail. "
     "Motion study pose, Stan Winston Studio quality. White background."),

    ("page_char", "character",
     "Neville Page style creature design. ZBrush digital sculpture render. "
     "Biologically plausible alien with bioluminescent skin patterns, functional creature anatomy, "
     "evolutionary design basis. Pandora ecosystem creature with translucent wing membranes. "
     "Scientific illustration quality, industrial design aesthetic applied to biology."),

    # Environment Design
    ("mead_env", "environment",
     "Syd Mead visual futurist environment concept art. Gouache painting style. "
     "Dystopian cyberpunk cityscape with neon-lit rain-slicked streets, layered vertical urbanism, "
     "monolithic corporate towers piercing through fog. Wet reflective surfaces catching "
     "neon light everywhere. Blade Runner aesthetic, atmospheric fog and steam. "
     "Flying vehicles between buildings. Cinematic wide shot."),

    ("moebius_env", "environment",
     "Moebius Jean Giraud style environment concept. Intricate pen and ink detail. "
     "A lived-in futuristic city street with dense visual information layers — crowded market stalls, "
     "multicultural inhabitants, weathered buildings with exposed pipes. Used future aesthetic, "
     "French bande dessinee world-building. Cross-hatching on architecture."),

    ("chiang_env", "environment",
     "Doug Chiang style environment design. Cultural reference architecture. "
     "An Art Nouveau sci-fi palace on a lush green planet, with curved organic towers "
     "and chrome domed roofs reflecting twin moons. Systematic design language, "
     "Star Wars prequel aesthetic. Environmental storytelling. Digital painting, cinematic wide shot."),

    ("foss_env", "environment",
     "Chris Foss style sci-fi environment. Bold vivid colors, airbrush technique. "
     "A massive asymmetric spaceship docking at a colorful orbital station against a nebula. "
     "Checkered pattern on hull, postmodern science fiction. "
     "Giant scale industrial structure, retro sci-fi color palette. Cosmic landscape."),

    ("cobb_env", "environment",
     "Ron Cobb style industrial sci-fi interior. Technical pen drawing style. "
     "A blue-collar space station control room with narrow corridors, exposed pipes, "
     "fluorescent lighting, functional utilitarian panels and screens. "
     "Nostromo Alien interior aesthetic, practical engineering detail. Lived-in workspace."),

    # Prop Design
    ("mead_prop", "prop",
     "Syd Mead style prop concept design. Industrial design rendering, gouache hand-painted. "
     "A futuristic flying vehicle (spinner) with chrome body, glass canopy, and glowing "
     "thrust vents. Multiple angle views: front, side, three-quarter. "
     "Retro-futuristic gadget quality, product design precision. Clean background."),

    ("cobb_prop", "prop",
     "Ron Cobb style prop design. Technical pen and ink drawing. "
     "A homemade time-travel device with exposed wiring, vacuum tubes, LED readouts, "
     "and makeshift components bolted to a control panel. Functional blueprint quality, "
     "lived-in industrial aesthetic. Weathered mechanical device. Multiple views. Clean background."),

    ("chiang_prop", "prop",
     "Doug Chiang style vehicle prop design. Clean digital painting. "
     "An elegant Art Deco starfighter with chrome nacelles and sweeping curves, "
     "faction color coding in silver and gold. Three-second recognizable silhouette. "
     "Star Wars prequel aesthetic. Multiple angle concept sheet. Clean background."),

    ("giger_prop", "prop",
     "H.R. Giger biomechanical prop concept. Dark surreal airbrush style. "
     "An alien chair-organism that merges bone, metal pipes, and organic tissue. "
     "Is it furniture or a living creature? Ambiguous living prop. Ribbed exoskeletal texture. "
     "Space Jockey chair aesthetic. Monochrome on dark background."),

    ("foss_prop", "prop",
     "Chris Foss style spaceship design. Vivid primary colors, airbrush metallic rendering. "
     "A giant asymmetric cargo hauler with bold checkered blue-and-yellow hull pattern. "
     "Postmodern sci-fi vehicle, massive scale. Retro sci-fi color palette. "
     "Three-quarter view against starfield background."),
]

def main():
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("Gemini_Api_Key")
    if not api_key:
        print("❌ GEMINI_API_KEY not found")
        sys.exit(1)

    out_dir = Path("gallery/samples")
    out_dir.mkdir(parents=True, exist_ok=True)

    # Check which samples already exist
    remaining = []
    for key, cat, prompt in SAMPLES:
        out_path = out_dir / f"{key}.png"
        if out_path.exists():
            print(f"  ✅ {key} — already exists, skipping")
        else:
            remaining.append((key, cat, prompt))

    if not remaining:
        print("✅ All samples already generated!")
        return

    print(f"\n🎨 Generating {len(remaining)} concept art samples...\n")

    for i, (key, cat, prompt) in enumerate(remaining):
        print(f"[{i+1}/{len(remaining)}] Generating {key} ({cat})...")

        data = generate_gemini(prompt, api_key)

        if not data:
            print(f"  ⚠️  Gemini failed, trying Pollinations...")
            data = generate_pollinations(prompt)

        if data:
            out_path = out_dir / f"{key}.png"
            out_path.write_bytes(data)
            print(f"  ✅ Saved → {out_path} ({len(data)//1024}KB)")
        else:
            print(f"  ❌ Failed to generate {key}")

        # Rate limit delay
        if i < len(remaining) - 1:
            print(f"  ⏳ Waiting 8s for rate limit...")
            time.sleep(8)

    print(f"\n🎉 Done! Samples saved to {out_dir}/")

if __name__ == "__main__":
    main()
