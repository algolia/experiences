import { walkIndex } from 'instantsearch.js/es/lib/utils';
import index from 'instantsearch.js/es/widgets/index/index';

import type {
  IndexWidget,
  InternalMiddleware,
  InstantSearch,
} from 'instantsearch.js/es/types';
import { generateThemeCss, THEME_STYLE_ATTR } from '@experiences/theme';
import { AUTOCOMPLETE_VARIABLES } from '@experiences/theme/autocomplete';

import type {
  Environment,
  ExperienceApiResponse,
  ExperienceWidget,
} from './types';

export type ExperienceProps = {
  config: ExperienceApiResponse;
  env?: Environment;
};

export function createExperienceMiddleware(
  props: ExperienceProps
): InternalMiddleware {
  const { config, env = 'prod' } = props;

  return ({ instantSearchInstance }) => {
    const cleanups: Array<() => void> = [];

    return {
      $$type: 'ais.experience',
      $$internal: true,
      onStateChange: () => {},
      subscribe() {
        const cssVariables = config.cssVariables ?? {};
        const themeCss = generateThemeCss(AUTOCOMPLETE_VARIABLES, cssVariables);
        const themeStyle = injectStyleElement(themeCss);
        cleanups.push(() => {
          return themeStyle.remove();
        });

        const experienceWidgets: ExperienceWidget[] = [];
        walkIndex(instantSearchInstance.mainIndex, (index) => {
          const widgets = index.getWidgets();

          widgets.forEach((widget) => {
            if (widget.$$type === 'ais.experience') {
              experienceWidgets.push(widget as ExperienceWidget);
            }
          });
        });

        experienceWidgets.forEach((widget) => {
          const parent = widget.parent!;

          parent.removeWidgets([widget]);

          processBlocks({
            blocks: config.blocks,
            parent,
            widget,
            env,
            instantSearchInstance,
            cleanups,
          });
        });
      },
      started: () => {},
      unsubscribe: () => {
        cleanups.forEach((cleanup) => {
          return cleanup();
        });
        cleanups.length = 0;
      },
    };
  };
}

type Placement = 'inside' | 'before' | 'after' | 'replace' | 'body';

type ResolvedContainer = {
  container: HTMLElement;
  cleanup: () => void;
};

function resolveContainer(
  selector: string | undefined,
  placement: Placement = 'inside'
): ResolvedContainer | null {
  if (placement === 'body') {
    const div = document.createElement('div');
    document.body.appendChild(div);
    return {
      container: div,
      cleanup: () => {
        return div.remove();
      },
    };
  }

  if (!selector) {
    return null;
  }

  const target = document.querySelector(selector);
  if (!target) {
    return null;
  }

  if (placement === 'inside') {
    return { container: target as HTMLElement, cleanup: () => {} };
  }

  const div = document.createElement('div');

  if (placement === 'replace') {
    const originalDisplay = (target as HTMLElement).style.display;
    (target as HTMLElement).style.display = 'none';
    target.insertAdjacentElement('afterend', div);

    return {
      container: div,
      cleanup: () => {
        div.remove();
        (target as HTMLElement).style.display = originalDisplay;
      },
    };
  }

  const position = placement === 'before' ? 'beforebegin' : 'afterend';
  target.insertAdjacentElement(position, div);

  return {
    container: div,
    cleanup: () => {
      div.remove();
    },
  };
}

type ProcessBlocksOptions = {
  blocks: ExperienceApiResponse['blocks'];
  parent: IndexWidget;
  widget: ExperienceWidget;
  env: Environment;
  instantSearchInstance: InstantSearch;
  cleanups: Array<() => void>;
};

function processBlocks({
  blocks,
  parent,
  widget,
  env,
  instantSearchInstance,
  cleanups,
}: ProcessBlocksOptions) {
  blocks.forEach((block) => {
    const { type, parameters } = block;

    if (type === 'ais.index') {
      const { indexName, indexId } = parameters;

      if (!indexName) {
        console.warn(
          '[Algolia Experiences] ais.index block is missing required "indexName" parameter, skipping.'
        );
        return;
      }

      const indexWidget = index({
        indexName,
        indexId: indexId as string | undefined,
      });

      parent.addWidgets([indexWidget]);
      cleanups.push(() => {
        return parent.removeWidgets([indexWidget]);
      });

      if (block.children) {
        processBlocks({
          blocks: block.children,
          parent: indexWidget,
          widget,
          env,
          instantSearchInstance,
          cleanups,
        });
      }

      return;
    }

    const supportedWidget = widget.$$supportedWidgets[type];

    if (!supportedWidget) {
      return;
    }

    const { placement, ...widgetParams } = parameters;
    const isHeadless = supportedWidget.headless;
    const resolved = isHeadless
      ? null
      : resolveContainer(
          widgetParams.container as string | undefined,
          placement as Placement | undefined
        );

    if (!isHeadless && !resolved) {
      return;
    }

    if (resolved) {
      cleanups.push(resolved.cleanup);
    }

    const newWidget = supportedWidget.widget;

    supportedWidget
      .transformParams(widgetParams, { env, instantSearchInstance })
      .then((transformedParams) => {
        if (newWidget) {
          const params = {
            ...(transformedParams as Record<string, unknown>),
            ...(resolved ? { container: resolved.container } : {}),
          };
          const widgets = newWidget(params);
          parent.addWidgets(Array.isArray(widgets) ? widgets : [widgets]);
        }
      })
      .catch((error) => {
        console.error(
          `[Algolia Experiences] Failed to mount widget "${type}":`,
          error
        );
      });
  });
}

export function injectStyleElement(textContent: string) {
  const style = document.createElement('style');

  style.textContent = textContent;

  const themePreview = document.querySelector(`style[${THEME_STYLE_ATTR}]`);
  if (themePreview) {
    document.head.insertBefore(style, themePreview);
  } else {
    document.head.appendChild(style);
  }

  return style;
}
