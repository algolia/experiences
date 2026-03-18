import {
  createDocumentationMessageGenerator,
  getAppIdAndApiKey,
} from 'instantsearch.js/es/lib/utils';
import { getExperience } from './get-experience';
import { carousel } from 'instantsearch.js/es/templates';
import chat from 'instantsearch.js/es/widgets/chat/chat';
import configure from 'instantsearch.js/es/widgets/configure/configure';
import hits from 'instantsearch.js/es/widgets/hits/hits';
import infiniteHits from 'instantsearch.js/es/widgets/infinite-hits/infinite-hits';
import menu from 'instantsearch.js/es/widgets/menu/menu';
import { EXPERIMENTAL_autocomplete } from 'instantsearch.js/es/widgets/autocomplete/autocomplete';
import clearRefinements from 'instantsearch.js/es/widgets/clear-refinements/clear-refinements';
import pagination from 'instantsearch.js/es/widgets/pagination/pagination';
import refinementList from 'instantsearch.js/es/widgets/refinement-list/refinement-list';
import searchBox from 'instantsearch.js/es/widgets/search-box/search-box';
import sortBy from 'instantsearch.js/es/widgets/sort-by/sort-by';
import stats from 'instantsearch.js/es/widgets/stats/stats';
import toggleRefinement from 'instantsearch.js/es/widgets/toggle-refinement/toggle-refinement';
import hitsPerPage from 'instantsearch.js/es/widgets/hits-per-page/hits-per-page';
import rangeSlider from 'instantsearch.js/es/widgets/range-slider/range-slider';
import currentRefinements from 'instantsearch.js/es/widgets/current-refinements/current-refinements';
import rangeInput from 'instantsearch.js/es/widgets/range-input/range-input';
import ratingMenu from 'instantsearch.js/es/widgets/rating-menu/rating-menu';
import trendingItems from 'instantsearch.js/es/widgets/trending-items/trending-items';
import breadcrumb from 'instantsearch.js/es/widgets/breadcrumb/breadcrumb';
import hierarchicalMenu from 'instantsearch.js/es/widgets/hierarchical-menu/hierarchical-menu';
import numericMenu from 'instantsearch.js/es/widgets/numeric-menu/numeric-menu';

import { renderTool } from './renderer';
import {
  renderAutocompleteItem,
  renderCarouselItem,
  renderListItem,
  renderNoResults,
  renderSectionHeader,
  renderTwoColumnsPanel,
  withGlobalNoResults,
  SKELETON_CSS,
} from './templates';
import type { ExperienceWidget } from './types';

import type { ChatTransport } from 'instantsearch.js/es/connectors/chat/connectChat';
import type { InstantSearch } from 'instantsearch.js/es/types';
import type { ExperienceWidgetParams } from './types';

// TODO: Serve CSS from a CDN with proper MIME type and load via <link> from the
// loader instead of inlining it in JS. GitHub release downloads serve as
// application/octet-stream which browsers reject for stylesheets. Remove the
// __AUTOCOMPLETE_CSS__ define in tsdown.config.ts and this <style> injection
// once we have a proper CDN setup.
declare const __AUTOCOMPLETE_CSS__: string;
(() => {
  const style = document.createElement('style');
  style.textContent = __AUTOCOMPLETE_CSS__ + SKELETON_CSS;
  document.head.appendChild(style);
})();

const withUsage = createDocumentationMessageGenerator({ name: 'experience' });

export default (function experience(
  widgetParams: ExperienceWidgetParams
): ExperienceWidget {
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
            template,
            agentId,
            toolRenderings = {},
            ...rest
          } = params as typeof params & {
            template?: Record<string, string>;
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
              ...(template ? { item: renderCarouselItem(template) } : {}),
            },
            tools,
          });
        },
      },
      'ais.configure': {
        widget: configure,
        headless: true,
        async transformParams(params) {
          const { searchParameters } = params as typeof params & {
            searchParameters?: Record<string, unknown>;
          };

          return { ...searchParameters };
        },
      },
      // TODO: Add support for `templates` (first, previous, page, next, last)
      'ais.pagination': {
        widget: pagination,
        async transformParams(parameters) {
          return parameters;
        },
      },
      'ais.autocomplete': {
        widget: EXPERIMENTAL_autocomplete,
        async transformParams(params) {
          const {
            showRecent,
            showQuerySuggestions,
            indices,
            panelLayout,
            noResults: globalNoResults,
            ...rest
          } = params as typeof params & {
            showRecent?: false | { templates: { header: string } };
            showQuerySuggestions?: {
              searchPageUrl?: string;
              queryParam?: string;
              // oxlint-disable-next-line id-length -- backward compat for old configs
              q?: string;
              indexName?: string;
              templates?: { header?: string; noResults?: string };
            };
            indices?: Array<{
              indexName: string;
              hitsPerPage?: number;
              templates?: {
                header?: string;
                item?: Record<string, string>;
                noResults?: string;
              };
              searchParameters?: Record<string, unknown>;
            }>;
            panelLayout?: 'one-column' | 'two-columns';
            noResults?:
              | false
              | {
                  title?: string;
                  description?: string;
                  clearLabel?: string;
                };
          };

          const twoColumns =
            panelLayout === 'two-columns' ? renderTwoColumnsPanel() : undefined;
          const panelTemplate =
            globalNoResults && typeof globalNoResults === 'object'
              ? withGlobalNoResults(globalNoResults, twoColumns)
              : twoColumns;

          return Promise.resolve({
            ...rest,
            ...(panelTemplate ? { templates: { panel: panelTemplate } } : {}),
            ...(showRecent
              ? {
                  showRecent: showRecent.templates.header
                    ? {
                        templates: {
                          header: renderSectionHeader(
                            showRecent.templates.header
                          ),
                        },
                      }
                    : {},
                }
              : {}),
            ...(showQuerySuggestions
              ? {
                  showQuerySuggestions: {
                    indexName: showQuerySuggestions.indexName,
                    ...((showQuerySuggestions.templates?.header ||
                      showQuerySuggestions.templates?.noResults) && {
                      templates: {
                        ...(showQuerySuggestions.templates?.header
                          ? {
                              header: renderSectionHeader(
                                showQuerySuggestions.templates.header
                              ),
                            }
                          : {}),
                        ...(showQuerySuggestions.templates?.noResults
                          ? {
                              noResults: renderNoResults(
                                showQuerySuggestions.templates.noResults
                              ),
                            }
                          : {}),
                      },
                    }),
                    ...(showQuerySuggestions.searchPageUrl
                      ? {
                          getURL: (item: { query: string }) => {
                            const url = new URL(
                              showQuerySuggestions.searchPageUrl!,
                              window.location.origin
                            );
                            url.searchParams.set(
                              showQuerySuggestions.queryParam ??
                                showQuerySuggestions.q ??
                                'q',
                              item.query
                            );
                            return url.toString();
                          },
                        }
                      : {}),
                  },
                }
              : {}),
            ...(indices?.length
              ? {
                  indices: indices.map(
                    ({
                      indexName,
                      hitsPerPage,
                      templates: entryTemplates,
                      searchParameters,
                    }) => {
                      return {
                        indexName,
                        searchParameters: {
                          ...searchParameters,
                          ...(hitsPerPage != null ? { hitsPerPage } : {}),
                        },
                        templates: {
                          ...(entryTemplates?.header
                            ? {
                                header: renderSectionHeader(
                                  entryTemplates.header
                                ),
                              }
                            : {}),
                          ...(entryTemplates?.item
                            ? {
                                item: renderAutocompleteItem(
                                  entryTemplates.item
                                ),
                              }
                            : {}),
                          ...(entryTemplates?.noResults
                            ? {
                                noResults: renderNoResults(
                                  entryTemplates.noResults
                                ),
                              }
                            : {}),
                        },
                      };
                    }
                  ),
                }
              : {}),
          });
        },
      },
      // TODO: Add support for `templates` (resetLabel)
      // TODO: Add support for `transformItems` (bucket 3 function)
      'ais.clearRefinements': {
        widget: clearRefinements,
        async transformParams(parameters) {
          return parameters;
        },
      },
      // TODO: Add support for `templates` (empty, banner)
      // TODO: Add support for `transformItems` (bucket 3 function)
      'ais.hits': {
        widget: hits,
        async transformParams(parameters) {
          const { template, ...params } = parameters as typeof parameters & {
            template?: Record<string, string>;
          };

          return {
            ...params,
            ...(template
              ? { templates: { item: renderListItem(template) } }
              : {}),
          };
        },
      },
      // TODO: Add support for `templates` (empty, showMoreText)
      // TODO: Add support for `transformItems` (bucket 3 function)
      // TODO: Add support for `cache` (bucket 3 function)
      'ais.infiniteHits': {
        widget: infiniteHits,
        async transformParams(parameters) {
          const { template, ...params } = parameters as typeof parameters & {
            template?: Record<string, string>;
          };

          return {
            ...params,
            ...(template
              ? { templates: { item: renderListItem(template) } }
              : {}),
          };
        },
      },
      // TODO: Add support for `templates` (item, showMoreText, searchableNoResults, searchableSubmit, searchableReset, searchableLoadingIndicator)
      // TODO: Add support for `transformItems` (bucket 3 function)
      'ais.refinementList': {
        widget: refinementList,
        async transformParams(parameters) {
          return parameters;
        },
      },
      // TODO: Add support for `templates` (submit, reset, loadingIndicator)
      // TODO: Add support for `queryHook` (bucket 3 — function)
      'ais.searchBox': {
        widget: searchBox,
        async transformParams(params) {
          return params;
        },
      },
      // TODO: Add support for `templates` (item, showMoreText)
      // TODO: Add support for `transformItems` (bucket 3 function)
      'ais.menu': {
        widget: menu,
        async transformParams(parameters) {
          return parameters;
        },
      },
      // TODO: Add support for `transformItems` (bucket 3 function)
      'ais.sortBy': {
        widget: sortBy,
        async transformParams(parameters) {
          return parameters;
        },
      },
      // TODO: Add support for `templates` (text)
      'ais.stats': {
        widget: stats,
        async transformParams(parameters) {
          return parameters;
        },
      },
      // TODO: Add support for `templates` (labelText)
      'ais.toggleRefinement': {
        widget: toggleRefinement,
        async transformParams(parameters) {
          return parameters;
        },
      },
      // TODO: Add support for `transformItems` (bucket 3 function)
      'ais.hitsPerPage': {
        widget: hitsPerPage,
        async transformParams(parameters) {
          return parameters;
        },
      },
      // TODO: Add support for `templates` (item)
      // TODO: Add support for `transformItems` (bucket 3 function)
      'ais.ratingMenu': {
        widget: ratingMenu,
        async transformParams(parameters) {
          return parameters;
        },
      },
      // TODO: Add support for `tooltips` (bucket 3 — function format)
      'ais.rangeSlider': {
        widget: rangeSlider,
        async transformParams(parameters) {
          return parameters;
        },
      },
      // TODO: Add support for `templates` (header, empty, layout)
      // TODO: Add support for `transformItems` (bucket 3 function)
      'ais.trendingItems': {
        widget: trendingItems,
        async transformParams(parameters) {
          const { template, carouselLayout, ...params } =
            parameters as typeof parameters & {
              template?: Record<string, string>;
              carouselLayout?: boolean;
            };

          return {
            ...params,
            ...(template
              ? {
                  templates: {
                    ...(carouselLayout ? { layout: carousel() } : {}),
                    item: carouselLayout
                      ? renderCarouselItem(template)
                      : renderListItem(template),
                  },
                }
              : {}),
          };
        },
      },
      // TODO: Add support for `templates` (item)
      // TODO: Add support for `transformItems` (bucket 3 function)
      'ais.numericMenu': {
        widget: numericMenu,
        async transformParams(parameters) {
          const { items, ...rest } = parameters as typeof parameters & {
            items?: Array<{
              label: string;
              start?: string | number;
              end?: string | number;
            }>;
          };

          return {
            ...rest,
            items: items?.map(({ label, start, end }) => {
              return {
                label,
                ...(start !== undefined && start !== ''
                  ? { start: Number(start) }
                  : {}),
                ...(end !== undefined && end !== ''
                  ? { end: Number(end) }
                  : {}),
              };
            }),
          };
        },
      },
      // TODO: Add support for `transformItems` (bucket 3 function)
      'ais.currentRefinements': {
        widget: currentRefinements,
        async transformParams(parameters) {
          return parameters;
        },
      },
      // TODO: Add support for `templates` (item, showMoreText)
      // TODO: Add support for `transformItems` (bucket 3 function)
      'ais.hierarchicalMenu': {
        widget: hierarchicalMenu,
        async transformParams(parameters) {
          return parameters;
        },
      },
      // TODO: Add support for `templates` (separatorText, submitText)
      'ais.rangeInput': {
        widget: rangeInput,
        async transformParams(parameters) {
          return parameters;
        },
      },
      // TODO: Add support for `templates` (home, separator)
      // TODO: Add support for `transformItems` (bucket 3 function)
      'ais.breadcrumb': {
        widget: breadcrumb,
        async transformParams(parameters) {
          return parameters;
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
      api: `https://agent-studio.staging.eu.algolia.com/1/agents/${agentId}/completions?compatibilityMode=ai-sdk-5`,
      headers: {
        'x-algolia-application-id': appId!,
        'x-algolia-api-key': apiKey!,
      },
    },
  };
}
