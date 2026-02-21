import { liteClient as algoliasearch } from 'algoliasearch/lite';
import instantsearch, { type InstantSearch } from 'instantsearch.js';

import {
  createExperienceMiddleware,
  experience,
  getConfig,
  getExperience,
  type Environment,
  type ExperienceApiResponse,
} from './experiences';

export { createExperienceMiddleware, experience };

export type RunOptions = {
  appId: string;
  apiKey: string;
  experienceId: string;
  env?: Environment;
  config?: ExperienceApiResponse;
};

let search: InstantSearch | null = null;

export async function run(options?: RunOptions | ExperienceApiResponse) {
  let appId: string;
  let apiKey: string;
  let experienceId: string;
  let env: Environment;
  let runtimeConfig: ExperienceApiResponse | undefined;

  if (options && !('blocks' in options)) {
    ({
      appId,
      apiKey,
      experienceId,
      env = 'prod',
      config: runtimeConfig,
    } = options);
  } else {
    ({ appId, apiKey, experienceId, env = 'prod' } = getConfig());
    runtimeConfig = options as ExperienceApiResponse | undefined;
  }

  const experienceConfig =
    runtimeConfig ??
    (await getExperience({ appId, apiKey, env, experienceId }));

  const indexName = experienceConfig.blocks
    .map((block) => {
      return block.parameters.indexName;
    })
    .find((name): name is string => {
      return typeof name === 'string';
    });

  if (search) {
    search.dispose();
  }

  const searchClient = algoliasearch(appId, apiKey);

  search = instantsearch({
    indexName,
    searchClient,
  });

  search.use(createExperienceMiddleware({ env, config: experienceConfig }));
  search.addWidgets([experience({ id: experienceId })]);

  search.start();
}

export function dispose() {
  if (search) {
    search.dispose();
    search = null;
  }
}
