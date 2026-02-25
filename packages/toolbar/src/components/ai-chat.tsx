import { useChat } from '@ai-sdk/react';
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from 'ai';
import { Marked } from 'marked';
import { Fragment } from 'preact';
import { useEffect, useMemo, useRef } from 'preact/hooks';

import type {
  AddBlockResult,
  BlockPath,
  ExperienceApiResponse,
} from '../types';
import {
  describeToolAction,
  executeToolCall,
  type ToolCallbacks,
} from '../ai/tools';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';

const marked = new Marked({
  async: false,
  breaks: true,
});

const STORAGE_KEY = 'algolia-experiences-ai-chat';
const AGENT_ID = 'e51e9dee-6d2a-4a9b-ae95-1e24292d8458';

type ToolCallDetailsProps = {
  toolName: string;
  input: Record<string, unknown> | undefined;
  output: Record<string, unknown>;
};

function ToolCallDetails({ toolName, input, output }: ToolCallDetailsProps) {
  return (
    <details class="text-muted-foreground border-border rounded-md border px-3 py-2 text-xs group">
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

type AiChatProps = {
  appId: string;
  apiKey: string;
  experience: ExperienceApiResponse;
  onAddBlock: (type: string, targetParentIndex?: number) => AddBlockResult;
  onParameterChange: (path: BlockPath, key: string, value: unknown) => void;
  onCssVariableChange: (path: BlockPath, key: string, value: string) => void;
  onDeleteBlock: (path: BlockPath) => void;
  onMoveBlock: (fromPath: BlockPath, toParentIndex: number) => void;
};

export function AiChat({
  appId,
  apiKey,
  experience,
  onAddBlock,
  onParameterChange,
  onCssVariableChange,
  onDeleteBlock,
  onMoveBlock,
}: AiChatProps) {
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
  const onMoveBlockRef = useRef(onMoveBlock);
  onMoveBlockRef.current = onMoveBlock;

  const callbacks: ToolCallbacks = useMemo(() => {
    return {
      onAddBlock: (...args) => {
        return onAddBlockRef.current(...args);
      },
      onParameterChange: (...args) => {
        return onParameterChangeRef.current(...args);
      },
      onCssVariableChange: (...args) => {
        return onCssVariableChangeRef.current(...args);
      },
      onDeleteBlock: (...args) => {
        return onDeleteBlockRef.current(...args);
      },
      onMoveBlock: (...args) => {
        return onMoveBlockRef.current(...args);
      },
      getExperience: () => {
        return experienceRef.current;
      },
    };
  }, []);

  const transport = useMemo(() => {
    return new DefaultChatTransport({
      api: `https://agent-studio-staging.eu.algolia.com/1/agents/${AGENT_ID}/completions?compatibilityMode=ai-sdk-5`,
      headers: {
        'x-algolia-application-id': appId,
        'X-Algolia-API-Key': apiKey,
      },
    });
  }, [appId, apiKey]);

  const initialMessages = useMemo(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);

      if (!stored) {
        return undefined;
      }

      const parsed = JSON.parse(stored);
      if (
        !Array.isArray(parsed) ||
        !parsed.every((msg: unknown) => {
          return (
            typeof msg === 'object' &&
            msg !== null &&
            'id' in msg &&
            'role' in msg &&
            'parts' in msg &&
            Array.isArray((msg as { parts: unknown }).parts)
          );
        })
      ) {
        sessionStorage.removeItem(STORAGE_KEY);

        return undefined;
      }

      return parsed;
    } catch {
      return undefined;
    }
  }, []);

  const chatRef = useRef<ReturnType<typeof useChat>>();

  const chat = useChat({
    id: 'algolia-experiences',
    transport,
    messages: initialMessages,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    onToolCall: ({ toolCall }) => {
      const result = executeToolCall(
        toolCall.toolName,
        (toolCall.input as Record<string, unknown>) ?? {},
        callbacks
      );
      // Fire-and-forget: don't await to avoid deadlocking the serial
      // job executor (onToolCall runs inside a stream processing job).
      void chatRef.current!.addToolOutput({
        tool: toolCall.toolName,
        toolCallId: toolCall.toolCallId,
        output: result,
      });
    },
  });
  chatRef.current = chat;

  const { messages, setMessages, status, error } = chat;
  const isStreaming = status === 'streaming' || status === 'submitted';

  useEffect(() => {
    if (!isStreaming) {
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
          {messages.map((message) => {
            return message.role === 'user' ? (
              <div key={message.id} class="flex justify-end">
                <div class="bg-primary text-primary-foreground max-w-[85%] overflow-hidden break-words rounded-lg px-3 py-2 text-sm">
                  {message.parts.map((part, index) => {
                    return part.type === 'text' ? (
                      <div key={index}>{part.text}</div>
                    ) : null;
                  })}
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

                    return (
                      <ToolCallDetails
                        key={index}
                        toolName={toolName}
                        input={input}
                        output={part.output as Record<string, unknown>}
                      />
                    );
                  }

                  return null;
                })}
              </Fragment>
            );
          })}
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
          onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const input = form.elements.namedItem(
              'message'
            ) as HTMLInputElement;
            const text = input.value.trim();
            if (!text || isStreaming) return;
            chat.sendMessage({ text });
            input.value = '';
            requestAnimationFrame(() => {
              return inputRef.current?.focus();
            });
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
            <div class="flex items-center gap-1">
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
