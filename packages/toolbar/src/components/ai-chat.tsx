import { createOpenAI } from '@ai-sdk/openai';
import { useChat } from '@ai-sdk/react';
import { DirectChatTransport, ToolLoopAgent } from 'ai';
import { Marked } from 'marked';
import { Fragment } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';

import type { ExperienceApiResponse } from '../types';
import { buildSystemPrompt } from '../ai/system-prompt';
import { describeToolAction, getTools, type ToolCallbacks } from '../ai/tools';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';

const marked = new Marked({
  async: false,
  breaks: true,
});

const STORAGE_KEY = 'algolia-experiences-ai-chat';
const MODEL_STORAGE_KEY = 'algolia-experiences-ai-model';
const DEFAULT_MODEL = 'gpt-4o';
const MODELS = [
  { id: 'gpt-4o', label: 'GPT-4o' },
  { id: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { id: 'gpt-4.1', label: 'GPT-4.1' },
  { id: 'gpt-4.1-mini', label: 'GPT-4.1 Mini' },
  { id: 'gpt-4.1-nano', label: 'GPT-4.1 Nano' },
];

type AiChatProps = {
  experience: ExperienceApiResponse;
  onAddBlock: (type: string) => void;
  onParameterChange: (index: number, key: string, value: unknown) => void;
  onCssVariableChange: (index: number, key: string, value: string) => void;
  onDeleteBlock: (index: number) => void;
};

export function AiChat({
  experience,
  onAddBlock,
  onParameterChange,
  onCssVariableChange,
  onDeleteBlock,
}: AiChatProps) {
  const apiKey = window.__OPENAI_API_KEY__;
  const [model, setModel] = useState(() => {
    const stored = localStorage.getItem(MODEL_STORAGE_KEY);
    if (stored && MODELS.some((m) => m.id === stored)) return stored;
    return DEFAULT_MODEL;
  });
  const [modelPickerOpen, setModelPickerOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const experienceRef = useRef(experience);
  experienceRef.current = experience;

  const onAddBlockRef = useRef(onAddBlock);
  onAddBlockRef.current = onAddBlock;
  const onParameterChangeRef = useRef(onParameterChange);
  onParameterChangeRef.current = onParameterChange;
  const onCssVariableChangeRef = useRef(onCssVariableChange);
  onCssVariableChangeRef.current = onCssVariableChange;
  const onDeleteBlockRef = useRef(onDeleteBlock);
  onDeleteBlockRef.current = onDeleteBlock;

  const callbacks: ToolCallbacks = useMemo(
    () => ({
      onAddBlock: (...args) => onAddBlockRef.current(...args),
      onParameterChange: (...args) => onParameterChangeRef.current(...args),
      onCssVariableChange: (...args) => onCssVariableChangeRef.current(...args),
      onDeleteBlock: (...args) => onDeleteBlockRef.current(...args),
      getExperience: () => experienceRef.current,
    }),
    []
  );

  const transport = useMemo(() => {
    if (!apiKey) {
      return null;
    }

    const openai = createOpenAI({ apiKey });
    const tools = getTools(callbacks);

    const agent = new ToolLoopAgent({
      model: openai.chat(model),
      tools,
      instructions: buildSystemPrompt(),
    });

    return new DirectChatTransport({ agent });
  }, [apiKey, model, callbacks]);

  const initialMessages = useMemo(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);

      if (!stored) {
        return undefined;
      }

      const parsed = JSON.parse(stored);
      if (
        !Array.isArray(parsed) ||
        !parsed.every(
          (m: unknown) =>
            typeof m === 'object' &&
            m !== null &&
            'id' in m &&
            'role' in m &&
            'parts' in m &&
            Array.isArray((m as { parts: unknown }).parts)
        )
      ) {
        sessionStorage.removeItem(STORAGE_KEY);

        return undefined;
      }

      return parsed;
    } catch {
      return undefined;
    }
  }, []);

  const chat = useChat({
    id: 'algolia-experiences',
    transport: transport ?? undefined,
    messages: initialMessages,
  });

  const { messages, setMessages, status, error } = chat;
  const isStreaming = status === 'streaming' || status === 'submitted';

  useEffect(() => {
    if (isStreaming) {
      setModelPickerOpen(false);
    } else {
      inputRef.current?.focus();
    }
  }, [isStreaming]);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // Storage full or unavailable — ignore
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!apiKey) {
    return (
      <div class="flex flex-1 flex-col items-center justify-center gap-3 p-4">
        <Alert>
          <svg
            class="size-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          <AlertTitle>API Key Required</AlertTitle>
          <AlertDescription>
            Set{' '}
            <code class="bg-muted rounded px-1 py-0.5 text-xs">
              window.__OPENAI_API_KEY__
            </code>{' '}
            in your browser console to enable AI mode.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div class="flex flex-1 flex-col overflow-hidden">
      {/* Messages */}
      <div class="flex-1 overflow-y-auto p-4">
        <div class="space-y-3">
          {messages.length === 0 && (
            <div class="text-muted-foreground text-center text-sm py-8">
              Ask me to add, edit, or remove widgets from your experience.
            </div>
          )}
          {messages.map((message) =>
            message.role === 'user' ? (
              <div key={message.id} class="flex justify-end">
                <div class="bg-primary text-primary-foreground max-w-[85%] overflow-hidden break-words rounded-lg px-3 py-2 text-sm">
                  {message.parts.map((part, index) =>
                    part.type === 'text' ? (
                      <div key={index}>{part.text}</div>
                    ) : null
                  )}
                </div>
              </div>
            ) : (
              <Fragment key={message.id}>
                {message.parts.map((part, index) => {
                  if (part.type === 'text') {
                    if (!part.text.trim()) return null;

                    return (
                      <div key={index} class="flex justify-start">
                        <div class="bg-muted max-w-[85%] overflow-hidden break-words rounded-lg px-3 py-2 text-sm">
                          <div
                            class="ai-chat-markdown"
                            dangerouslySetInnerHTML={{
                              __html: marked.parse(
                                escapeHtml(part.text)
                              ) as string,
                            }}
                          />
                        </div>
                      </div>
                    );
                  }

                  if (
                    part.type === 'dynamic-tool' ||
                    part.type.startsWith('tool-')
                  ) {
                    if (!('output' in part) || !part.output) return null;

                    const toolName =
                      'toolName' in part
                        ? String(part.toolName)
                        : part.type.replace(/^tool-/, '');
                    const input =
                      'input' in part
                        ? (part.input as Record<string, unknown>)
                        : undefined;
                    const output = part.output as Record<string, unknown>;

                    return (
                      <details
                        key={index}
                        class="text-muted-foreground border-border rounded-md border px-3 py-2 text-xs group"
                      >
                        <summary class="flex cursor-pointer select-none list-none items-center gap-1.5">
                          <svg
                            class="size-3 shrink-0 transition-transform group-open:rotate-90"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                          <svg
                            class="size-3 shrink-0"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                          </svg>
                          {describeToolAction(toolName, input, output)}
                        </summary>
                        <pre class="mt-2 overflow-x-auto whitespace-pre-wrap border-t pt-2 text-[11px] opacity-70">
                          {JSON.stringify(output, null, 2)}
                        </pre>
                      </details>
                    );
                  }

                  return null;
                })}
              </Fragment>
            )
          )}
          {isStreaming && (
            <div class="flex justify-start">
              <div class="bg-muted rounded-lg px-3 py-2">
                <div class="flex gap-1">
                  <span class="bg-foreground/30 size-1.5 animate-bounce rounded-full [animation-delay:0ms]" />
                  <span class="bg-foreground/30 size-1.5 animate-bounce rounded-full [animation-delay:150ms]" />
                  <span class="bg-foreground/30 size-1.5 animate-bounce rounded-full [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div class="border-t p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const input = form.elements.namedItem(
              'message'
            ) as HTMLInputElement;
            const text = input.value.trim();
            if (!text || isStreaming) return;
            chat.sendMessage({ text });
            input.value = '';
            requestAnimationFrame(() => inputRef.current?.focus());
          }}
        >
          <input
            ref={inputRef}
            name="message"
            type="text"
            placeholder="Ask me to edit your experience"
            class="w-full border-0 bg-transparent px-0 py-1 text-sm outline-none placeholder:text-muted-foreground"
            disabled={isStreaming}
            autoComplete="off"
          />
          <div class="mt-1 flex items-center justify-between">
            <div class="relative flex items-center gap-1">
              <button
                type="button"
                class="flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                onClick={() => setModelPickerOpen(!modelPickerOpen)}
                disabled={isStreaming}
              >
                <svg
                  class="size-3 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M12 8V4H8" />
                  <rect width="16" height="12" x="4" y="8" rx="2" />
                  <path d="M2 14h2" />
                  <path d="M20 14h2" />
                  <path d="M15 13v2" />
                  <path d="M9 13v2" />
                </svg>
                {MODELS.find((m) => m.id === model)?.label ?? model}
                <svg
                  class="size-3 shrink-0 opacity-50"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {modelPickerOpen && (
                <>
                  <div
                    class="fixed inset-0 z-40"
                    onClick={() => setModelPickerOpen(false)}
                  />
                  <div class="absolute bottom-full left-0 z-50 mb-1 min-w-[160px] rounded-lg border bg-background p-1 shadow-md">
                    {MODELS.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors hover:bg-muted"
                        onClick={() => {
                          setModel(m.id);
                          localStorage.setItem(MODEL_STORAGE_KEY, m.id);
                          setModelPickerOpen(false);
                        }}
                      >
                        <span class="flex-1">{m.label}</span>
                        {m.id === model && (
                          <svg
                            class="size-3 shrink-0"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
              {messages.length > 0 && (
                <button
                  type="button"
                  class="rounded-md px-1.5 py-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  disabled={isStreaming}
                  aria-label="Clear conversation"
                  onClick={() => {
                    setMessages([]);
                    sessionStorage.removeItem(STORAGE_KEY);
                  }}
                >
                  <svg
                    class="size-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </button>
              )}
            </div>
            <Button type="submit" disabled={isStreaming} size="icon">
              <svg
                class="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="m5 12 7-7 7 7" />
                <path d="M12 19V5" />
              </svg>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
