'use client';

import { useState, useTransition } from 'react';
import { saveCredential, type Credential } from '@/actions/vault';
import { KeyRound, Plus, CheckCircle2, XCircle } from 'lucide-react';

const PROVIDERS = ['gemini', 'openai', 'anthropic', 'runwayml', 'elevenlabs', 'custom'];

interface Props {
  initialCredentials: Credential[];
}

export function VaultManager({ initialCredentials }: Props) {
  const [credentials, setCredentials] = useState<Credential[]>(initialCredentials);
  const [isPending, startTransition] = useTransition();
  const [provider, setProvider] = useState('gemini');
  const [keyName, setKeyName] = useState('default');
  const [apiKey, setApiKey] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!apiKey.trim()) return;
    setFeedback(null);
    startTransition(async () => {
      try {
        const saved = await saveCredential(provider, apiKey.trim(), keyName.trim() || 'default');
        setCredentials(prev => {
          const filtered = prev.filter(c => !(c.provider === provider && c.key_name === keyName));
          return [...filtered, saved];
        });
        setApiKey('');
        setFeedback({ type: 'success', message: `${provider} 키가 저장되었습니다` });
      } catch {
        setFeedback({ type: 'error', message: '저장에 실패했습니다. 서버 연결을 확인해주세요.' });
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Add key form */}
      <form
        onSubmit={handleSave}
        className="rounded-lg border border-[var(--studio-border)] p-6"
        style={{ background: 'var(--studio-bg-surface)' }}
      >
        <h2 className="text-[14px] font-semibold text-[var(--studio-text)] mb-4 flex items-center gap-2">
          <Plus size={15} />
          키 추가
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-[11px] text-[var(--studio-text-dim)] uppercase tracking-wide mb-1.5">
              프로바이더
            </label>
            <select
              value={provider}
              onChange={e => setProvider(e.target.value)}
              className="w-full px-3 py-2 rounded text-[13px] border border-[var(--studio-border)] outline-none focus:border-[var(--studio-accent)]"
              style={{ background: 'var(--studio-bg-base)', color: 'var(--studio-text)' }}
            >
              {PROVIDERS.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] text-[var(--studio-text-dim)] uppercase tracking-wide mb-1.5">
              키 이름
            </label>
            <input
              type="text"
              value={keyName}
              onChange={e => setKeyName(e.target.value)}
              placeholder="default"
              className="w-full px-3 py-2 rounded text-[13px] border border-[var(--studio-border)] outline-none focus:border-[var(--studio-accent)]"
              style={{ background: 'var(--studio-bg-base)', color: 'var(--studio-text)' }}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-[11px] text-[var(--studio-text-dim)] uppercase tracking-wide mb-1.5">
            API 키
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="sk-..."
            required
            className="w-full px-3 py-2 rounded text-[13px] border border-[var(--studio-border)] outline-none focus:border-[var(--studio-accent)]"
            style={{ background: 'var(--studio-bg-base)', color: 'var(--studio-text)' }}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isPending || !apiKey.trim()}
            className="px-4 py-2 rounded-lg text-[12px] font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'var(--studio-accent)', color: '#000' }}
          >
            {isPending ? '저장 중...' : '저장'}
          </button>
          {feedback && (
            <p
              className="text-[12px] flex items-center gap-1.5"
              style={{ color: feedback.type === 'success' ? 'rgb(74,222,128)' : 'rgb(248,113,113)' }}
            >
              {feedback.type === 'success' ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
              {feedback.message}
            </p>
          )}
        </div>
      </form>

      {/* Credentials list */}
      <div
        className="rounded-lg border border-[var(--studio-border)] p-6"
        style={{ background: 'var(--studio-bg-surface)' }}
      >
        <h2 className="text-[14px] font-semibold text-[var(--studio-text)] mb-4 flex items-center gap-2">
          <KeyRound size={15} />
          저장된 키 ({credentials.length})
        </h2>

        {credentials.length === 0 ? (
          <p className="text-[13px] text-[var(--studio-text-dim)]">
            저장된 API 키가 없습니다
          </p>
        ) : (
          <div className="space-y-2">
            {credentials.map(cred => (
              <div
                key={cred.id}
                className="flex items-center gap-3 px-4 py-3 rounded-lg"
                style={{ background: 'var(--studio-bg-hover)' }}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: cred.is_active ? 'rgb(74,222,128)' : 'rgb(248,113,113)' }}
                />
                <span className="text-[13px] font-semibold text-[var(--studio-text)] w-28 shrink-0">
                  {cred.provider}
                </span>
                <span className="text-[12px] text-[var(--studio-text-dim)]">
                  {cred.key_name}
                </span>
                <span
                  className="ml-auto text-[11px] px-2 py-0.5 rounded-full"
                  style={{
                    background: cred.is_active ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)',
                    color: cred.is_active ? 'rgb(74,222,128)' : 'rgb(248,113,113)',
                  }}
                >
                  {cred.is_active ? '활성' : '비활성'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
