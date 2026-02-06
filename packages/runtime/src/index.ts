import { liteClient as algoliasearch } from 'algoliasearch/lite';
import instantsearch, { type InstantSearch } from 'instantsearch.js';

import { createExperienceMiddleware } from './experiences/middleware';
import experience from './experiences/widget';
import { getConfig } from './get-config';

export { createExperienceMiddleware, experience };

let search: InstantSearch | null = null;

export function run() {
  const { appId, apiKey, experienceId, env } = getConfig();

  if (search) {
    search.dispose();
  }

  const searchClient = algoliasearch(appId, apiKey);

  search = instantsearch({
    indexName: 'instant_search',
    searchClient,
  });

  search.use(createExperienceMiddleware({ env }));
  search.addWidgets([experience({ id: experienceId })]);

  search.start();
}
