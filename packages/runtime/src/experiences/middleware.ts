import { walkIndex } from 'instantsearch.js/es/lib/utils';

import type { InternalMiddleware } from 'instantsearch.js/es/types';
import type {
  Environment,
  ExperienceApiResponse,
  ExperienceWidget,
} from './types';

export type ExperienceProps = {
  config: ExperienceApiResponse;
  env?: Environment;
};

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
    return { container: div, cleanup: () => div.remove() };
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

          config.blocks.forEach((block) => {
            const { type, parameters } = block;

            const cssVariables = parameters.cssVariables ?? {};
            const cssVariablesKeys = Object.keys(cssVariables);
            if (cssVariablesKeys.length > 0) {
              injectStyleElement(`
                  :root {
                    ${cssVariablesKeys
                      .map((key) => {
                        return `--ais-${key}: ${cssVariables[key]};`;
                      })
                      .join(';')}
                  }
                `);
            }

            const supportedWidget = widget.$$supportedWidgets[type];
            if (!supportedWidget) {
              return;
            }

            const { placement, ...widgetParams } = parameters;
            const resolved = resolveContainer(
              widgetParams.container,
              placement as Placement | undefined
            );

            if (!resolved) {
              return;
            }

            cleanups.push(resolved.cleanup);

            const newWidget = supportedWidget.widget;
            supportedWidget
              .transformParams(widgetParams, { env, instantSearchInstance })
              .then((transformedParams) => {
                if (newWidget) {
                  const params = {
                    ...(transformedParams as Record<string, unknown>),
                    container: resolved.container,
                  };
                  const widgets = newWidget(params);
                  parent.addWidgets(
                    Array.isArray(widgets) ? widgets : [widgets]
                  );
                }
              })
              .catch((error) => {
                console.error(
                  `[Algolia Experiences] Failed to mount widget "${type}":`,
                  error
                );
              });
          });
        });
      },
      started: () => {},
      unsubscribe: () => {
        cleanups.forEach((cleanup) => cleanup());
        cleanups.length = 0;
      },
    };
  };
}

export function injectStyleElement(textContent: string) {
  const style = document.createElement('style');

  style.textContent = textContent;

  document.head.appendChild(style);
}
