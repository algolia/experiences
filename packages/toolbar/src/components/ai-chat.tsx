import { useChat } from '@ai-sdk/react';
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from 'ai';
import { Marked } from 'marked';
import { Fragment } from 'preact';
import { useEffect, useMemo, useRef } from 'preact/hooks';

import { ArrowUp, ChevronRight, Trash2, Wrench } from 'lucide-preact';

import type {
  AddBlockResult,
  BlockPath,
  Environment,
  ExperienceApiResponse,
} from '../types';
import { AGENT_STUDIO } from '../ai/agent-studio-config';
import {
  describeToolAction,
  executeToolCall,
  type ToolCallbacks,
} from '../ai/tools';
import { useToolbarContext } from '../lib/toolbar-context';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';

const marked = new Marked({
  async: false,
  breaks: true,
});

const STORAGE_KEY = 'algolia-experiences-ai-chat';

type ToolCallDetailsProps = {
  toolName: string;
  input: Record<string, unknown> | undefined;
  output: Record<string, unknown>;
};

function ToolCallDetails({ toolName, input, output }: ToolCallDetailsProps) {
  return (
    <details class="text-muted-foreground border-border rounded-md border px-3 py-2 text-xs group">
      <summary class="flex cursor-pointer select-none list-none items-center gap-1.5">
        <ChevronRight class="size-3 shrink-0 transition-transform group-open:rotate-90" />
        <Wrench class="size-3 shrink-0" />
        {describeToolAction(toolName, input, output)}
      </summary>
      <pre class="mt-2 overflow-x-auto whitespace-pre-wrap border-t pt-2 text-[11px] opacity-70">
        {JSON.stringify(output, null, 2)}
      </pre>
    </details>
  );
}

type AiChatProps = {
  env: Environment;
  experience: ExperienceApiResponse;
  onAddBlock: (type: string, targetParentIndex?: number) => AddBlockResult;
  onParameterChange: (path: BlockPath, key: string, value: unknown) => void;
  onDeleteBlock: (path: BlockPath) => void;
  onMoveBlock: (fromPath: BlockPath, toParentIndex: number) => void;
};

export function AiChat({
  env,
  experience,
  onAddBlock,
  onParameterChange,
  onDeleteBlock,
  onMoveBlock,
}: AiChatProps) {
  const { config } = useToolbarContext();
  const configRef = useRef(config);
  configRef.current = config;

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const experienceRef = useRef(experience);
  experienceRef.current = experience;

  const onAddBlockRef = useRef(onAddBlock);
  onAddBlockRef.current = onAddBlock;
  const onParameterChangeRef = useRef(onParameterChange);
  onParameterChangeRef.current = onParameterChange;
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
      onDeleteBlock: (...args) => {
        return onDeleteBlockRef.current(...args);
      },
      onMoveBlock: (...args) => {
        return onMoveBlockRef.current(...args);
      },
      getExperience: () => {
        return experienceRef.current;
      },
      getCredentials: () => {
        return {
          appId: configRef.current.appId,
          apiKey: configRef.current.apiKey,
        };
      },
      getEnv: () => {
        return env;
      },
    };
  }, [env]);

  const transport = useMemo(() => {
    const config = AGENT_STUDIO[env];

    return new DefaultChatTransport({
      api: `${config.baseUrl}/completions?compatibilityMode=ai-sdk-5`,
      headers: {
        'x-algolia-application-id': config.appId,
        'X-Algolia-API-Key': config.searchApiKey,
      },
    });
  }, [env]);

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
    id: `algolia-experiences-${env}`,
    transport,
    messages: initialMessages,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    onToolCall: ({ toolCall }) => {
      // Fire-and-forget: don't await to avoid deadlocking the serial
      // job executor (onToolCall runs inside a stream processing job).
      void executeToolCall(
        toolCall.toolName,
        (toolCall.input as Record<string, unknown>) ?? {},
        callbacks
      )
        .then((output) => {
          return chatRef.current!.addToolOutput({
            tool: toolCall.toolName,
            toolCallId: toolCall.toolCallId,
            output,
          });
        })
        .catch(() => {});
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
              Ask me to add, edit, or remove blocks from your experience.
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
                  <Trash2 class="size-3" />
                </button>
              )}
            </div>
            <Button type="submit" disabled={isStreaming} size="icon">
              <ArrowUp class="size-4" />
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
