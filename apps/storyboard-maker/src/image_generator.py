from __future__ import annotations

import os
import time
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Optional

from .prompt_engine import PromptBundle


class ImageProvider(ABC):
    @abstractmethod
    def generate(self, prompt: str, negative_prompt: str,
                 reference_image: str | None = None) -> bytes | None:
        ...

    @abstractmethod
    def is_available(self) -> bool:
        ...

    @property
    @abstractmethod
    def name(self) -> str:
        ...

    @property
    def supports_img2img(self) -> bool:
        return False

    @property
    def rate_limit_delay(self) -> float:
        return 0.0


class Gemini31FlashImageProvider(ImageProvider):
    """Google Gemini 3.1 Flash Image — ELO 1257, free tier, primary."""

    def __init__(self):
        self._api_key = os.getenv("GEMINI_API_KEY") or os.getenv("Gemini_Api_Key")
        self._client = None
        self._model = "gemini-3.1-flash-image-preview"

    @property
    def name(self) -> str:
        return "Gemini 3.1 Flash Image"

    @property
    def rate_limit_delay(self) -> float:
        return 7.0

    def is_available(self) -> bool:
        if not self._api_key:
            return False
        try:
            from google import genai
            self._client = genai.Client(api_key=self._api_key)
            return True
        except Exception:
            return False

    def generate(self, prompt: str, negative_prompt: str,
                 reference_image: str | None = None) -> bytes | None:
        from google import genai
        from google.genai import types

        if not self._client:
            self._client = genai.Client(api_key=self._api_key)

        full_prompt = prompt
        if negative_prompt:
            full_prompt += f"\n\nAvoid: {negative_prompt}"

        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = self._client.models.generate_content(
                    model=self._model,
                    contents=full_prompt,
                    config=types.GenerateContentConfig(
                        response_modalities=["image", "text"],
                        temperature=0.8,
                    ),
                )
                for part in response.candidates[0].content.parts:
                    if hasattr(part, "inline_data") and part.inline_data:
                        return part.inline_data.data
                return None
            except Exception as e:
                if "429" in str(e) and attempt < max_retries - 1:
                    wait = 20 * (attempt + 1)
                    print(f"  ⏳ 할당량 초과, {wait}초 후 재시도 ({attempt + 2}/{max_retries})...")
                    time.sleep(wait)
                else:
                    raise


class GeminiProvider(ImageProvider):
    """Google Gemini 2.5 Flash Image — free tier, secondary."""

    def __init__(self):
        self._api_key = os.getenv("GEMINI_API_KEY") or os.getenv("Gemini_Api_Key")
        self._client = None
        self._model = "gemini-2.5-flash-image"

    @property
    def name(self) -> str:
        return "Gemini 2.5 Flash Image"

    @property
    def rate_limit_delay(self) -> float:
        return 7.0

    def is_available(self) -> bool:
        if not self._api_key:
            return False
        try:
            from google import genai
            self._client = genai.Client(api_key=self._api_key)
            return True
        except Exception:
            return False

    def generate(self, prompt: str, negative_prompt: str,
                 reference_image: str | None = None) -> bytes | None:
        from google import genai
        from google.genai import types

        if not self._client:
            self._client = genai.Client(api_key=self._api_key)

        full_prompt = prompt
        if negative_prompt:
            full_prompt += f"\n\nAvoid: {negative_prompt}"

        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = self._client.models.generate_content(
                    model=self._model,
                    contents=full_prompt,
                    config=types.GenerateContentConfig(
                        response_modalities=["image", "text"],
                        temperature=0.8,
                    ),
                )
                for part in response.candidates[0].content.parts:
                    if hasattr(part, "inline_data") and part.inline_data:
                        return part.inline_data.data
                return None
            except Exception as e:
                if "429" in str(e) and attempt < max_retries - 1:
                    wait = 20 * (attempt + 1)
                    print(f"  ⏳ 할당량 초과, {wait}초 후 재시도 ({attempt + 2}/{max_retries})...")
                    time.sleep(wait)
                else:
                    raise


class OpenRouterImageProvider(ImageProvider):
    """OpenRouter — Gemini image models via separate quota (free/near-free)."""

    # Fallback through image-capable models on OpenRouter
    MODELS = [
        "google/gemini-3.1-flash-image-preview",   # Nano Banana 2, cheapest
        "google/gemini-2.5-flash-image",            # Nano Banana
        "google/gemini-3-pro-image-preview",        # Nano Banana Pro
    ]

    def __init__(self):
        self._api_key = os.getenv("OPENROUTER_API_KEY")
        self._base_url = "https://openrouter.ai/api/v1"

    @property
    def name(self) -> str:
        return "OpenRouter"

    @property
    def rate_limit_delay(self) -> float:
        return 5.0

    def is_available(self) -> bool:
        return bool(self._api_key)

    def generate(self, prompt: str, negative_prompt: str,
                 reference_image: str | None = None) -> bytes | None:
        import base64
        import json
        import urllib.request
        import urllib.error

        full_prompt = prompt
        if negative_prompt:
            full_prompt += f"\n\nAvoid: {negative_prompt}"
        full_prompt += "\n\nGenerate this as an image."

        for model_id in self.MODELS:
            try:
                print(f"    🔀 OpenRouter → {model_id.split('/')[-1]}")
                payload = {
                    "model": model_id,
                    "messages": [
                        {"role": "user", "content": full_prompt}
                    ],
                }
                data = json.dumps(payload).encode()
                req = urllib.request.Request(
                    f"{self._base_url}/chat/completions",
                    data=data,
                    headers={
                        "Authorization": f"Bearer {self._api_key}",
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://github.com/marionette-dev/storyboard-concept-maker",
                        "X-Title": "Storyboard Concept Maker",
                    },
                )
                with urllib.request.urlopen(req, timeout=120) as resp:
                    result = json.loads(resp.read())

                choices = result.get("choices", [])
                if not choices:
                    continue

                message = choices[0].get("message", {})
                content = message.get("content")

                # Check for multimodal response with image parts
                if isinstance(content, list):
                    for part in content:
                        if isinstance(part, dict) and part.get("type") == "image_url":
                            url_data = part.get("image_url", {}).get("url", "")
                            if url_data.startswith("data:image"):
                                b64 = url_data.split(",", 1)[1]
                                return base64.b64decode(b64)
                        elif isinstance(part, dict) and part.get("type") == "image":
                            b64 = part.get("data") or part.get("image", "")
                            if b64:
                                return base64.b64decode(b64)

                # Some providers return base64 inline_data
                if isinstance(content, str) and len(content) > 1000:
                    try:
                        return base64.b64decode(content)
                    except Exception:
                        pass

            except urllib.error.HTTPError as e:
                if e.code == 429:
                    print(f"    ⏳ OpenRouter 할당량 초과 ({model_id.split('/')[-1]})")
                    continue
                print(f"    ❌ OpenRouter 오류: {e.code} {e.reason}")
                continue
            except Exception as e:
                print(f"    ❌ OpenRouter 오류: {e}")
                continue

        return None


class HuggingFaceProvider(ImageProvider):
    """HuggingFace Free Inference API — FLUX.2 Dev or SDXL fallback."""

    # Ordered by quality: FLUX.2 Dev > SDXL
    MODELS = [
        "black-forest-labs/FLUX.1-dev",
        "stabilityai/stable-diffusion-xl-base-1.0",
    ]

    def __init__(self):
        self._token = os.getenv("HUGGINGFACE_API_TOKEN")

    @property
    def name(self) -> str:
        return "HuggingFace"

    @property
    def supports_img2img(self) -> bool:
        return True

    @property
    def rate_limit_delay(self) -> float:
        return 3.0

    def is_available(self) -> bool:
        if not self._token:
            return False
        try:
            from huggingface_hub import InferenceClient
            client = InferenceClient(token=self._token)
            return client is not None
        except Exception:
            return False

    def generate(self, prompt: str, negative_prompt: str,
                 reference_image: str | None = None) -> bytes | None:
        from huggingface_hub import InferenceClient
        import io

        client = InferenceClient(token=self._token)

        for model in self.MODELS:
            try:
                print(f"    🤗 HuggingFace → {model.split('/')[-1]}")
                if reference_image and os.path.isfile(reference_image):
                    image = client.image_to_image(
                        reference_image,
                        prompt=prompt,
                        negative_prompt=negative_prompt or None,
                        model=model,
                    )
                else:
                    image = client.text_to_image(
                        prompt=prompt,
                        negative_prompt=negative_prompt or None,
                        model=model,
                    )

                if image:
                    buf = io.BytesIO()
                    image.save(buf, format="PNG")
                    return buf.getvalue()
            except Exception as e:
                err_str = str(e)
                if "503" in err_str or "loading" in err_str.lower():
                    print(f"    ⏳ 모델 로딩 중: {model.split('/')[-1]}")
                else:
                    print(f"    ❌ HF 오류 ({model.split('/')[-1]}): {e}")
                continue

        return None


class PollinationsProvider(ImageProvider):
    """Pollinations.ai — completely free, no API key, FLUX model."""

    def __init__(self):
        self._base_url = "https://image.pollinations.ai/prompt"

    @property
    def name(self) -> str:
        return "Pollinations (FLUX)"

    @property
    def rate_limit_delay(self) -> float:
        return 3.0

    def is_available(self) -> bool:
        return True  # Always available, no key needed

    def generate(self, prompt: str, negative_prompt: str,
                 reference_image: str | None = None) -> bytes | None:
        import urllib.parse
        import urllib.request

        full_prompt = prompt
        if negative_prompt:
            full_prompt += f". Avoid: {negative_prompt}"

        encoded = urllib.parse.quote(full_prompt)
        url = f"{self._base_url}/{encoded}?width=1024&height=576&model=flux&nologo=true&seed={int(time.time())}"

        try:
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req, timeout=120) as resp:
                content_type = resp.headers.get("Content-Type", "")
                if "image" in content_type:
                    return resp.read()
        except Exception as e:
            print(f"    ❌ Pollinations 오류: {e}")

        return None


class OllamaProvider(ImageProvider):
    """Ollama local — offline fallback."""

    def __init__(self):
        self._model = "sdxl"

    @property
    def name(self) -> str:
        return "Ollama"

    @property
    def rate_limit_delay(self) -> float:
        return 0.0

    def is_available(self) -> bool:
        try:
            import ollama
            ollama.list()
            return True
        except Exception:
            return False

    def generate(self, prompt: str, negative_prompt: str,
                 reference_image: str | None = None) -> bytes | None:
        try:
            import ollama
            response = ollama.generate(model=self._model, prompt=prompt)
            if hasattr(response, "images") and response.images:
                import base64
                return base64.b64decode(response.images[0])
        except Exception:
            pass
        return None


class ImageGenerator:
    def __init__(self, output_dir: str = "output"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.providers: list[ImageProvider] = [
            Gemini31FlashImageProvider(),   # 1st: Gemini 3.1 Flash Image (ELO 1257, free)
            GeminiProvider(),               # 2nd: Gemini 2.5 Flash Image (free)
            OpenRouterImageProvider(),      # 3rd: OpenRouter → Gemini models (별도 할당량)
            HuggingFaceProvider(),          # 4th: HuggingFace FLUX.1 Dev / SDXL (free)
            PollinationsProvider(),         # 5th: Pollinations.ai FLUX (free, no key)
            OllamaProvider(),              # 6th: Ollama local (offline)
        ]

    def generate_image(self, bundle: PromptBundle,
                       reference_image_path: str | None = None) -> str | None:
        for provider in self.providers:
            if not provider.is_available():
                print(f"  ⏭ {provider.name}: 사용 불가 (API 키 없음 또는 연결 실패)")
                continue

            try:
                print(f"  🎨 {provider.name}으로 생성 중: {bundle.output_filename}")
                ref = reference_image_path if provider.supports_img2img else None
                image_bytes = provider.generate(
                    bundle.positive_prompt, bundle.negative_prompt, ref
                )

                if image_bytes:
                    return self._save_image(image_bytes, bundle.output_filename)

                print(f"  ⚠️  {provider.name}: 이미지 반환 없음")
            except Exception as e:
                print(f"  ❌ {provider.name} 오류: {e}")

            if provider.rate_limit_delay > 0:
                time.sleep(provider.rate_limit_delay)

        print(f"  ❌ 모든 프로바이더 실패: {bundle.output_filename}")
        return None

    def generate_batch(self, bundles: list[PromptBundle],
                       reference_dir: str | None = None) -> list[str | None]:
        results = []
        total = len(bundles)

        for i, bundle in enumerate(bundles, 1):
            print(f"\n[{i}/{total}] {bundle.scene.scene_id} — {bundle.style.name}")

            ref_path = None
            if reference_dir:
                ref_candidate = os.path.join(reference_dir, bundle.style.key)
                if os.path.isdir(ref_candidate):
                    refs = [f for f in os.listdir(ref_candidate)
                            if f.endswith((".png", ".jpg", ".jpeg"))]
                    if refs:
                        ref_path = os.path.join(ref_candidate, refs[0])

            result = self.generate_image(bundle, ref_path)
            results.append(result)

            # Rate limiting between calls
            if result and i < total:
                for provider in self.providers:
                    if provider.is_available() and provider.rate_limit_delay > 0:
                        time.sleep(provider.rate_limit_delay)
                        break

        return results

    def _save_image(self, image_bytes: bytes, filename: str) -> str:
        filepath = self.output_dir / filename
        with open(filepath, "wb") as f:
            f.write(image_bytes)
        print(f"  ✅ 저장됨: {filepath}")
        return str(filepath)
