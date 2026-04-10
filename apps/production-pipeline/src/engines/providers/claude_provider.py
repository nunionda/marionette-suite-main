import os
from typing import Optional, Dict, Any
import anthropic
from ..base import EngineResult
from ..text_engine import TextEngine

class ClaudeProvider(TextEngine):
    """Anthropic Claude 기반 텍스트 엔진 프로바이더"""
    
    def __init__(self, api_key: str = None, model_name: str = "claude-3-5-sonnet-20241022"):
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        self.client = anthropic.Anthropic(api_key=self.api_key)
        self.model_name = model_name

    def generate(self, prompt: str, **kwargs) -> EngineResult:
        try:
            system_prompt = kwargs.get("system_instruction", "")
            message = self.client.messages.create(
                model=self.model_name,
                max_tokens=kwargs.get("max_tokens", 4096),
                system=system_prompt,
                messages=[{"role": "user", "content": prompt}]
            )
            return EngineResult(
                status="success",
                data=message.content[0].text,
                engine_name=f"Claude ({self.model_name})"
            )
        except Exception as e:
            return EngineResult(status="failed", data=str(e), engine_name="Claude")

    async def generate_async(self, prompt: str, **kwargs) -> EngineResult:
        return self.generate(prompt, **kwargs)

    def analyze_script(self, script_text: str, context: Optional[Dict[str, Any]] = None) -> EngineResult:
        return self.generate(f"Analyze: {script_text}")
