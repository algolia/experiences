import type {
  IndexWidget,
  InstantSearch,
  Widget,
} from 'instantsearch.js/es/types';
import type { ChatWidget } from 'instantsearch.js/es/widgets/chat/chat';
import type { ClearRefinementsWidget } from 'instantsearch.js/es/widgets/clear-refinements/clear-refinements';
import type { CurrentRefinementsWidget } from 'instantsearch.js/es/widgets/current-refinements/current-refinements';
import type { ConfigureWidget } from 'instantsearch.js/es/widgets/configure/configure';
import type { HitsWidget } from 'instantsearch.js/es/widgets/hits/hits';
import type { InfiniteHitsWidget } from 'instantsearch.js/es/widgets/infinite-hits/infinite-hits';
import type { PaginationWidget } from 'instantsearch.js/es/widgets/pagination/pagination';
import type { SearchBoxWidget } from 'instantsearch.js/es/widgets/search-box/search-box';
import type { StatsWidget } from 'instantsearch.js/es/widgets/stats/stats';

export type Environment = 'prod' | 'beta';

type ExperienceApiBlockParameters = {
  container: string;
  placement?: 'inside' | 'before' | 'after' | 'replace' | 'body';
  cssVariables?: Record<string, string>;
  indexName?: string;
  indexId?: string;
} & Record<
  'container' | 'cssVariables' | 'indexName' | 'indexId' | (string & {}),
  unknown
>;

type ExperienceApiBlock = {
  type: string;
  parameters: ExperienceApiBlockParameters;
  children?: ExperienceApiBlock[];
};

export type ExperienceApiResponse = {
  blocks: ExperienceApiBlock[];
};

export type ExperienceWidgetParams = {
  id: string;
};

type SupportedWidget<
  TWidgetParameters = unknown,
  TApiParameters = ExperienceApiBlockParameters,
> = {
  widget: (...args: any[]) => Widget | Array<IndexWidget | Widget>;
  headless?: boolean;
  transformParams: (
    params: TApiParameters,
    options: {
      env: Environment;
      instantSearchInstance: InstantSearch;
    }
  ) => Promise<TWidgetParameters>;
};

export type ExperienceWidget = Widget & {
  $$widgetParams: ExperienceWidgetParams;
  $$supportedWidgets: {
    'ais.chat': SupportedWidget<Parameters<ChatWidget>[0]>;
    'ais.configure': SupportedWidget<Parameters<ConfigureWidget>[0]>;
    'ais.autocomplete': SupportedWidget;
    'ais.clearRefinements': SupportedWidget<
      Parameters<ClearRefinementsWidget>[0]
    >;
    'ais.hits': SupportedWidget<Parameters<HitsWidget>[0]>;
    'ais.infiniteHits': SupportedWidget<Parameters<InfiniteHitsWidget>[0]>;
    'ais.menu': SupportedWidget;
    'ais.pagination': SupportedWidget<Parameters<PaginationWidget>[0]>;
    'ais.refinementList': SupportedWidget;
    'ais.searchBox': SupportedWidget<Parameters<SearchBoxWidget>[0]>;
    'ais.sortBy': SupportedWidget;
    'ais.stats': SupportedWidget<Parameters<StatsWidget>[0]>;
    'ais.toggleRefinement': SupportedWidget;
    'ais.hitsPerPage': SupportedWidget;
    'ais.rangeInput': SupportedWidget;
    'ais.ratingMenu': SupportedWidget;
    'ais.numericMenu': SupportedWidget;
    'ais.currentRefinements': SupportedWidget<
      Parameters<CurrentRefinementsWidget>[0]
    >;
    'ais.hierarchicalMenu': SupportedWidget;
  } & Record<
    | 'ais.chat'
    | 'ais.configure'
    | 'ais.autocomplete'
    | 'ais.clearRefinements'
    | 'ais.currentRefinements'
    | 'ais.hits'
    | 'ais.infiniteHits'
    | 'ais.menu'
    | 'ais.pagination'
    | 'ais.rangeInput'
    | 'ais.ratingMenu'
    | 'ais.refinementList'
    | 'ais.searchBox'
    | 'ais.sortBy'
    | 'ais.stats'
    | 'ais.toggleRefinement'
    | 'ais.hitsPerPage'
    | 'ais.numericMenu'
    | 'ais.hierarchicalMenu'
    | (string & {}),
    SupportedWidget
  >;
};
