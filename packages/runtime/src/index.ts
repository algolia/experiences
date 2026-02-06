import { liteClient as algoliasearch } from 'algoliasearch/lite';
import instantsearch, { type InstantSearch } from 'instantsearch.js';

import {
  createExperienceMiddleware,
  experience,
  getConfig,
  getExperience,
  type ExperienceApiResponse,
} from './experiences';

export { createExperienceMiddleware, experience };

let search: InstantSearch | null = null;

export async function run(runtimeConfig?: ExperienceApiResponse) {
  const { appId, apiKey, experienceId, env = 'prod' } = getConfig();

  const experienceConfig =
    runtimeConfig ??
    (await getExperience({ appId, apiKey, env, experienceId }));

  const indexName = experienceConfig.blocks
    .map((block) => block.parameters.indexName)
    .find((name): name is string => typeof name === 'string');

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
