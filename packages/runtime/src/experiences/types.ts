import type {
  IndexWidget,
  InstantSearch,
  Widget,
} from 'instantsearch.js/es/types';
import type { ChatWidget } from 'instantsearch.js/es/widgets/chat/chat';

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
  blocks?: ExperienceApiBlock[];
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
    'ais.autocomplete': SupportedWidget;
  } & Record<'ais.chat' | 'ais.autocomplete' | (string & {}), SupportedWidget>;
};
