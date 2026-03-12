import { describe, expect, it, vi } from 'vitest';

import {
  buildToolDefinitions,
  describeExperience,
  describeToolAction,
  describeWidgetTypes,
  executeToolCall,
  type ToolCallbacks,
} from '../src/ai/tools';
import type { ExperienceApiResponse } from '../src/types';

function createCallbacks(
  experience: ExperienceApiResponse = { blocks: [], indexName: '' },
  addBlockPath: [number] | [number, number] = [0],
  indexCreated = false
): ToolCallbacks {
  return {
    onAddBlock: vi.fn(() => {
      return { path: addBlockPath, indexCreated };
    }),
    onParameterChange: vi.fn(),
    onDeleteBlock: vi.fn(),
    onMoveBlock: vi.fn(),
    getExperience: vi.fn(() => {
      return experience;
    }),
    getCredentials: vi.fn(() => {
      return { appId: 'APP_ID', apiKey: 'API_KEY' };
    }),
    getEnv: vi.fn(() => {
      return 'beta' as const;
    }),
  };
}

describe('describeWidgetTypes', () => {
  it('includes enabled widget types', async () => {
    const result = describeWidgetTypes();
    expect(result).toContain('ais.autocomplete');
    expect(result).toContain('Autocomplete');
    expect(result).toContain('ais.chat');
    expect(result).toContain('Chat');
    expect(result).toContain('ais.index');
    expect(result).toContain('Index');
    expect(result).toContain('ais.configure');
    expect(result).toContain('Configure');
    expect(result).toContain('ais.hits');
    expect(result).toContain('Hits');
    expect(result).toContain('ais.infiniteHits');
    expect(result).toContain('Infinite Hits');
    expect(result).toContain('ais.searchBox');
    expect(result).toContain('Search Box');
    expect(result).toContain('ais.sortBy');
    expect(result).toContain('Sort By');
    expect(result).toContain('ais.stats');
    expect(result).toContain('Stats');
    expect(result).toContain('ais.hitsPerPage');
    expect(result).toContain('Hits Per Page');
    expect(result).toContain('ais.numericMenu');
    expect(result).toContain('Numeric Menu');
  });

  it('includes widget descriptions and parameter descriptions', async () => {
    const result = describeWidgetTypes();
    expect(result).toContain('search-as-you-type');
    expect(result).toContain('Parameters:');
    expect(result).toContain('showRecent');
    expect(result).toContain('recent searches');
    expect(result).toContain('search results');
    expect(result).toContain('escapeHTML');
    expect(result).toContain('XSS');
    expect(result).toContain('template');
    expect(result).toContain('attribute');
  });

  it('marks params with suggest kind annotations', async () => {
    const result = describeWidgetTypes();
    expect(result).toMatch(/attribute.*\[suggests: facetAttributes\]/);
    expect(result).toMatch(/agentId.*\[suggests: agentStudioAgents\]/);
    expect(result).toMatch(/attributes.*\[suggests: indexAttributes\]/);
    expect(result).toMatch(/includedAttributes.*\[suggests: facetAttributes\]/);
    expect(result).toMatch(/excludedAttributes.*\[suggests: facetAttributes\]/);
    expect(result).toMatch(/indexName.*\[suggests: indices\]/);
    expect(result).toMatch(/\(indexName \[suggests: indices:qs\]\)/);
    expect(result).toMatch(/\(value \[suggests: indices:replicas\]\)/);
  });

  it('includes default placement per widget type', async () => {
    const result = describeWidgetTypes();
    expect(result).toContain(
      'ais.autocomplete ("Autocomplete", default placement: inside)'
    );
    expect(result).toContain('ais.chat ("Chat", default placement: body)');
    expect(result).toContain('ais.hits ("Hits", default placement: inside)');
  });

  it('marks index-independent widgets', async () => {
    const result = describeWidgetTypes();
    expect(result).toContain('[index-independent]');
  });

  it('includes toggleRefinement widget type', async () => {
    const result = describeWidgetTypes();
    expect(result).toContain('ais.toggleRefinement');
    expect(result).toContain('Toggle Refinement');
  });

  it('includes hitsPerPage widget type', async () => {
    const result = describeWidgetTypes();
    expect(result).toContain('ais.hitsPerPage');
    expect(result).toContain('Hits Per Page');
  });

  it('includes pagination widget type', async () => {
    const result = describeWidgetTypes();
    expect(result).toContain('ais.pagination');
    expect(result).toContain('Pagination');
    expect(result).toContain('paginated search results');
    expect(result).toContain('showFirst');
  });

  it('includes numericMenu widget type', async () => {
    const result = describeWidgetTypes();
    expect(result).toContain('ais.numericMenu');
    expect(result).toContain('Numeric Menu');
    expect(result).toContain('attribute');
    expect(result).toContain('items');
  });

  it('includes clearRefinements widget type', async () => {
    const result = describeWidgetTypes();
    expect(result).toContain('ais.clearRefinements');
    expect(result).toContain('Clear Refinements');
    expect(result).toContain('includedAttributes');
    expect(result).toContain('excludedAttributes');
  });

  it('includes refinementList widget type', async () => {
    const result = describeWidgetTypes();
    expect(result).toContain('ais.refinementList');
    expect(result).toContain('Refinement List');
    expect(result).toContain('attribute');
    expect(result).toContain('searchable');
  });

  it('includes menu widget type', async () => {
    const result = describeWidgetTypes();
    expect(result).toContain('ais.menu');
    expect(result).toContain('Menu');
    expect(result).toContain('single-select facet');
    expect(result).toContain('attribute');
  });

  it('includes ratingMenu widget type', async () => {
    const result = describeWidgetTypes();
    expect(result).toContain('ais.ratingMenu');
    expect(result).toContain('Rating Menu');
    expect(result).toContain('star-based rating');
    expect(result).toContain('attribute');
  });

  it('includes rangeSlider widget type', async () => {
    const result = describeWidgetTypes();
    expect(result).toContain('ais.rangeSlider');
    expect(result).toContain('Range Slider');
    expect(result).toContain('draggable slider');
    expect(result).toContain('attribute');
  });

  it('includes trendingItems widget type', async () => {
    const result = describeWidgetTypes();
    expect(result).toContain('ais.trendingItems');
    expect(result).toContain('Trending Items');
    expect(result).toContain('trending items');
    expect(result).toContain('limit');
    expect(result).toContain('template');
  });

  it('includes currentRefinements widget type', async () => {
    const result = describeWidgetTypes();
    expect(result).toContain('ais.currentRefinements');
    expect(result).toContain('Current Refinements');
    expect(result).toContain('currently active filters');
    expect(result).toContain('includedAttributes');
    expect(result).toContain('excludedAttributes');
  });

  it('includes rangeInput widget type', async () => {
    const result = describeWidgetTypes();
    expect(result).toContain('ais.rangeInput');
    expect(result).toContain('Range Input');
    expect(result).toContain('numeric range');
    expect(result).toContain('attribute');
  });

  it('includes trendingItems widget type', async () => {
    const result = describeWidgetTypes();
    expect(result).toContain('ais.trendingItems');
    expect(result).toContain('Trending Items');
    expect(result).toContain('trending items');
    expect(result).toContain('limit');
  });

  it('includes hierarchicalMenu widget type', async () => {
    const result = describeWidgetTypes();
    expect(result).toContain('ais.hierarchicalMenu');
    expect(result).toContain('Hierarchical Menu');
    expect(result).toContain('hierarchical facet');
    expect(result).toContain('attributes');
  });

  it('includes breadcrumb widget type', async () => {
    const result = describeWidgetTypes();
    expect(result).toContain('ais.breadcrumb');
    expect(result).toContain('Breadcrumb');
    expect(result).toContain('navigation trail');
    expect(result).toContain('attributes');
  });
});

describe('describeExperience', () => {
  it('returns a message for empty experiences', async () => {
    const result = describeExperience({ blocks: [], indexName: '' });
    expect(result).toBe('The experience has no widgets yet.');
  });

  it('formats blocks with paths and placement', async () => {
    const experience: ExperienceApiResponse = {
      blocks: [
        {
          type: 'ais.autocomplete',
          parameters: { container: '#search', showRecent: false },
        },
        {
          type: 'ais.chat',
          parameters: {
            container: '#chat',
            placement: 'body',
            agentId: 'agent-1',
          },
        },
      ],
      indexName: '',
    };

    const result = describeExperience(experience);
    expect(result).toContain(
      '[0] Autocomplete (ais.autocomplete) [inside #search]'
    );
    expect(result).toContain('showRecent=false');
    expect(result).not.toContain('container=');
    expect(result).toContain('[1] Chat (ais.chat) [body]');
    expect(result).toContain('agentId="agent-1"');
  });

  it('falls back to type string for unknown widget types', async () => {
    const experience: ExperienceApiResponse = {
      blocks: [
        {
          type: 'ais.unknown',
          parameters: { container: '#foo' },
        },
      ],
    };

    const result = describeExperience(experience);
    expect(result).toContain('[0] ais.unknown (ais.unknown)');
  });

  it('shows placement without container when container is empty', async () => {
    const experience: ExperienceApiResponse = {
      blocks: [
        {
          type: 'ais.autocomplete',
          parameters: { container: '', placement: 'before' },
        },
      ],
    };

    const result = describeExperience(experience);
    expect(result).toContain('[before]');
    expect(result).not.toContain('[before ]');
  });

  it('formats nested index blocks with child paths', async () => {
    const experience: ExperienceApiResponse = {
      blocks: [
        {
          type: 'ais.index',
          parameters: { indexName: 'products' },
          children: [
            {
              type: 'ais.autocomplete',
              parameters: { container: '#search' },
            },
          ],
        },
      ],
      indexName: '',
    };

    const result = describeExperience(experience);
    expect(result).toContain('[0] Index (ais.index)');
    expect(result).toContain('products');
    expect(result).toContain('[0.0] Autocomplete (ais.autocomplete)');
  });

  it('includes indexId when present on index blocks', async () => {
    const experience: ExperienceApiResponse = {
      blocks: [
        {
          type: 'ais.index',
          parameters: { indexName: 'products', indexId: 'main' },
          children: [],
        },
      ],
      indexName: '',
    };

    const result = describeExperience(experience);
    expect(result).toContain('indexName: products');
    expect(result).toContain('indexId: main');
  });

  it('omits indexId when not set on index blocks', async () => {
    const experience: ExperienceApiResponse = {
      blocks: [
        {
          type: 'ais.index',
          parameters: { indexName: 'products' },
          children: [],
        },
      ],
      indexName: '',
    };

    const result = describeExperience(experience);
    expect(result).toContain('indexName: products');
    expect(result).not.toContain('indexId');
  });

  it('uses default placement from widget config when not in parameters', async () => {
    const experience: ExperienceApiResponse = {
      blocks: [
        {
          type: 'ais.chat',
          parameters: { agentId: 'agent-1' },
        },
      ],
      indexName: '',
    };

    const result = describeExperience(experience);
    expect(result).toContain('[0] Chat (ais.chat) [body]');
  });

  it('shows empty index block with "(empty)" marker', async () => {
    const experience: ExperienceApiResponse = {
      blocks: [
        {
          type: 'ais.index',
          parameters: { indexName: 'products' },
          children: [],
        },
      ],
      indexName: '',
    };

    const result = describeExperience(experience);
    expect(result).toContain('(empty)');
  });

  it('shows "(unnamed)" when index block has no indexName', async () => {
    const experience: ExperienceApiResponse = {
      blocks: [
        {
          type: 'ais.index',
          parameters: {},
          children: [],
        },
      ],
      indexName: '',
    };

    const result = describeExperience(experience);
    expect(result).toContain('(unnamed)');
  });
});

describe('executeToolCall', () => {
  it('dispatches to all five tools', async () => {
    const callbacks = createCallbacks();
    const names = [
      'get_experience',
      'add_widget',
      'edit_widget',
      'remove_widget',
      'move_widget',
    ];
    for (const name of names) {
      const result = await executeToolCall(name, {}, callbacks);
      expect(result).toBeDefined();
    }
  });

  it('returns error for unknown tool', async () => {
    const result = await executeToolCall('unknown_tool', {}, createCallbacks());
    expect(result).toEqual({
      success: false,
      error: 'Unknown tool: unknown_tool',
    });
  });

  describe('get_experience', () => {
    it('returns the current experience state', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.autocomplete',
            parameters: { container: '#search' },
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall('get_experience', {}, callbacks);

      expect(result.state).toContain('Autocomplete');
      expect(result.state).toContain('#search');
    });
  });

  describe('add_widget', () => {
    it('calls onAddBlock and onParameterChange for index-independent widgets', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.autocomplete',
            parameters: { container: '#search' },
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'add_widget',
        { type: 'ais.autocomplete', container: '#search' },
        callbacks
      );

      expect(callbacks.onAddBlock).toHaveBeenCalledWith(
        'ais.autocomplete',
        undefined
      );
      expect(result).toMatchObject({
        success: true,
        type: 'ais.autocomplete',
        placement: 'inside',
        container: '#search',
        applied: expect.arrayContaining(['placement', 'container']),
        rejected: [],
      });
    });

    it('applies additional parameters', async () => {
      // After onAddBlock is called, getExperience returns the updated state
      const afterAdd: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.autocomplete',
            parameters: { container: '', showRecent: false },
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(afterAdd);

      await executeToolCall(
        'add_widget',
        {
          type: 'ais.autocomplete',
          container: '#search',
          parameters: { showRecent: true },
        },
        callbacks
      );

      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0],
        'showRecent',
        true
      );
    });

    it('rejects disallowed parameters', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.autocomplete',
            parameters: { container: '#search' },
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'add_widget',
        {
          type: 'ais.autocomplete',
          container: '#search',
          parameters: { showRecent: true, unknownParam: 42 },
        },
        callbacks
      );

      expect(result).toMatchObject({
        success: true,
        applied: expect.arrayContaining([
          'placement',
          'container',
          'showRecent',
        ]),
        rejected: ['unknownParam'],
      });
    });

    it('adds widget with body placement and no container', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.chat',
            parameters: { placement: 'body', agentId: '' },
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'add_widget',
        { type: 'ais.chat', placement: 'body' },
        callbacks
      );

      expect(result).toMatchObject({
        success: true,
        placement: 'body',
        applied: ['placement'],
      });
    });

    it('adds a toggleRefinement widget with attribute and on parameters', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.index',
            parameters: { indexName: 'products' },
            children: [],
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience, [0, 0]);

      const result = await executeToolCall(
        'add_widget',
        {
          type: 'ais.toggleRefinement',
          container: '#toggle',
          parameters: { attribute: 'free_shipping', on: true },
        },
        callbacks
      );

      expect(result).toMatchObject({ success: true });
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0, 0],
        'attribute',
        'free_shipping'
      );
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0, 0],
        'on',
        true
      );
    });

    it('uses default placement from widget config when not specified', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.chat',
            parameters: { placement: 'body', agentId: '' },
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'add_widget',
        { type: 'ais.chat' },
        callbacks
      );

      expect(result).toMatchObject({
        success: true,
        placement: 'body',
      });
    });

    it('adds widget with explicit before placement', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.autocomplete',
            parameters: { container: '#search' },
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'add_widget',
        {
          type: 'ais.autocomplete',
          placement: 'before',
          container: '#search',
        },
        callbacks
      );

      expect(result).toMatchObject({
        success: true,
        placement: 'before',
        container: '#search',
        applied: ['placement', 'container'],
      });
    });

    it('returns error when non-body placement has no container', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.autocomplete',
            parameters: { container: '#search' },
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'add_widget',
        { type: 'ais.autocomplete', placement: 'before' },
        callbacks
      );

      expect(result).toMatchObject({
        success: false,
        error: expect.stringContaining('container CSS selector is required'),
      });
    });

    it('returns error when default inside placement has no container', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.autocomplete',
            parameters: { container: '#search' },
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'add_widget',
        { type: 'ais.autocomplete' },
        callbacks
      );

      expect(result).toMatchObject({
        success: false,
        error: expect.stringContaining('container CSS selector is required'),
      });
    });

    it('accepts container inside parameters instead of top-level', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'add_widget',
        {
          type: 'ais.autocomplete',
          parameters: { container: '#search' },
        },
        callbacks
      );

      expect(result).toMatchObject({ success: true });
    });

    it('skips container and placement inside parameters to avoid duplication', async () => {
      const experience: ExperienceApiResponse = { blocks: [], indexName: '' };
      const callbacks = createCallbacks(experience);

      await executeToolCall(
        'add_widget',
        {
          type: 'ais.autocomplete',
          container: '#search',
          placement: 'before',
          parameters: {
            container: '#other',
            placement: 'after',
            showRecent: true,
          },
        },
        callbacks
      );

      // Top-level container and placement should be used
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0],
        'container',
        '#search'
      );
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0],
        'placement',
        'before'
      );
      // container and placement inside parameters should be skipped
      expect(callbacks.onParameterChange).not.toHaveBeenCalledWith(
        [0],
        'container',
        '#other'
      );
      expect(callbacks.onParameterChange).not.toHaveBeenCalledWith(
        [0],
        'placement',
        'after'
      );
      // Other params inside parameters should still be applied
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0],
        'showRecent',
        true
      );
    });

    it('returns error when container is missing for non-body placement', async () => {
      const experience: ExperienceApiResponse = { blocks: [], indexName: '' };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'add_widget',
        { type: 'ais.autocomplete' },
        callbacks
      );

      expect(result).toMatchObject({
        success: false,
        error: expect.stringContaining('container'),
      });
      expect(callbacks.onAddBlock).not.toHaveBeenCalled();
    });

    it('adds hits with default inside placement and container', async () => {
      const experience: ExperienceApiResponse = { blocks: [], indexName: '' };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'add_widget',
        { type: 'ais.hits', container: '#hits' },
        callbacks
      );

      expect(callbacks.onAddBlock).toHaveBeenCalledWith('ais.hits', undefined);
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0],
        'placement',
        'inside'
      );
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0],
        'container',
        '#hits'
      );
      expect(result).toMatchObject({
        success: true,
        path: '0',
        type: 'ais.hits',
        placement: 'inside',
        container: '#hits',
        applied: ['placement', 'container'],
        rejected: [],
      });
    });

    it('adds searchBox with default inside placement and container', async () => {
      const experience: ExperienceApiResponse = { blocks: [], indexName: '' };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'add_widget',
        { type: 'ais.searchBox', container: '#search-box' },
        callbacks
      );

      expect(callbacks.onAddBlock).toHaveBeenCalledWith(
        'ais.searchBox',
        undefined
      );
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0],
        'placement',
        'inside'
      );
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0],
        'container',
        '#search-box'
      );
      expect(result).toMatchObject({
        success: true,
        path: '0',
        type: 'ais.searchBox',
        placement: 'inside',
        container: '#search-box',
        applied: ['placement', 'container'],
        rejected: [],
      });
    });

    it('adds clearRefinements widget with list parameters', async () => {
      const experience: ExperienceApiResponse = { blocks: [], indexName: '' };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'add_widget',
        {
          type: 'ais.clearRefinements',
          container: '#clear',
          parameters: {
            includedAttributes: ['brand', 'color'],
          },
        },
        callbacks
      );

      expect(result).toMatchObject({
        success: true,
        applied: expect.arrayContaining([
          'placement',
          'container',
          'includedAttributes',
        ]),
      });
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0],
        'includedAttributes',
        ['brand', 'color']
      );
    });

    it('adds ais.index widget at top level', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'add_widget',
        { type: 'ais.index', parameters: { indexName: 'products' } },
        callbacks
      );

      expect(callbacks.onAddBlock).toHaveBeenCalledWith('ais.index', undefined);
      expect(result).toMatchObject({
        success: true,
        type: 'ais.index',
      });
    });

    it('adds an infinite hits widget with default parameters', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'add_widget',
        { type: 'ais.infiniteHits', container: '#hits' },
        callbacks
      );

      expect(callbacks.onAddBlock).toHaveBeenCalledWith(
        'ais.infiniteHits',
        undefined
      );
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0],
        'container',
        '#hits'
      );
      expect(result).toMatchObject({
        success: true,
        type: 'ais.infiniteHits',
      });
    });

    it('adds an infinite hits widget with showPrevious enabled', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      await executeToolCall(
        'add_widget',
        {
          type: 'ais.infiniteHits',
          container: '#hits',
          parameters: { showPrevious: true },
        },
        callbacks
      );

      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0],
        'showPrevious',
        true
      );
    });

    it('adds a pagination widget with boolean parameters', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'add_widget',
        {
          type: 'ais.pagination',
          container: '#pagination',
          parameters: { showFirst: false, padding: 5 },
        },
        callbacks
      );

      expect(result).toMatchObject({
        success: true,
        type: 'ais.pagination',
        applied: expect.arrayContaining([
          'placement',
          'container',
          'showFirst',
          'padding',
        ]),
        rejected: [],
      });
      expect(callbacks.onAddBlock).toHaveBeenCalledWith(
        'ais.pagination',
        undefined
      );
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0],
        'showFirst',
        false
      );
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0],
        'padding',
        5
      );
    });

    it('adds ais.stats widget', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'add_widget',
        { type: 'ais.stats', container: '#stats' },
        callbacks
      );

      expect(callbacks.onAddBlock).toHaveBeenCalledWith('ais.stats', undefined);
      expect(result).toMatchObject({
        success: true,
        type: 'ais.stats',
        container: '#stats',
      });
    });

    it('adds refinementList widget with parameters', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'add_widget',
        {
          type: 'ais.refinementList',
          container: '#filters',
          parameters: { attribute: 'brand', searchable: true },
        },
        callbacks
      );

      expect(result).toMatchObject({
        success: true,
        applied: expect.arrayContaining([
          'placement',
          'container',
          'attribute',
          'searchable',
        ]),
      });
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0],
        'attribute',
        'brand'
      );
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0],
        'searchable',
        true
      );
    });

    it('adds a hitsPerPage widget with items parameter', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.index',
            parameters: { indexName: 'products' },
            children: [],
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience, [0, 0]);

      const result = await executeToolCall(
        'add_widget',
        {
          type: 'ais.hitsPerPage',
          container: '#hits-per-page',
          parameters: {
            items: [
              { value: '20', label: '20 per page' },
              { value: '50', label: '50 per page' },
            ],
          },
        },
        callbacks
      );

      expect(result).toMatchObject({
        success: true,
        applied: expect.arrayContaining(['placement', 'container', 'items']),
      });
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0, 0],
        'items',
        [
          { value: '20', label: '20 per page' },
          { value: '50', label: '50 per page' },
        ]
      );
    });

    it('adds a ratingMenu widget with attribute and max parameters', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.index',
            parameters: { indexName: 'products' },
            children: [],
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience, [0, 0]);

      const result = await executeToolCall(
        'add_widget',
        {
          type: 'ais.ratingMenu',
          container: '#rating',
          parameters: { attribute: 'rating', max: 5 },
        },
        callbacks
      );

      expect(result).toMatchObject({
        success: true,
        applied: expect.arrayContaining([
          'placement',
          'container',
          'attribute',
          'max',
        ]),
      });
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0, 0],
        'attribute',
        'rating'
      );
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0, 0],
        'max',
        5
      );
    });

    it('adds a rangeSlider widget with attribute and number parameters', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.index',
            parameters: { indexName: 'products' },
            children: [],
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience, [0, 0]);

      const result = await executeToolCall(
        'add_widget',
        {
          type: 'ais.rangeSlider',
          container: '#price-range',
          parameters: { attribute: 'price', min: 0, max: 1000, step: 10 },
        },
        callbacks
      );

      expect(result).toMatchObject({
        success: true,
        applied: expect.arrayContaining([
          'placement',
          'container',
          'attribute',
          'min',
          'max',
          'step',
        ]),
      });
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0, 0],
        'attribute',
        'price'
      );
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0, 0],
        'min',
        0
      );
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0, 0],
        'max',
        1000
      );
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0, 0],
        'step',
        10
      );
    });

    it('adds a trendingItems widget with limit and threshold', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.index',
            parameters: { indexName: 'products' },
            children: [],
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience, [0, 0]);

      const result = await executeToolCall(
        'add_widget',
        {
          type: 'ais.trendingItems',
          container: '#trending',
          parameters: { limit: 10, threshold: 50 },
        },
        callbacks
      );

      expect(result).toMatchObject({
        success: true,
        applied: expect.arrayContaining([
          'placement',
          'container',
          'limit',
          'threshold',
        ]),
      });
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0, 0],
        'limit',
        10
      );
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0, 0],
        'threshold',
        50
      );
    });

    it('adds a hierarchicalMenu widget with attributes and separator', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.index',
            parameters: { indexName: 'products' },
            children: [],
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience, [0, 0]);

      const result = await executeToolCall(
        'add_widget',
        {
          type: 'ais.hierarchicalMenu',
          container: '#hierarchical-menu',
          parameters: {
            attributes: [
              'categories.lvl0',
              'categories.lvl1',
              'categories.lvl2',
            ],
            separator: ' / ',
          },
        },
        callbacks
      );

      expect(result).toMatchObject({
        success: true,
        applied: expect.arrayContaining([
          'placement',
          'container',
          'attributes',
          'separator',
        ]),
      });
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0, 0],
        'attributes',
        ['categories.lvl0', 'categories.lvl1', 'categories.lvl2']
      );
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0, 0],
        'separator',
        ' / '
      );
    });

    it('adds a breadcrumb widget with attributes and separator', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.index',
            parameters: { indexName: 'products' },
            children: [],
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience, [0, 0]);

      const result = await executeToolCall(
        'add_widget',
        {
          type: 'ais.breadcrumb',
          container: '#breadcrumb',
          parameters: {
            attributes: [
              'hierarchicalCategories.lvl0',
              'hierarchicalCategories.lvl1',
              'hierarchicalCategories.lvl2',
            ],
            separator: ' > ',
          },
        },
        callbacks
      );

      expect(result).toMatchObject({
        success: true,
        applied: expect.arrayContaining([
          'placement',
          'container',
          'attributes',
          'separator',
        ]),
      });
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0, 0],
        'attributes',
        [
          'hierarchicalCategories.lvl0',
          'hierarchicalCategories.lvl1',
          'hierarchicalCategories.lvl2',
        ]
      );
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0, 0],
        'separator',
        ' > '
      );
    });

    it('adds a numericMenu widget with attribute and items', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'add_widget',
        {
          type: 'ais.numericMenu',
          container: '#numeric-menu',
          parameters: {
            attribute: 'price',
            items: [
              { label: 'All' },
              { label: 'Under $50', end: 50 },
              { label: '$50–$100', start: 50, end: 100 },
            ],
          },
        },
        callbacks
      );

      expect(result).toMatchObject({
        success: true,
        applied: expect.arrayContaining([
          'placement',
          'container',
          'attribute',
          'items',
        ]),
      });
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0],
        'attribute',
        'price'
      );
      expect(callbacks.onParameterChange).toHaveBeenCalledWith([0], 'items', [
        { label: 'All' },
        { label: 'Under $50', end: 50 },
        { label: '$50–$100', start: 50, end: 100 },
      ]);
    });

    it('adds a currentRefinements widget with list parameters', async () => {
      const experience: ExperienceApiResponse = { blocks: [], indexName: '' };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'add_widget',
        {
          type: 'ais.currentRefinements',
          container: '#current-refinements',
          parameters: {
            includedAttributes: ['brand', 'color'],
          },
        },
        callbacks
      );

      expect(result).toMatchObject({
        success: true,
        applied: expect.arrayContaining([
          'placement',
          'container',
          'includedAttributes',
        ]),
      });
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0],
        'includedAttributes',
        ['brand', 'color']
      );
    });

    it('adds a rangeInput widget with attribute and number parameters', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.index',
            parameters: { indexName: 'products' },
            children: [],
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience, [0, 0]);

      const result = await executeToolCall(
        'add_widget',
        {
          type: 'ais.rangeInput',
          container: '#range',
          parameters: { attribute: 'price', min: 0, max: 1000, precision: 2 },
        },
        callbacks
      );

      expect(result).toMatchObject({
        success: true,
        applied: expect.arrayContaining([
          'placement',
          'container',
          'attribute',
          'min',
          'max',
          'precision',
        ]),
      });
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0, 0],
        'attribute',
        'price'
      );
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0, 0],
        'min',
        0
      );
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0, 0],
        'max',
        1000
      );
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0, 0],
        'precision',
        2
      );
    });

    it('adds a sortBy widget with items parameter', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'add_widget',
        {
          type: 'ais.sortBy',
          container: '#sort',
          parameters: {
            items: [
              { value: 'products', label: 'Featured' },
              { value: 'products_price_asc', label: 'Price (asc)' },
            ],
          },
        },
        callbacks
      );

      expect(result).toMatchObject({
        success: true,
        applied: expect.arrayContaining(['placement', 'container', 'items']),
      });
      expect(callbacks.onParameterChange).toHaveBeenCalledWith([0], 'items', [
        { value: 'products', label: 'Featured' },
        { value: 'products_price_asc', label: 'Price (asc)' },
      ]);
    });

    it('computes the correct index for non-empty experiences', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.index',
            parameters: { indexName: 'products' },
            children: [],
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'add_widget',
        { type: 'ais.index', parameters: { indexName: 'products' } },
        callbacks
      );

      expect(callbacks.onAddBlock).toHaveBeenCalledWith('ais.index', undefined);
      expect(result).toMatchObject({
        success: true,
        type: 'ais.index',
      });
    });

    it('adds ais.index widget without parameters', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'add_widget',
        { type: 'ais.index' },
        callbacks
      );

      expect(callbacks.onAddBlock).toHaveBeenCalledWith('ais.index', undefined);
      expect(result).toMatchObject({
        success: true,
        type: 'ais.index',
      });
    });

    it('does not require container for ais.index widgets', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'add_widget',
        { type: 'ais.index' },
        callbacks
      );

      expect(result).toMatchObject({ success: true });
    });

    it('adds index-dependent widget and passes target_index', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.index',
            parameters: { indexName: 'products' },
            children: [],
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience, [0, 0]);

      const result = await executeToolCall(
        'add_widget',
        {
          type: 'ais.autocomplete',
          container: '#search',
          target_index: 0,
        },
        callbacks
      );

      expect(callbacks.onAddBlock).toHaveBeenCalledWith('ais.autocomplete', 0);
      expect(result).toMatchObject({
        success: true,
        path: '0.0',
        type: 'ais.autocomplete',
      });
    });

    it('returns error when target_index is not an ais.index block', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.chat',
            parameters: { placement: 'body', agentId: '' },
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'add_widget',
        {
          type: 'ais.autocomplete',
          container: '#search',
          target_index: 0,
        },
        callbacks
      );

      expect(result).toMatchObject({
        success: false,
        error: expect.stringContaining('not an ais.index block'),
      });
      expect(callbacks.onAddBlock).not.toHaveBeenCalled();
    });

    it('returns error when target_index is out of bounds', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'add_widget',
        {
          type: 'ais.autocomplete',
          container: '#search',
          target_index: 5,
        },
        callbacks
      );

      expect(result).toMatchObject({
        success: false,
        error: expect.stringContaining('not an ais.index block'),
      });
      expect(callbacks.onAddBlock).not.toHaveBeenCalled();
    });

    it('includes note when index block was auto-created', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [],
        indexName: '',
      };
      const callbacks = createCallbacks(experience, [0, 0], true);

      const result = await executeToolCall(
        'add_widget',
        { type: 'ais.autocomplete', container: '#search' },
        callbacks
      );

      expect(result).toMatchObject({
        success: true,
        note: expect.stringContaining('auto-created'),
      });
    });

    it('does not include note when added to existing index', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.index',
            parameters: { indexName: 'products' },
            children: [],
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience, [0, 0], false);

      const result = await executeToolCall(
        'add_widget',
        { type: 'ais.autocomplete', container: '#search' },
        callbacks
      );

      expect(result).toMatchObject({ success: true });
      expect(result).not.toHaveProperty('note');
    });

    it('adds configure widget with body placement and no container', async () => {
      const experience: ExperienceApiResponse = { blocks: [] };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'add_widget',
        {
          type: 'ais.configure',
          parameters: { searchParameters: { hitsPerPage: 20 } },
        },
        callbacks
      );

      expect(result).toMatchObject({
        success: true,
        path: '0',
        type: 'ais.configure',
        placement: 'body',
        applied: expect.arrayContaining(['placement', 'searchParameters']),
        rejected: [],
      });
      expect(callbacks.onAddBlock).toHaveBeenCalledWith(
        'ais.configure',
        undefined
      );
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0],
        'placement',
        'body'
      );
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0],
        'searchParameters',
        { hitsPerPage: 20 }
      );
      expect(callbacks.onParameterChange).not.toHaveBeenCalledWith(
        [0],
        'container',
        expect.anything()
      );
    });
  });

  describe('edit_widget', () => {
    it('validates path bounds', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.autocomplete',
            parameters: { container: '#search' },
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'edit_widget',
        { path: '5', parameters: { container: '#new' } },
        callbacks
      );

      expect(result).toMatchObject({ success: false });
      expect(callbacks.onParameterChange).not.toHaveBeenCalled();
    });

    it('applies allowed parameter changes', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.autocomplete',
            parameters: { container: '#search', showRecent: false },
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'edit_widget',
        { path: '0', parameters: { container: '#new', showRecent: true } },
        callbacks
      );

      expect(result).toMatchObject({
        success: true,
        applied: expect.arrayContaining(['container', 'showRecent']),
      });
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0],
        'container',
        '#new'
      );
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0],
        'showRecent',
        true
      );
    });

    it('edits nested widgets by path', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.index',
            parameters: { indexName: 'products' },
            children: [
              {
                type: 'ais.autocomplete',
                parameters: { container: '#search' },
              },
            ],
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'edit_widget',
        { path: '0.0', parameters: { container: '#new' } },
        callbacks
      );

      expect(result).toMatchObject({
        success: true,
        applied: ['container'],
      });
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0, 0],
        'container',
        '#new'
      );
    });

    it('reports rejected keys for disallowed parameters', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.autocomplete',
            parameters: { container: '#search' },
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'edit_widget',
        { path: '0', parameters: { container: '#new', unknownParam: 42 } },
        callbacks
      );

      expect(result).toMatchObject({
        success: true,
        applied: ['container'],
        rejected: ['unknownParam'],
      });
    });

    it('returns a clear error for empty experience', async () => {
      const callbacks = createCallbacks({ blocks: [], indexName: '' });

      const result = await executeToolCall(
        'edit_widget',
        { path: '0', parameters: { container: '#new' } },
        callbacks
      );

      expect(result).toMatchObject({
        success: false,
        error: expect.stringContaining('Invalid path'),
      });
    });

    it('rejects malformed paths', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.autocomplete',
            parameters: { container: '#search' },
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const malformedPaths = ['', '.', 'a.b', '0.0.0', '-1'];

      for (const path of malformedPaths) {
        const result = await executeToolCall(
          'edit_widget',
          { path, parameters: { container: '#new' } },
          callbacks
        );
        expect(result).toMatchObject({ success: false });
      }

      expect(callbacks.onParameterChange).not.toHaveBeenCalled();
    });

    it('allows editing placement', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.autocomplete',
            parameters: { container: '#search', placement: 'inside' },
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'edit_widget',
        { path: '0', parameters: { placement: 'after' } },
        callbacks
      );

      expect(result).toMatchObject({
        success: true,
        applied: ['placement'],
      });
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0],
        'placement',
        'after'
      );
    });

    it('edits infinite hits escapeHTML parameter', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.infiniteHits',
            parameters: { container: '#hits', escapeHTML: true },
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'edit_widget',
        { path: '0', parameters: { escapeHTML: false } },
        callbacks
      );

      expect(result).toMatchObject({
        success: true,
        applied: ['escapeHTML'],
      });
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0],
        'escapeHTML',
        false
      );
    });

    it('edits infinite hits cssClasses parameter', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.infiniteHits',
            parameters: { container: '#hits' },
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'edit_widget',
        {
          path: '0',
          parameters: { cssClasses: { root: 'my-root', item: 'my-item' } },
        },
        callbacks
      );

      expect(result).toMatchObject({
        success: true,
        applied: expect.arrayContaining(['cssClasses']),
      });
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0],
        'cssClasses',
        { root: 'my-root', item: 'my-item' }
      );
    });

    it('applies boolean and cssClasses changes on a pagination widget', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.pagination',
            parameters: {
              container: '#pagination',
              showFirst: true,
              cssClasses: { root: '' },
            },
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'edit_widget',
        {
          path: '0',
          parameters: {
            showFirst: false,
            cssClasses: { root: 'my-root' },
          },
        },
        callbacks
      );

      expect(result).toMatchObject({
        success: true,
        applied: expect.arrayContaining(['showFirst', 'cssClasses']),
      });
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0],
        'showFirst',
        false
      );
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0],
        'cssClasses',
        { root: 'my-root' }
      );
    });

    it('applies list parameter changes on clearRefinements', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.clearRefinements',
            parameters: {
              container: '#clear',
              includedAttributes: [],
              excludedAttributes: [],
            },
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'edit_widget',
        {
          path: '0',
          parameters: {
            includedAttributes: ['brand'],
            excludedAttributes: ['query'],
          },
        },
        callbacks
      );

      expect(result).toMatchObject({
        success: true,
        applied: expect.arrayContaining([
          'includedAttributes',
          'excludedAttributes',
        ]),
      });
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0],
        'includedAttributes',
        ['brand']
      );
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0],
        'excludedAttributes',
        ['query']
      );
    });

    it('applies parameter changes on refinementList', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.refinementList',
            parameters: {
              container: '#filters',
              attribute: 'brand',
              searchable: false,
            },
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'edit_widget',
        {
          path: '0',
          parameters: { attribute: 'color', showMore: true, limit: 5 },
        },
        callbacks
      );

      expect(result).toMatchObject({
        success: true,
        applied: expect.arrayContaining(['attribute', 'showMore', 'limit']),
      });
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0],
        'attribute',
        'color'
      );
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0],
        'showMore',
        true
      );
      expect(callbacks.onParameterChange).toHaveBeenCalledWith([0], 'limit', 5);
    });

    it('edits toggleRefinement attribute parameter', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.toggleRefinement',
            parameters: { container: '#toggle', attribute: 'free_shipping' },
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'edit_widget',
        { path: '0', parameters: { attribute: 'on_sale' } },
        callbacks
      );

      expect(result).toMatchObject({
        success: true,
        applied: ['attribute'],
      });
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0],
        'attribute',
        'on_sale'
      );
    });

    it('returns empty applied when all parameters are rejected', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.autocomplete',
            parameters: { container: '#search' },
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'edit_widget',
        { path: '0', parameters: { unknownA: 1, unknownB: 2 } },
        callbacks
      );

      expect(result).toMatchObject({
        success: true,
        applied: [],
        rejected: ['unknownA', 'unknownB'],
      });
      expect(callbacks.onParameterChange).not.toHaveBeenCalled();
    });

    it('applies a boolean parameter with switch override on hits', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.hits',
            parameters: { container: '#hits', escapeHTML: true },
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'edit_widget',
        { path: '0', parameters: { escapeHTML: false } },
        callbacks
      );

      expect(result).toMatchObject({
        success: true,
        applied: ['escapeHTML'],
        rejected: [],
      });
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0],
        'escapeHTML',
        false
      );
    });

    it('applies an object parameter (cssClasses) on hits', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.hits',
            parameters: { container: '#hits' },
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'edit_widget',
        {
          path: '0',
          parameters: {
            cssClasses: { root: 'my-root', item: 'my-item' },
          },
        },
        callbacks
      );

      expect(result).toMatchObject({
        success: true,
        applied: ['cssClasses'],
        rejected: [],
      });
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0],
        'cssClasses',
        { root: 'my-root', item: 'my-item' }
      );
    });

    it('includes invalid path in bounds error message', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.autocomplete',
            parameters: { container: '#search' },
          },
          {
            type: 'ais.chat',
            parameters: { container: '#chat', placement: 'body' },
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'edit_widget',
        { path: '5', parameters: { container: '#new' } },
        callbacks
      );

      expect(result).toMatchObject({
        success: false,
        error: expect.stringContaining('Invalid path'),
      });
    });

    it('applies a boolean parameter with switch override on searchBox', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.searchBox',
            parameters: { container: '#search-box', searchAsYouType: true },
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'edit_widget',
        { path: '0', parameters: { searchAsYouType: false } },
        callbacks
      );

      expect(result).toMatchObject({
        success: true,
        applied: ['searchAsYouType'],
        rejected: [],
      });
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0],
        'searchAsYouType',
        false
      );
    });

    it('applies an object parameter (cssClasses) on searchBox', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.searchBox',
            parameters: { container: '#search-box' },
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'edit_widget',
        {
          path: '0',
          parameters: {
            cssClasses: { root: 'my-root', input: 'my-input' },
          },
        },
        callbacks
      );

      expect(result).toMatchObject({
        success: true,
        applied: ['cssClasses'],
        rejected: [],
      });
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0],
        'cssClasses',
        { root: 'my-root', input: 'my-input' }
      );
    });

    it('applies a json parameter (searchParameters) on configure', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.configure',
            parameters: { searchParameters: { hitsPerPage: 10 } },
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'edit_widget',
        {
          path: '0',
          parameters: {
            searchParameters: { hitsPerPage: 20, filters: 'category:Books' },
          },
        },
        callbacks
      );

      expect(result).toMatchObject({
        success: true,
        applied: ['searchParameters'],
        rejected: [],
      });
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0],
        'searchParameters',
        { hitsPerPage: 20, filters: 'category:Books' }
      );
    });

    it('edits ais.stats cssClasses', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.stats',
            parameters: { container: '#stats' },
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'edit_widget',
        {
          path: '0',
          parameters: { cssClasses: { root: 'my-stats', text: 'my-text' } },
        },
        callbacks
      );

      expect(result).toMatchObject({
        success: true,
        applied: ['cssClasses'],
      });
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0],
        'cssClasses',
        { root: 'my-stats', text: 'my-text' }
      );
    });

    it('edits hitsPerPage items parameter', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.hitsPerPage',
            parameters: {
              container: '#hits-per-page',
              items: [{ value: '20', label: '20 per page' }],
            },
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'edit_widget',
        {
          path: '0',
          parameters: {
            items: [
              { value: '20', label: '20 per page' },
              { value: '50', label: '50 per page' },
            ],
          },
        },
        callbacks
      );

      expect(result).toMatchObject({
        success: true,
        applied: ['items'],
      });
      expect(callbacks.onParameterChange).toHaveBeenCalledWith([0], 'items', [
        { value: '20', label: '20 per page' },
        { value: '50', label: '50 per page' },
      ]);
    });

    it('edits menu attribute parameter', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.menu',
            parameters: { container: '#menu', attribute: 'category' },
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'edit_widget',
        { path: '0', parameters: { attribute: 'brand' } },
        callbacks
      );

      expect(result).toMatchObject({
        success: true,
        applied: ['attribute'],
      });
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0],
        'attribute',
        'brand'
      );
    });

    it('edits ratingMenu attribute parameter', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.ratingMenu',
            parameters: { container: '#rating', attribute: 'rating' },
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'edit_widget',
        { path: '0', parameters: { attribute: 'score' } },
        callbacks
      );

      expect(result).toMatchObject({
        success: true,
        applied: ['attribute'],
      });
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0],
        'attribute',
        'score'
      );
    });

    it('edits rangeSlider number parameters', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.rangeSlider',
            parameters: {
              container: '#price-range',
              attribute: 'price',
              min: 0,
              max: 1000,
            },
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'edit_widget',
        { path: '0', parameters: { min: 10, max: 500 } },
        callbacks
      );

      expect(result).toMatchObject({
        success: true,
        applied: expect.arrayContaining(['min', 'max']),
      });
      expect(callbacks.onParameterChange).toHaveBeenCalledWith([0], 'min', 10);
      expect(callbacks.onParameterChange).toHaveBeenCalledWith([0], 'max', 500);
    });

    it('edits trendingItems limit and threshold parameters', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.trendingItems',
            parameters: { container: '#trending', limit: 5 },
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'edit_widget',
        { path: '0', parameters: { limit: 20, threshold: 80 } },
        callbacks
      );

      expect(result).toMatchObject({
        success: true,
        applied: ['limit', 'threshold'],
      });
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0],
        'limit',
        20
      );
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0],
        'threshold',
        80
      );
    });

    it('edits hierarchicalMenu attributes and separator', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.hierarchicalMenu',
            parameters: {
              container: '#hierarchical-menu',
              attributes: ['categories.lvl0', 'categories.lvl1'],
              separator: ' > ',
            },
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'edit_widget',
        {
          path: '0',
          parameters: {
            attributes: ['tags.lvl0', 'tags.lvl1', 'tags.lvl2'],
            separator: ' / ',
          },
        },
        callbacks
      );

      expect(result).toMatchObject({
        success: true,
        applied: ['attributes', 'separator'],
      });
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0],
        'attributes',
        ['tags.lvl0', 'tags.lvl1', 'tags.lvl2']
      );
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0],
        'separator',
        ' / '
      );
    });

    it('edits numericMenu attribute and items', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.numericMenu',
            parameters: {
              container: '#numeric-menu',
              attribute: 'price',
              items: [{ label: 'All' }],
            },
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'edit_widget',
        {
          path: '0',
          parameters: {
            attribute: 'rating',
            items: [{ label: 'All' }, { label: '4 stars and up', start: 4 }],
          },
        },
        callbacks
      );

      expect(result).toMatchObject({
        success: true,
        applied: expect.arrayContaining(['attribute', 'items']),
      });
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0],
        'attribute',
        'rating'
      );
      expect(callbacks.onParameterChange).toHaveBeenCalledWith([0], 'items', [
        { label: 'All' },
        { label: '4 stars and up', start: 4 },
      ]);
    });

    it('applies list parameter changes on currentRefinements', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.currentRefinements',
            parameters: {
              container: '#current-refinements',
              includedAttributes: [],
              excludedAttributes: [],
            },
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'edit_widget',
        {
          path: '0',
          parameters: {
            includedAttributes: ['brand'],
            excludedAttributes: ['query'],
          },
        },
        callbacks
      );

      expect(result).toMatchObject({
        success: true,
        applied: expect.arrayContaining([
          'includedAttributes',
          'excludedAttributes',
        ]),
      });
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0],
        'includedAttributes',
        ['brand']
      );
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0],
        'excludedAttributes',
        ['query']
      );
    });

    it('edits rangeInput number parameters', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.rangeInput',
            parameters: {
              container: '#range',
              attribute: 'price',
              min: 0,
              max: 1000,
            },
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'edit_widget',
        { path: '0', parameters: { min: 10, max: 500, precision: 2 } },
        callbacks
      );

      expect(result).toMatchObject({
        success: true,
        applied: expect.arrayContaining(['min', 'max', 'precision']),
      });
      expect(callbacks.onParameterChange).toHaveBeenCalledWith([0], 'min', 10);
      expect(callbacks.onParameterChange).toHaveBeenCalledWith([0], 'max', 500);
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0],
        'precision',
        2
      );
    });

    it('edits breadcrumb attributes and separator', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.breadcrumb',
            parameters: {
              container: '#breadcrumb',
              attributes: [
                'hierarchicalCategories.lvl0',
                'hierarchicalCategories.lvl1',
              ],
              separator: ' > ',
            },
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'edit_widget',
        {
          path: '0',
          parameters: {
            attributes: [
              'hierarchicalCategories.lvl0',
              'hierarchicalCategories.lvl1',
              'hierarchicalCategories.lvl2',
            ],
            separator: ' / ',
          },
        },
        callbacks
      );

      expect(result).toMatchObject({
        success: true,
        applied: expect.arrayContaining(['attributes', 'separator']),
      });
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0],
        'attributes',
        [
          'hierarchicalCategories.lvl0',
          'hierarchicalCategories.lvl1',
          'hierarchicalCategories.lvl2',
        ]
      );
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0],
        'separator',
        ' / '
      );
    });

    it('edits sortBy items parameter', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.sortBy',
            parameters: {
              container: '#sort',
              items: [{ value: 'products', label: 'Featured' }],
            },
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'edit_widget',
        {
          path: '0',
          parameters: {
            items: [
              { value: 'products', label: 'Featured' },
              { value: 'products_price_asc', label: 'Price (asc)' },
            ],
          },
        },
        callbacks
      );

      expect(result).toMatchObject({
        success: true,
        applied: ['items'],
      });
      expect(callbacks.onParameterChange).toHaveBeenCalledWith([0], 'items', [
        { value: 'products', label: 'Featured' },
        { value: 'products_price_asc', label: 'Price (asc)' },
      ]);
    });
  });

  describe('remove_widget', () => {
    it('calls onDeleteBlock for valid path', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.autocomplete',
            parameters: { container: '#search' },
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'remove_widget',
        { path: '0' },
        callbacks
      );

      expect(callbacks.onDeleteBlock).toHaveBeenCalledWith([0]);
      expect(result).toMatchObject({
        success: true,
        removedType: 'ais.autocomplete',
      });
    });

    it('validates path bounds', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.autocomplete',
            parameters: { container: '#search' },
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'remove_widget',
        { path: '3' },
        callbacks
      );

      expect(result).toMatchObject({ success: false });
      expect(callbacks.onDeleteBlock).not.toHaveBeenCalled();
    });

    it('removes an index block with children', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.index',
            parameters: { indexName: 'products' },
            children: [
              {
                type: 'ais.autocomplete',
                parameters: { container: '#search' },
              },
            ],
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'remove_widget',
        { path: '0' },
        callbacks
      );

      expect(callbacks.onDeleteBlock).toHaveBeenCalledWith([0]);
      expect(result).toMatchObject({
        success: true,
        removedType: 'ais.index',
      });
    });

    it('removes a nested child widget', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.index',
            parameters: { indexName: 'products' },
            children: [
              {
                type: 'ais.autocomplete',
                parameters: { container: '#search' },
              },
              {
                type: 'ais.autocomplete',
                parameters: { container: '#box' },
              },
            ],
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'remove_widget',
        { path: '0.1' },
        callbacks
      );

      expect(callbacks.onDeleteBlock).toHaveBeenCalledWith([0, 1]);
      expect(result).toMatchObject({
        success: true,
        removedType: 'ais.autocomplete',
      });
    });

    it('rejects malformed paths', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.autocomplete',
            parameters: { container: '#search' },
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const malformedPaths = ['', '.', 'a.b', '0.0.0', '-1'];

      for (const path of malformedPaths) {
        const result = await executeToolCall(
          'remove_widget',
          { path },
          callbacks
        );
        expect(result).toMatchObject({ success: false });
      }

      expect(callbacks.onDeleteBlock).not.toHaveBeenCalled();
    });

    it('returns a clear error for empty experience', async () => {
      const callbacks = createCallbacks({ blocks: [], indexName: '' });

      const result = await executeToolCall(
        'remove_widget',
        { path: '0' },
        callbacks
      );

      expect(result).toMatchObject({
        success: false,
        error: expect.stringContaining('Invalid path'),
      });
    });
  });

  describe('move_widget', () => {
    it('calls onMoveBlock for valid nested path', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.index',
            parameters: { indexName: 'products' },
            children: [
              {
                type: 'ais.autocomplete',
                parameters: { container: '#search' },
              },
            ],
          },
          {
            type: 'ais.index',
            parameters: { indexName: 'articles' },
            children: [],
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'move_widget',
        { path: '0.0', to_index: 1 },
        callbacks
      );

      expect(callbacks.onMoveBlock).toHaveBeenCalledWith([0, 0], 1);
      expect(result).toMatchObject({
        success: true,
        movedType: 'ais.autocomplete',
      });
    });

    it('rejects top-level paths', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.autocomplete',
            parameters: { container: '#search' },
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'move_widget',
        { path: '0', to_index: 1 },
        callbacks
      );

      expect(result).toMatchObject({ success: false });
    });

    it('rejects out-of-bounds to_index', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.index',
            parameters: { indexName: 'products' },
            children: [
              {
                type: 'ais.autocomplete',
                parameters: { container: '#search' },
              },
            ],
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'move_widget',
        { path: '0.0', to_index: 99 },
        callbacks
      );

      expect(result).toMatchObject({
        success: false,
        error: expect.stringContaining('not an ais.index block'),
      });
      expect(callbacks.onMoveBlock).not.toHaveBeenCalled();
    });

    it('rejects non-existent nested path', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.index',
            parameters: { indexName: 'products' },
            children: [],
          },
          {
            type: 'ais.index',
            parameters: { indexName: 'articles' },
            children: [],
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'move_widget',
        { path: '0.5', to_index: 1 },
        callbacks
      );

      expect(result).toMatchObject({
        success: false,
        error: expect.stringContaining('Invalid path'),
      });
      expect(callbacks.onMoveBlock).not.toHaveBeenCalled();
    });

    it('rejects non-index target', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.index',
            parameters: { indexName: 'products' },
            children: [
              {
                type: 'ais.autocomplete',
                parameters: { container: '#search' },
              },
            ],
          },
          {
            type: 'ais.chat',
            parameters: { placement: 'body', agentId: '' },
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);

      const result = await executeToolCall(
        'move_widget',
        { path: '0.0', to_index: 1 },
        callbacks
      );

      expect(result).toMatchObject({
        success: false,
        error: expect.stringContaining('not an ais.index block'),
      });
    });
  });
});

describe('describeToolAction', () => {
  it('describes get_experience', async () => {
    expect(describeToolAction('get_experience', {}, {})).toBe(
      'Checked experience state'
    );
  });

  it('describes add_widget with type and container', async () => {
    expect(
      describeToolAction(
        'add_widget',
        { type: 'ais.autocomplete', container: '#search' },
        { success: true }
      )
    ).toBe('Added ais.autocomplete to #search');
  });

  it('describes add_widget without container', async () => {
    expect(
      describeToolAction('add_widget', { type: 'ais.chat' }, { success: true })
    ).toBe('Added ais.chat');
  });

  it('describes add_widget with body placement', async () => {
    expect(
      describeToolAction(
        'add_widget',
        { type: 'ais.chat', placement: 'body' },
        { success: true }
      )
    ).toBe('Added ais.chat to body');
  });

  it('describes add_widget with before placement', async () => {
    expect(
      describeToolAction(
        'add_widget',
        {
          type: 'ais.autocomplete',
          placement: 'before',
          container: '#search',
        },
        { success: true }
      )
    ).toBe('Added ais.autocomplete before #search');
  });

  it('describes edit_widget with applied params', async () => {
    expect(
      describeToolAction(
        'edit_widget',
        { path: '0' },
        { success: true, applied: ['container', 'showRecent'], rejected: [] }
      )
    ).toBe('Edited widget 0 — container, showRecent');
  });

  it('describes edit_widget with no applied params', async () => {
    expect(
      describeToolAction(
        'edit_widget',
        { path: '2' },
        { success: true, applied: [], rejected: ['unknownParam'] }
      )
    ).toBe('Edited widget 2');
  });

  it('describes remove_widget', async () => {
    expect(
      describeToolAction(
        'remove_widget',
        { path: '1' },
        { success: true, removedType: 'ais.chat' }
      )
    ).toBe('Removed widget 1');
  });

  it('describes move_widget', async () => {
    expect(
      describeToolAction(
        'move_widget',
        { path: '0.0', to_index: 1 },
        { success: true }
      )
    ).toBe('Moved widget 0.0 to index 1');
  });

  it('falls back for unknown tools', async () => {
    expect(describeToolAction('unknown_tool', {}, {})).toBe('Action completed');
  });

  it('handles undefined input and output', async () => {
    expect(describeToolAction('add_widget', undefined, undefined)).toBe(
      'Added widget'
    );
    expect(describeToolAction('edit_widget', undefined, undefined)).toBe(
      'Edited widget '
    );
    expect(describeToolAction('remove_widget', undefined, undefined)).toBe(
      'Removed widget '
    );
  });

  it('describes get_suggestions', async () => {
    expect(
      describeToolAction(
        'get_suggestions',
        { suggestKind: 'facetAttributes', indexName: 'products' },
        { values: ['brand', 'color'] }
      )
    ).toBe('Fetched suggestions for facetAttributes');
  });
});

describe('buildToolDefinitions', () => {
  it('returns 6 tools', async () => {
    const tools = buildToolDefinitions();
    expect(tools).toHaveLength(6);
  });

  it('returns tools with the expected names', async () => {
    const tools = buildToolDefinitions();
    const names = tools.map((tool) => {
      return tool.name;
    });
    expect(names).toEqual([
      'get_experience',
      'add_widget',
      'edit_widget',
      'remove_widget',
      'move_widget',
      'get_suggestions',
    ]);
  });

  it('each tool has name, description, inputSchema, and type client_side', async () => {
    const tools = buildToolDefinitions();
    for (const tool of tools) {
      expect(tool).toHaveProperty('name');
      expect(tool).toHaveProperty('description');
      expect(tool).toHaveProperty('inputSchema');
      expect(tool.type).toBe('client_side');
      expect(typeof tool.description).toBe('string');
      expect(typeof tool.inputSchema).toBe('object');
    }
  });
});

describe('get_suggestions', () => {
  it('returns error when suggestKind is missing', async () => {
    const callbacks = createCallbacks();
    const result = await executeToolCall(
      'get_suggestions',
      { indexName: 'products' },
      callbacks
    );
    expect(result).toEqual({
      success: false,
      error: 'Missing required parameter: suggestKind',
    });
  });

  it('returns error when indexName is missing for index-bound kind', async () => {
    const callbacks = createCallbacks();
    const result = await executeToolCall(
      'get_suggestions',
      { suggestKind: 'facetAttributes' },
      callbacks
    );
    expect(result).toEqual({
      success: false,
      error: 'Missing required parameter: indexName',
    });
  });

  it('returns error for unknown suggestKind', async () => {
    const callbacks = createCallbacks();
    const result = await executeToolCall(
      'get_suggestions',
      { suggestKind: 'unknownKind', indexName: 'products' },
      callbacks
    );
    expect(result).toEqual({
      error: 'Unknown suggestion source: unknownKind',
    });
  });

  it('calls getCredentials and returns fetch error for valid kind', async () => {
    const callbacks = createCallbacks();
    const result = await executeToolCall(
      'get_suggestions',
      { suggestKind: 'facetAttributes', indexName: 'products' },
      callbacks
    );
    expect(callbacks.getCredentials).toHaveBeenCalled();
    expect(result).toEqual({
      error:
        'Failed to fetch suggestions from facetAttributes for index "products"',
    });
  });

  it('does not require indexName for agentStudioAgents kind', async () => {
    const callbacks = createCallbacks();
    const result = await executeToolCall(
      'get_suggestions',
      { suggestKind: 'agentStudioAgents' },
      callbacks
    );
    expect(callbacks.getCredentials).toHaveBeenCalled();
    expect(callbacks.getEnv).toHaveBeenCalled();
    // The fetch will fail (no MSW handler), but it should not error on missing indexName
    expect(result).toEqual({
      error: 'Failed to fetch suggestions from agentStudioAgents',
    });
  });

  it('does not require indexName for indices kind', async () => {
    const callbacks = createCallbacks();
    const result = await executeToolCall(
      'get_suggestions',
      { suggestKind: 'indices' },
      callbacks
    );
    expect(callbacks.getCredentials).toHaveBeenCalled();
    // Returns empty (fetchIndices returns [] on network error) — no indexName error
    expect(result).toEqual({
      values: [],
      description: 'Available Algolia indices',
    });
  });

  it('requires indexName for indices:replicas kind', async () => {
    const callbacks = createCallbacks();
    const result = await executeToolCall(
      'get_suggestions',
      { suggestKind: 'indices:replicas' },
      callbacks
    );
    expect(result).toEqual({
      success: false,
      error: 'Missing required parameter: indexName',
    });
  });
});
