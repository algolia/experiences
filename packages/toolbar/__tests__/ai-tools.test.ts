import { describe, expect, it, vi } from 'vitest';

import {
  describeExperience,
  describeToolAction,
  describeWidgetTypes,
  getTools,
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
    onCssVariableChange: vi.fn(),
    onDeleteBlock: vi.fn(),
    onMoveBlock: vi.fn(),
    getExperience: vi.fn(() => {
      return experience;
    }),
  };
}

describe('describeWidgetTypes', () => {
  it('includes enabled widget types', () => {
    const result = describeWidgetTypes();
    expect(result).toContain('ais.autocomplete');
    expect(result).toContain('Autocomplete');
    expect(result).toContain('ais.chat');
    expect(result).toContain('Chat');
    expect(result).toContain('ais.index');
    expect(result).toContain('Index');
  });

  it('includes widget descriptions and parameter descriptions', () => {
    const result = describeWidgetTypes();
    expect(result).toContain('search-as-you-type');
    expect(result).toContain('Parameters:');
    expect(result).toContain('showRecent');
    expect(result).toContain('recent searches');
  });

  it('includes default placement per widget type', () => {
    const result = describeWidgetTypes();
    expect(result).toContain(
      'ais.autocomplete ("Autocomplete", default placement: inside)'
    );
    expect(result).toContain('ais.chat ("Chat", default placement: body)');
  });

  it('marks index-independent widgets', () => {
    const result = describeWidgetTypes();
    expect(result).toContain('[index-independent]');
  });

  it('excludes disabled widget types', () => {
    const result = describeWidgetTypes();
    expect(result).not.toContain('ais.hits');
    expect(result).not.toContain('ais.pagination');
  });
});

describe('describeExperience', () => {
  it('returns a message for empty experiences', () => {
    const result = describeExperience({ blocks: [], indexName: '' });
    expect(result).toBe('The experience has no widgets yet.');
  });

  it('formats blocks with paths and placement', () => {
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

  it('falls back to type string for unknown widget types', () => {
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

  it('shows placement without container when container is empty', () => {
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

  it('formats nested index blocks with child paths', () => {
    const experience: ExperienceApiResponse = {
      blocks: [
        {
          type: 'ais.index',
          parameters: { indexName: 'products' },
          blocks: [
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

  it('includes indexId when present on index blocks', () => {
    const experience: ExperienceApiResponse = {
      blocks: [
        {
          type: 'ais.index',
          parameters: { indexName: 'products', indexId: 'main' },
          blocks: [],
        },
      ],
      indexName: '',
    };

    const result = describeExperience(experience);
    expect(result).toContain('indexName: products');
    expect(result).toContain('indexId: main');
  });

  it('omits indexId when not set on index blocks', () => {
    const experience: ExperienceApiResponse = {
      blocks: [
        {
          type: 'ais.index',
          parameters: { indexName: 'products' },
          blocks: [],
        },
      ],
      indexName: '',
    };

    const result = describeExperience(experience);
    expect(result).toContain('indexName: products');
    expect(result).not.toContain('indexId');
  });

  it('uses default placement from widget config when not in parameters', () => {
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

  it('shows empty index block with "(empty)" marker', () => {
    const experience: ExperienceApiResponse = {
      blocks: [
        {
          type: 'ais.index',
          parameters: { indexName: 'products' },
          blocks: [],
        },
      ],
      indexName: '',
    };

    const result = describeExperience(experience);
    expect(result).toContain('(empty)');
  });

  it('shows "(unnamed)" when index block has no indexName', () => {
    const experience: ExperienceApiResponse = {
      blocks: [
        {
          type: 'ais.index',
          parameters: {},
          blocks: [],
        },
      ],
      indexName: '',
    };

    const result = describeExperience(experience);
    expect(result).toContain('(unnamed)');
  });
});

describe('getTools', () => {
  it('returns five tools', () => {
    const tools = getTools(createCallbacks());
    expect(Object.keys(tools)).toEqual([
      'get_experience',
      'add_widget',
      'edit_widget',
      'remove_widget',
      'move_widget',
    ]);
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
      const tools = getTools(callbacks);

      const result = await tools.get_experience.execute!(
        {},
        { toolCallId: 'tc1', messages: [] }
      );

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
      const tools = getTools(callbacks);

      const result = await tools.add_widget.execute!(
        { type: 'ais.autocomplete', container: '#search' },
        { toolCallId: 'tc1', messages: [] }
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
      const tools = getTools(callbacks);

      await tools.add_widget.execute!(
        {
          type: 'ais.autocomplete',
          container: '#search',
          parameters: { showRecent: true },
        },
        { toolCallId: 'tc1', messages: [] }
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
      const tools = getTools(callbacks);

      const result = await tools.add_widget.execute!(
        {
          type: 'ais.autocomplete',
          container: '#search',
          parameters: { showRecent: true, unknownParam: 42 },
        },
        { toolCallId: 'tc1', messages: [] }
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
      const tools = getTools(callbacks);

      const result = await tools.add_widget.execute!(
        { type: 'ais.chat', placement: 'body' },
        { toolCallId: 'tc1', messages: [] }
      );

      expect(result).toMatchObject({
        success: true,
        placement: 'body',
        applied: ['placement'],
      });
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
      const tools = getTools(callbacks);

      const result = await tools.add_widget.execute!(
        { type: 'ais.chat' },
        { toolCallId: 'tc1', messages: [] }
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
      const tools = getTools(callbacks);

      const result = await tools.add_widget.execute!(
        {
          type: 'ais.autocomplete',
          placement: 'before',
          container: '#search',
        },
        { toolCallId: 'tc1', messages: [] }
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
      const tools = getTools(callbacks);

      const result = await tools.add_widget.execute!(
        { type: 'ais.autocomplete', placement: 'before' },
        { toolCallId: 'tc1', messages: [] }
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
      const tools = getTools(callbacks);

      const result = await tools.add_widget.execute!(
        { type: 'ais.autocomplete' },
        { toolCallId: 'tc1', messages: [] }
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
      const tools = getTools(callbacks);

      const result = await tools.add_widget.execute!(
        {
          type: 'ais.autocomplete',
          parameters: { container: '#search' },
        },
        { toolCallId: 'tc1', messages: [] }
      );

      expect(result).toMatchObject({ success: true });
    });

    it('adds ais.index widget at top level', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.index',
            parameters: { indexName: 'products' },
            blocks: [],
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);
      const tools = getTools(callbacks);

      const result = await tools.add_widget.execute!(
        { type: 'ais.index', parameters: { indexName: 'products' } },
        { toolCallId: 'tc1', messages: [] }
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
      const tools = getTools(callbacks);

      const result = await tools.add_widget.execute!(
        { type: 'ais.index' },
        { toolCallId: 'tc1', messages: [] }
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
      const tools = getTools(callbacks);

      const result = await tools.add_widget.execute!(
        { type: 'ais.index' },
        { toolCallId: 'tc1', messages: [] }
      );

      expect(result).toMatchObject({ success: true });
    });

    it('adds index-dependent widget and passes target_index', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.index',
            parameters: { indexName: 'products' },
            blocks: [],
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience, [0, 0]);
      const tools = getTools(callbacks);

      const result = await tools.add_widget.execute!(
        {
          type: 'ais.autocomplete',
          container: '#search',
          target_index: 0,
        },
        { toolCallId: 'tc1', messages: [] }
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
      const tools = getTools(callbacks);

      const result = await tools.add_widget.execute!(
        {
          type: 'ais.autocomplete',
          container: '#search',
          target_index: 0,
        },
        { toolCallId: 'tc1', messages: [] }
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
      const tools = getTools(callbacks);

      const result = await tools.add_widget.execute!(
        {
          type: 'ais.autocomplete',
          container: '#search',
          target_index: 5,
        },
        { toolCallId: 'tc1', messages: [] }
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
      const tools = getTools(callbacks);

      const result = await tools.add_widget.execute!(
        { type: 'ais.autocomplete', container: '#search' },
        { toolCallId: 'tc1', messages: [] }
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
            blocks: [],
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience, [0, 0], false);
      const tools = getTools(callbacks);

      const result = await tools.add_widget.execute!(
        { type: 'ais.autocomplete', container: '#search' },
        { toolCallId: 'tc1', messages: [] }
      );

      expect(result).toMatchObject({ success: true });
      expect(result).not.toHaveProperty('note');
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
      const tools = getTools(callbacks);

      const result = await tools.edit_widget.execute!(
        { path: '5', parameters: { container: '#new' } },
        { toolCallId: 'tc1', messages: [] }
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
      const tools = getTools(callbacks);

      const result = await tools.edit_widget.execute!(
        { path: '0', parameters: { container: '#new', showRecent: true } },
        { toolCallId: 'tc1', messages: [] }
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
            blocks: [
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
      const tools = getTools(callbacks);

      const result = await tools.edit_widget.execute!(
        { path: '0.0', parameters: { container: '#new' } },
        { toolCallId: 'tc1', messages: [] }
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
      const tools = getTools(callbacks);

      const result = await tools.edit_widget.execute!(
        { path: '0', parameters: { container: '#new', unknownParam: 42 } },
        { toolCallId: 'tc1', messages: [] }
      );

      expect(result).toMatchObject({
        success: true,
        applied: ['container'],
        rejected: ['unknownParam'],
      });
    });

    it('returns a clear error for empty experience', async () => {
      const callbacks = createCallbacks({ blocks: [], indexName: '' });
      const tools = getTools(callbacks);

      const result = await tools.edit_widget.execute!(
        { path: '0', parameters: { container: '#new' } },
        { toolCallId: 'tc1', messages: [] }
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
      const tools = getTools(callbacks);

      const malformedPaths = ['', '.', 'a.b', '0.0.0', '-1'];

      for (const path of malformedPaths) {
        const result = await tools.edit_widget.execute!(
          { path, parameters: { container: '#new' } },
          { toolCallId: 'tc1', messages: [] }
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
      const tools = getTools(callbacks);

      const result = await tools.edit_widget.execute!(
        { path: '0', parameters: { placement: 'after' } },
        { toolCallId: 'tc1', messages: [] }
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

    it('handles cssVariables changes', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.autocomplete',
            parameters: {
              container: '#search',
              cssVariables: { 'primary-color-rgb': '#003dff' },
            },
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);
      const tools = getTools(callbacks);

      const result = await tools.edit_widget.execute!(
        {
          path: '0',
          parameters: {
            cssVariables: { 'primary-color-rgb': '#ff0000' },
          },
        },
        { toolCallId: 'tc1', messages: [] }
      );

      expect(result).toMatchObject({ success: true });
      expect(callbacks.onCssVariableChange).toHaveBeenCalledWith(
        [0],
        'primary-color-rgb',
        '#ff0000'
      );
    });

    it('handles multiple cssVariables in one call', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.autocomplete',
            parameters: {
              container: '#search',
              cssVariables: { 'primary-color-rgb': '#003dff' },
            },
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);
      const tools = getTools(callbacks);

      const result = await tools.edit_widget.execute!(
        {
          path: '0',
          parameters: {
            cssVariables: {
              'primary-color-rgb': '#ff0000',
              'secondary-color': '#00ff00',
            },
          },
        },
        { toolCallId: 'tc1', messages: [] }
      );

      expect(result).toMatchObject({
        success: true,
        applied: [
          'cssVariables.primary-color-rgb',
          'cssVariables.secondary-color',
        ],
      });
      expect(callbacks.onCssVariableChange).toHaveBeenCalledTimes(2);
    });

    it('applies cssVariables and regular params in one call', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.autocomplete',
            parameters: {
              container: '#search',
              cssVariables: { 'primary-color-rgb': '#003dff' },
            },
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);
      const tools = getTools(callbacks);

      const result = await tools.edit_widget.execute!(
        {
          path: '0',
          parameters: {
            showRecent: true,
            cssVariables: { 'primary-color-rgb': '#ff0000' },
          },
        },
        { toolCallId: 'tc1', messages: [] }
      );

      expect(result).toMatchObject({
        success: true,
        applied: expect.arrayContaining([
          'cssVariables.primary-color-rgb',
          'showRecent',
        ]),
      });
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        [0],
        'showRecent',
        true
      );
      expect(callbacks.onCssVariableChange).toHaveBeenCalledWith(
        [0],
        'primary-color-rgb',
        '#ff0000'
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
      const tools = getTools(callbacks);

      const result = await tools.edit_widget.execute!(
        { path: '0', parameters: { unknownA: 1, unknownB: 2 } },
        { toolCallId: 'tc1', messages: [] }
      );

      expect(result).toMatchObject({
        success: true,
        applied: [],
        rejected: ['unknownA', 'unknownB'],
      });
      expect(callbacks.onParameterChange).not.toHaveBeenCalled();
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
      const tools = getTools(callbacks);

      const result = await tools.remove_widget.execute!(
        { path: '0' },
        { toolCallId: 'tc1', messages: [] }
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
      const tools = getTools(callbacks);

      const result = await tools.remove_widget.execute!(
        { path: '3' },
        { toolCallId: 'tc1', messages: [] }
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
            blocks: [
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
      const tools = getTools(callbacks);

      const result = await tools.remove_widget.execute!(
        { path: '0' },
        { toolCallId: 'tc1', messages: [] }
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
            blocks: [
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
      const tools = getTools(callbacks);

      const result = await tools.remove_widget.execute!(
        { path: '0.1' },
        { toolCallId: 'tc1', messages: [] }
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
      const tools = getTools(callbacks);

      const malformedPaths = ['', '.', 'a.b', '0.0.0', '-1'];

      for (const path of malformedPaths) {
        const result = await tools.remove_widget.execute!(
          { path },
          { toolCallId: 'tc1', messages: [] }
        );
        expect(result).toMatchObject({ success: false });
      }

      expect(callbacks.onDeleteBlock).not.toHaveBeenCalled();
    });

    it('returns a clear error for empty experience', async () => {
      const callbacks = createCallbacks({ blocks: [], indexName: '' });
      const tools = getTools(callbacks);

      const result = await tools.remove_widget.execute!(
        { path: '0' },
        { toolCallId: 'tc1', messages: [] }
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
            blocks: [
              {
                type: 'ais.autocomplete',
                parameters: { container: '#search' },
              },
            ],
          },
          {
            type: 'ais.index',
            parameters: { indexName: 'articles' },
            blocks: [],
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);
      const tools = getTools(callbacks);

      const result = await tools.move_widget.execute!(
        { path: '0.0', to_index: 1 },
        { toolCallId: 'tc1', messages: [] }
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
      const tools = getTools(callbacks);

      const result = await tools.move_widget.execute!(
        { path: '0', to_index: 1 },
        { toolCallId: 'tc1', messages: [] }
      );

      expect(result).toMatchObject({ success: false });
    });

    it('rejects out-of-bounds to_index', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.index',
            parameters: { indexName: 'products' },
            blocks: [
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
      const tools = getTools(callbacks);

      const result = await tools.move_widget.execute!(
        { path: '0.0', to_index: 99 },
        { toolCallId: 'tc1', messages: [] }
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
            blocks: [],
          },
          {
            type: 'ais.index',
            parameters: { indexName: 'articles' },
            blocks: [],
          },
        ],
        indexName: '',
      };
      const callbacks = createCallbacks(experience);
      const tools = getTools(callbacks);

      const result = await tools.move_widget.execute!(
        { path: '0.5', to_index: 1 },
        { toolCallId: 'tc1', messages: [] }
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
            blocks: [
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
      const tools = getTools(callbacks);

      const result = await tools.move_widget.execute!(
        { path: '0.0', to_index: 1 },
        { toolCallId: 'tc1', messages: [] }
      );

      expect(result).toMatchObject({
        success: false,
        error: expect.stringContaining('not an ais.index block'),
      });
    });
  });
});

describe('describeToolAction', () => {
  it('describes get_experience', () => {
    expect(describeToolAction('get_experience', {}, {})).toBe(
      'Checked experience state'
    );
  });

  it('describes add_widget with type and container', () => {
    expect(
      describeToolAction(
        'add_widget',
        { type: 'ais.autocomplete', container: '#search' },
        { success: true }
      )
    ).toBe('Added ais.autocomplete to #search');
  });

  it('describes add_widget without container', () => {
    expect(
      describeToolAction('add_widget', { type: 'ais.chat' }, { success: true })
    ).toBe('Added ais.chat');
  });

  it('describes add_widget with body placement', () => {
    expect(
      describeToolAction(
        'add_widget',
        { type: 'ais.chat', placement: 'body' },
        { success: true }
      )
    ).toBe('Added ais.chat to body');
  });

  it('describes add_widget with before placement', () => {
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

  it('describes edit_widget with applied params', () => {
    expect(
      describeToolAction(
        'edit_widget',
        { path: '0' },
        { success: true, applied: ['container', 'showRecent'], rejected: [] }
      )
    ).toBe('Edited widget 0 — container, showRecent');
  });

  it('describes edit_widget with no applied params', () => {
    expect(
      describeToolAction(
        'edit_widget',
        { path: '2' },
        { success: true, applied: [], rejected: ['unknownParam'] }
      )
    ).toBe('Edited widget 2');
  });

  it('describes remove_widget', () => {
    expect(
      describeToolAction(
        'remove_widget',
        { path: '1' },
        { success: true, removedType: 'ais.chat' }
      )
    ).toBe('Removed widget 1');
  });

  it('describes move_widget', () => {
    expect(
      describeToolAction(
        'move_widget',
        { path: '0.0', to_index: 1 },
        { success: true }
      )
    ).toBe('Moved widget 0.0 to index 1');
  });

  it('falls back for unknown tools', () => {
    expect(describeToolAction('unknown_tool', {}, {})).toBe('Action completed');
  });

  it('handles undefined input and output', () => {
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
});
