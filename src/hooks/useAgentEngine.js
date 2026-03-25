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
  const [generationStatus, setGenerationStatus] = useState('');

  const executeAgent = async (systemPrompt, userPrompt, targetField, isAppend = false, statusLabel = 'Processing...') => {
    // Note: Backend now handles API key via proxy. 
    // apiKey is preserved here for backward compatibility if needed by the adapter, 
    // but the engine no longer blocks execution if it's missing.

    setIsGenerating(true);
    setGenerationStatus(statusLabel);
    
    let accumulatedText = '';
    
    await OpenRouterAdapter.streamChatCompletion(
      apiKey,
      systemPrompt,
      userPrompt,
      // onChunk
      (chunk) => {
        accumulatedText += chunk;
        // Use functional update or pass the incremental chunk if handled by higher level
        onUpdateField(targetField, accumulatedText, isAppend);
      },
      // onError
      (errorMessage) => {
        onUpdateField(targetField, `Error generating content: ${errorMessage}`, isAppend);
        console.error("Agent Engine Error:", errorMessage);
      },
      // onComplete
      async () => {
        if (targetField === 'review' && accumulatedText.includes('[ANALYSIS_JSON]')) {
          try {
            const parts = accumulatedText.split('[ANALYSIS_JSON]');
            let jsonStr = parts[parts.length - 1].trim();
            
            // Clean up markdown code blocks if present
            jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
            
            const analysisData = JSON.parse(jsonStr);
            console.log("✅ Dynamic Analysis Data Extracted:", analysisData);
            onUpdateField('analysisData', analysisData);
          } catch (e) {
            console.warn("⚠️ Failed to parse dynamic analysis JSON. Dashboard will use estimate/mock values.", e);
          }
        }
      }
    );

    setIsGenerating(false);
    setGenerationStatus('');
  };

  return { executeAgent, isGenerating, generationStatus };
};
