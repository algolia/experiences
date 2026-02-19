import { createOpenAI } from '@ai-sdk/openai';
import { useChat } from '@ai-sdk/react';
import { DirectChatTransport, ToolLoopAgent } from 'ai';
import { Marked } from 'marked';
import { useEffect, useMemo, useRef } from 'preact/hooks';

import type { ExperienceApiResponse } from '../types';
import { buildSystemPrompt } from '../ai/system-prompt';
import { getTools, type ToolCallbacks } from '../ai/tools';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';

const marked = new Marked({
  async: false,
  breaks: true,
});

const STORAGE_KEY = 'algolia-experiences-ai-chat';

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
      model: openai.chat('gpt-4o-mini'),
      tools,
      instructions: buildSystemPrompt(),
    });

    return new DirectChatTransport({ agent });
  }, [apiKey, callbacks]);

  const initialMessages = useMemo(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (!stored) return undefined;

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

  const { messages, status, error } = chat;

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

  const isStreaming = status === 'streaming' || status === 'submitted';

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
          {messages.map((message) => (
            <div
              key={message.id}
              class={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                class={`max-w-[85%] overflow-hidden break-words rounded-lg px-3 py-2 text-sm ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {message.parts.map((part, index) => {
                  if (part.type === 'text') {
                    return (
                      <div
                        key={index}
                        class="ai-chat-markdown"
                        dangerouslySetInnerHTML={{
                          __html: marked.parse(escapeHtml(part.text)) as string,
                        }}
                      />
                    );
                  }

                  if (part.type.startsWith('tool-')) {
                    if ('output' in part && part.output) {
                      return (
                        <p
                          key={index}
                          class="text-muted-foreground my-1 text-xs"
                        >
                          Action completed
                        </p>
                      );
                    }
                    return null;
                  }

                  return null;
                })}
              </div>
            </div>
          ))}
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
          class="flex gap-2"
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
          }}
        >
          <input
            name="message"
            type="text"
            placeholder="Ask me to edit your experience"
            class="bg-muted flex-1 rounded-md border-0 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-ring/50 focus-visible:ring-2"
            disabled={isStreaming}
            autoComplete="off"
          />
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
