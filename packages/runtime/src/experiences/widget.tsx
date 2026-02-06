import {
  createDocumentationMessageGenerator,
  getAppIdAndApiKey,
} from 'instantsearch.js/es/lib/utils';
import { buildExperienceRequest } from './middleware';
import chat from 'instantsearch.js/es/widgets/chat/chat';

import { renderTemplate, renderTool } from './renderer';
import { ExperienceWidget } from './types';

import type { ChatTransport } from 'instantsearch.js/es/connectors/chat/connectChat';
import type { InstantSearch } from 'instantsearch.js/es/types';
import type { TemplateChild } from './renderer';
import type { ExperienceWidgetParams } from './types';

import 'instantsearch.css/components/autocomplete.css';
import 'instantsearch.css/components/chat.css';

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
        // eslint-disable-next-line no-restricted-syntax
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
                return buildExperienceRequest({
                  appId,
                  apiKey,
                  env,
                  experienceId,
                }).then((toolExperience) =>
                  renderTool({ name: toolName, experience: toolExperience })
                );
              })
            )
          ).reduce((acc, tool) => ({ ...acc, ...tool }), {});

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
