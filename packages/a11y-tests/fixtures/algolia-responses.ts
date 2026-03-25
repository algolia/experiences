export type SearchResponse = {
  results: Array<Record<string, unknown>>;
};

export const RESPONSE_RESULTS_WITH_IMAGES: SearchResponse = {
  results: [
    createAlgoliaResponse({
      hits: [
        {
          objectID: '1',
          name: 'Wireless Headphones',
          category: 'Electronics',
          description:
            'Premium noise-cancelling wireless headphones with 30-hour battery life.',
          image: 'https://example.com/headphones.jpg',
          price: 299,
          _highlightResult: {
            name: {
              value: '<mark>Wireless</mark> Headphones',
              matchLevel: 'full',
              matchedWords: ['wireless'],
            },
          },
        },
        {
          objectID: '2',
          name: 'Running Shoes',
          category: 'Sports',
          description: 'Lightweight running shoes with responsive cushioning.',
          image: 'https://example.com/shoes.jpg',
          price: 129,
          _highlightResult: {
            name: {
              value: 'Running <mark>Shoes</mark>',
              matchLevel: 'full',
              matchedWords: ['shoes'],
            },
          },
        },
        {
          objectID: '3',
          name: 'Coffee Maker',
          category: 'Kitchen',
          description: 'Programmable drip coffee maker with thermal carafe.',
          image: 'https://example.com/coffee.jpg',
          price: 89,
          _highlightResult: {
            name: {
              value: '<mark>Coffee</mark> Maker',
              matchLevel: 'full',
              matchedWords: ['coffee'],
            },
          },
        },
      ],
      nbHits: 3,
      page: 0,
      nbPages: 1,
      hitsPerPage: 5,
      query: 'test',
      index: 'products',
    }),
  ],
};

export const RESPONSE_RESULTS_WITHOUT_IMAGES = {
  results: [
    createAlgoliaResponse({
      hits: [
        {
          objectID: '10',
          name: 'Getting Started with Algolia',
          description:
            'Learn how to set up Algolia search in your application with this step-by-step guide.',
          _highlightResult: {
            name: {
              value: 'Getting Started with <mark>Algolia</mark>',
              matchLevel: 'full',
              matchedWords: ['algolia'],
            },
          },
        },
        {
          objectID: '11',
          name: 'Best Practices for Search Relevance',
          description:
            'Optimize your search results with these proven relevance strategies.',
          _highlightResult: {
            name: {
              value: 'Best Practices for <mark>Search</mark> Relevance',
              matchLevel: 'full',
              matchedWords: ['search'],
            },
          },
        },
      ],
      nbHits: 2,
      page: 0,
      nbPages: 1,
      hitsPerPage: 5,
      query: 'search',
      index: 'articles',
    }),
  ],
};

export const RESPONSE_NO_RESULTS = {
  results: [
    createAlgoliaResponse({
      hits: [],
      nbHits: 0,
      page: 0,
      nbPages: 0,
      hitsPerPage: 5,
      query: 'xyznonexistent',
      index: 'products',
    }),
  ],
};

export const RESPONSE_RESULTS_WITH_QS = {
  results: [
    createAlgoliaResponse({
      hits: [
        {
          objectID: '1',
          name: 'Wireless Headphones',
          category: 'Electronics',
          description:
            'Premium noise-cancelling wireless headphones with 30-hour battery life.',
          image: 'https://example.com/headphones.jpg',
          price: 299,
          _highlightResult: {
            name: {
              value: '<mark>Wireless</mark> Headphones',
              matchLevel: 'full',
              matchedWords: ['wireless'],
            },
          },
        },
        {
          objectID: '2',
          name: 'Wireless Earbuds',
          category: 'Electronics',
          description: 'True wireless earbuds with active noise cancellation.',
          image: 'https://example.com/earbuds.jpg',
          price: 199,
          _highlightResult: {
            name: {
              value: '<mark>Wireless</mark> Earbuds',
              matchLevel: 'full',
              matchedWords: ['wireless'],
            },
          },
        },
      ],
      nbHits: 2,
      page: 0,
      nbPages: 1,
      hitsPerPage: 5,
      query: 'wireless',
      index: 'products',
    }),
    createAlgoliaResponse({
      hits: [
        {
          objectID: 'qs-1',
          query: 'wireless headphones',
          _highlightResult: {
            query: {
              value: '<mark>wireless</mark> headphones',
              matchLevel: 'full',
              matchedWords: ['wireless'],
            },
          },
        },
        {
          objectID: 'qs-2',
          query: 'wireless earbuds',
          _highlightResult: {
            query: {
              value: '<mark>wireless</mark> earbuds',
              matchLevel: 'full',
              matchedWords: ['wireless'],
            },
          },
        },
      ],
      nbHits: 2,
      page: 0,
      nbPages: 1,
      hitsPerPage: 5,
      query: 'wireless',
      index: 'products_query_suggestions',
    }),
  ],
};

function createAlgoliaResponse(overrides: Record<string, unknown> = {}) {
  return {
    exhaustiveNbHits: true,
    exhaustiveTypo: true,
    exhaustive: { nbHits: true, typo: true },
    processingTimeMS: 1,
    processingTimingsMS: {},
    serverTimeMS: 1,
    ...overrides,
  };
}
