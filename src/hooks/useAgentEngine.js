// src/hooks/useAgentEngine.js
import { useState } from 'react';
import { OpenRouterAdapter } from '../infrastructure/OpenRouterAdapter';

/**
 * useAgentEngine
 * 비즈니스 UseCase (Agent Orchestration Context)를 담당하는 Application 레이어(Custom Hook).
 * 생성 상태(isGenerating), API 에러 핸들링, 그리고 Adapter 호출을 UI 컴포넌트로부터 캡슐화합니다.
 */
export const useAgentEngine = (apiKey, onUpdateField) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const executeAgent = async (systemPrompt, userPrompt, targetField) => {
    if (!apiKey) {
      alert("⚠️ OpenRouter API Key를 입력해주세요.");
      return;
    }

    const cleanApiKey = apiKey.replace(/^Bearer\s+/i, "").trim().replace(/[^\x00-\x7F]/g, "");
    if (!cleanApiKey) {
      alert("⚠️ 입력하신 API Key가 유효하지 않습니다. (영문/숫자로만 이루어진 정상적인 키를 입력해주세요)");
      return;
    }

    setIsGenerating(true);
    onUpdateField(targetField, ''); // 초기화
    let accumulatedText = '';

    await OpenRouterAdapter.streamChatCompletion(
      cleanApiKey,
      systemPrompt,
      userPrompt,
      // onChunk
      (chunk) => {
        accumulatedText += chunk;
        onUpdateField(targetField, accumulatedText);
      },
      // onError
      (errorMessage) => {
        onUpdateField(targetField, `Error generating content: ${errorMessage}`);
        console.error("Agent Engine Error:", errorMessage);
      },
      // onComplete
      () => {
        // Optional completion hook
      }
    );

    setIsGenerating(false);
  };

  return { executeAgent, isGenerating };
};
