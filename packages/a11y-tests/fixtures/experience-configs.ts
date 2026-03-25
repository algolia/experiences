export type ExperienceConfig = {
  blocks: Array<{
    type: string;
    parameters: Record<string, unknown>;
  }>;
  cssVariables?: {
    light: Record<string, string>;
    dark: Record<string, string>;
  };
};

export const AUTOCOMPLETE_WITH_IMAGES: ExperienceConfig = {
  blocks: [
    {
      type: 'ais.autocomplete',
      parameters: {
        container: '#autocomplete',
        placement: 'inside' as const,
        indices: [
          {
            indexName: 'products',
            hitsPerPage: 5,
            templates: {
              header: 'Products',
              item: {
                name: 'name',
                category: 'category',
                description: 'description',
                image: 'image',
                price: 'price',
                currency: '$',
              },
            },
          },
        ],
        noResults: {
          title: 'No results for "{{query}}"',
          description: 'Try a different search term.',
          clearLabel: 'Clear search',
        },
      },
    },
  ],
};

export const AUTOCOMPLETE_WITHOUT_IMAGES = {
  blocks: [
    {
      type: 'ais.autocomplete',
      parameters: {
        container: '#autocomplete',
        placement: 'inside' as const,
        indices: [
          {
            indexName: 'articles',
            hitsPerPage: 5,
            templates: {
              header: 'Articles',
              item: {
                name: 'name',
                description: 'description',
              },
            },
          },
        ],
        noResults: {
          title: 'No results for "{{query}}"',
          description: 'Try a different search term.',
          clearLabel: 'Clear search',
        },
      },
    },
  ],
};

export const AUTOCOMPLETE_WITH_QS_AND_RS = {
  blocks: [
    {
      type: 'ais.autocomplete',
      parameters: {
        container: '#autocomplete',
        placement: 'inside' as const,
        panelLayout: 'two-columns',
        showRecent: { templates: { header: 'Recent Searches' } },
        showQuerySuggestions: {
          indexName: 'products_query_suggestions',
          templates: {
            header: 'Suggestions',
            noResults: 'No suggestions found.',
          },
        },
        indices: [
          {
            indexName: 'products',
            hitsPerPage: 5,
            templates: {
              header: 'Products',
              item: {
                name: 'name',
                category: 'category',
                description: 'description',
                image: 'image',
                price: 'price',
                currency: '$',
              },
            },
          },
        ],
        noResults: {
          title: 'No results for "{{query}}"',
          description: 'Try a different search term.',
          clearLabel: 'Clear search',
        },
      },
    },
  ],
};

export const AUTOCOMPLETE_DETACHED = {
  blocks: [
    {
      type: 'ais.autocomplete',
      parameters: {
        container: '#autocomplete',
        placement: 'inside' as const,
        detachedMediaQuery: '(min-width: 0px)',
        indices: [
          {
            indexName: 'products',
            hitsPerPage: 5,
            templates: {
              header: 'Products',
              item: {
                name: 'name',
                category: 'category',
                description: 'description',
                image: 'image',
                price: 'price',
                currency: '$',
              },
            },
          },
        ],
        noResults: {
          title: 'No results for "{{query}}"',
          description: 'Try a different search term.',
          clearLabel: 'Clear search',
        },
      },
    },
  ],
};

export const AUTOCOMPLETE_NO_RESULTS = {
  blocks: [
    {
      type: 'ais.autocomplete',
      parameters: {
        container: '#autocomplete',
        placement: 'inside' as const,
        indices: [
          {
            indexName: 'products',
            hitsPerPage: 5,
            templates: {
              header: 'Products',
              item: {
                name: 'name',
                image: 'image',
              },
            },
          },
        ],
        noResults: {
          title: 'No results for "{{query}}"',
          description: 'Try a different search term.',
          clearLabel: 'Clear search',
        },
      },
    },
  ],
};
