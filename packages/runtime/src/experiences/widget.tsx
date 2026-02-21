import {
  createDocumentationMessageGenerator,
  getAppIdAndApiKey,
} from 'instantsearch.js/es/lib/utils';
import { getExperience } from './get-experience';
import chat from 'instantsearch.js/es/widgets/chat/chat';
import { EXPERIMENTAL_autocomplete } from 'instantsearch.js/es/widgets/autocomplete/autocomplete';

import { renderTemplate, renderTool } from './renderer';
import type { ExperienceWidget } from './types';

import type { ChatTransport } from 'instantsearch.js/es/connectors/chat/connectChat';
import type { InstantSearch } from 'instantsearch.js/es/types';
import type { TemplateChild } from './renderer';
import type { ExperienceWidgetParams } from './types';

// TODO: Serve CSS from a CDN with proper MIME type and load via <link> from the
// loader instead of inlining it in JS. GitHub release downloads serve as
// application/octet-stream which browsers reject for stylesheets. Remove the
// __CHAT_CSS__ define in tsdown.config.ts and this <style> injection once we
// have a proper CDN setup.
declare const __CHAT_CSS__: string;
declare const __AUTOCOMPLETE_CSS__: string;
(() => {
  const style = document.createElement('style');
  style.textContent = __CHAT_CSS__ + __AUTOCOMPLETE_CSS__;
  document.head.appendChild(style);
})();

const withUsage = createDocumentationMessageGenerator({ name: 'experience' });

export default (function experience(widgetParams: ExperienceWidgetParams) {
  const { id } = widgetParams || {};

  if (!id) {
    throw new Error(withUsage('The `id` option is required.'));
  }

  return {
    $$type: 'ais.experience',
    $$widgetType: 'ais.experience',
    $$widgetParams: widgetParams,
    $$supportedWidgets: {
      'ais.chat': {
        widget: chat,
        async transformParams(params, { env, instantSearchInstance }) {
          const {
            itemTemplate,
            agentId,
            toolRenderings = {},
            ...rest
          } = params as typeof params & {
            toolRenderings: { [key: string]: string };
          };

          const [appId, apiKey] = getAppIdAndApiKey(
            instantSearchInstance.client
          ) as [string, string];
          const tools = (
            await Promise.all(
              Object.entries(toolRenderings).map(([toolName, experienceId]) => {
                return getExperience({
                  appId,
                  apiKey,
                  env,
                  experienceId,
                }).then((toolExperience) => {
                  return renderTool({
                    name: toolName,
                    experience: toolExperience,
                  });
                });
              })
            )
          ).reduce((acc, tool) => {
            return { ...acc, ...tool };
          }, {});

          return Promise.resolve({
            ...createAgentConfig(instantSearchInstance, env, agentId as string),
            ...rest,
            templates: {
              ...(rest.templates as Record<string, unknown>),
              ...(itemTemplate
                ? { item: renderTemplate(itemTemplate as TemplateChild[]) }
                : {}),
            },
            tools,
          });
        },
      },
      'ais.autocomplete': {
        widget: EXPERIMENTAL_autocomplete,
        async transformParams(params) {
          const { showSuggestions, ...rest } = params as typeof params & {
            showSuggestions?: {
              searchPageUrl?: string;
              queryParam?: string;
              indexName?: string;
            };
          };

          return Promise.resolve({
            ...rest,
            ...(showSuggestions
              ? {
                  showSuggestions: {
                    indexName: showSuggestions.indexName,
                    ...(showSuggestions.searchPageUrl
                      ? {
                          getURL: (item: { query: string }) => {
                            const url = new URL(
                              showSuggestions.searchPageUrl!,
                              window.location.origin
                            );
                            url.searchParams.set(
                              showSuggestions.queryParam ?? 'q',
                              item.query
                            );
                            return url.toString();
                          },
                        }
                      : {}),
                  },
                }
              : {}),
          });
        },
      },
    },
    render: () => {},
    dispose: () => {},
  } satisfies ExperienceWidget;
});

function createAgentConfig(
  instantSearchInstance: InstantSearch,
  env: 'beta' | 'prod',
  agentId: string
): ChatTransport {
  if (env === 'prod') {
    return { agentId };
  }

  const [appId, apiKey] = getAppIdAndApiKey(instantSearchInstance.client);

  return {
    transport: {
      api: `https://agent-studio-staging.eu.algolia.com/1/agents/${agentId}/completions?compatibilityMode=ai-sdk-5`,
      headers: {
        'x-algolia-application-id': appId!,
        'x-algolia-api-key': apiKey!,
      },
    },
  };
}
