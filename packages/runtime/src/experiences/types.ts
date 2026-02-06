import type {
  IndexWidget,
  InstantSearch,
  Widget,
} from 'instantsearch.js/es/types';
import type { ChatWidget } from 'instantsearch.js/es/widgets/chat/chat';

type ExperienceApiBlockParameters = {
  container: string;
  cssVariables: Record<string, string>;
} & Record<'container' | 'cssVariables' | (string & {}), unknown>;

export type ExperienceApiResponse = {
  blocks: Array<{
    type: string;
    parameters: ExperienceApiBlockParameters;
  }>;
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
      env: 'beta' | 'prod';
      instantSearchInstance: InstantSearch;
    }
  ) => Promise<TWidgetParameters>;
};

export type ExperienceWidget = Widget & {
  $$widgetParams: ExperienceWidgetParams;
  $$supportedWidgets: {
    'ais.chat': SupportedWidget<Parameters<ChatWidget>[0]>;
  } & Record<'ais.chat' | (string & {}), SupportedWidget>;
};
