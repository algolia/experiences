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

export function createExperienceMiddleware(
  props: ExperienceProps
): InternalMiddleware {
  const { config, env = 'prod' } = props;

  return ({ instantSearchInstance }) => {
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

            const cssVariablesKeys = Object.keys(parameters.cssVariables ?? {});
            if (cssVariablesKeys.length > 0) {
              injectStyleElement(`
                  :root {
                    ${cssVariablesKeys
                      .map((key) => {
                        return `--ais-${key}: ${parameters.cssVariables[key]};`;
                      })
                      .join(';')}
                  }
                `);
            }

            const supportedWidget = widget.$$supportedWidgets[type];
            if (!supportedWidget) {
              return;
            }

            const newWidget = supportedWidget.widget;
            supportedWidget
              .transformParams(parameters, { env, instantSearchInstance })
              .then((transformedParams) => {
                if (
                  newWidget &&
                  document.querySelector(parameters.container) !== null
                ) {
                  parent.addWidgets([newWidget(transformedParams)]);
                }
              });
          });
        });
      },
      started: () => {},
      unsubscribe: () => {},
    };
  };
}

export function injectStyleElement(textContent: string) {
  const style = document.createElement('style');

  style.textContent = textContent;

  document.head.appendChild(style);
}
