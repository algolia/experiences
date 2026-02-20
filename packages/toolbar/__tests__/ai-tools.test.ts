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
  experience: ExperienceApiResponse = { blocks: [] }
): ToolCallbacks {
  return {
    onAddBlock: vi.fn(),
    onParameterChange: vi.fn(),
    onCssVariableChange: vi.fn(),
    onDeleteBlock: vi.fn(),
    getExperience: vi.fn(() => experience),
  };
}

describe('describeWidgetTypes', () => {
  it('includes enabled widget types', () => {
    const result = describeWidgetTypes();
    expect(result).toContain('ais.autocomplete');
    expect(result).toContain('Autocomplete');
    expect(result).toContain('ais.chat');
    expect(result).toContain('Chat');
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

  it('excludes disabled widget types', () => {
    const result = describeWidgetTypes();
    expect(result).not.toContain('ais.hits');
    expect(result).not.toContain('ais.searchBox');
    expect(result).not.toContain('ais.pagination');
  });
});

describe('describeExperience', () => {
  it('returns a message for empty experiences', () => {
    const result = describeExperience({ blocks: [] });
    expect(result).toBe('The experience has no widgets yet.');
  });

  it('formats blocks with indices and placement', () => {
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
  it('uses default placement from widget config when not in parameters', () => {
    const experience: ExperienceApiResponse = {
      blocks: [
        {
          type: 'ais.chat',
          parameters: { agentId: 'agent-1' },
        },
      ],
    };

    const result = describeExperience(experience);
    expect(result).toContain('[0] Chat (ais.chat) [body]');
  });
});

describe('getTools', () => {
  it('returns four tools', () => {
    const tools = getTools(createCallbacks());
    expect(Object.keys(tools)).toEqual([
      'get_experience',
      'add_widget',
      'edit_widget',
      'remove_widget',
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
    it('calls onAddBlock and onParameterChange for container and placement', async () => {
      const experience: ExperienceApiResponse = { blocks: [] };
      const callbacks = createCallbacks(experience);
      const tools = getTools(callbacks);

      const result = await tools.add_widget.execute!(
        { type: 'ais.autocomplete', container: '#search' },
        { toolCallId: 'tc1', messages: [] }
      );

      expect(callbacks.onAddBlock).toHaveBeenCalledWith('ais.autocomplete');
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        0,
        'placement',
        'inside'
      );
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        0,
        'container',
        '#search'
      );
      expect(result).toMatchObject({
        success: true,
        index: 0,
        type: 'ais.autocomplete',
        placement: 'inside',
        container: '#search',
        applied: ['placement', 'container'],
        rejected: [],
      });
    });

    it('applies additional parameters', async () => {
      const experience: ExperienceApiResponse = { blocks: [] };
      const callbacks = createCallbacks(experience);
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
        0,
        'showRecent',
        true
      );
    });

    it('rejects disallowed parameters', async () => {
      const experience: ExperienceApiResponse = { blocks: [] };
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
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        0,
        'showRecent',
        true
      );
      expect(callbacks.onParameterChange).not.toHaveBeenCalledWith(
        0,
        'unknownParam',
        expect.anything()
      );
    });

    it('adds widget with body placement and no container', async () => {
      const experience: ExperienceApiResponse = { blocks: [] };
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
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        0,
        'placement',
        'body'
      );
      expect(callbacks.onParameterChange).not.toHaveBeenCalledWith(
        0,
        'container',
        expect.anything()
      );
    });

    it('uses default placement from widget config when not specified', async () => {
      const experience: ExperienceApiResponse = { blocks: [] };
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
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        0,
        'placement',
        'body'
      );
    });

    it('adds widget with explicit before placement', async () => {
      const experience: ExperienceApiResponse = { blocks: [] };
      const callbacks = createCallbacks(experience);
      const tools = getTools(callbacks);

      const result = await tools.add_widget.execute!(
        { type: 'ais.autocomplete', placement: 'before', container: '#search' },
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
      const experience: ExperienceApiResponse = { blocks: [] };
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
      const experience: ExperienceApiResponse = { blocks: [] };
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

    it('computes the correct index for non-empty experiences', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.autocomplete',
            parameters: { container: '#search' },
          },
        ],
      };
      const callbacks = createCallbacks(experience);
      const tools = getTools(callbacks);

      const result = await tools.add_widget.execute!(
        { type: 'ais.chat', container: '#chat' },
        { toolCallId: 'tc2', messages: [] }
      );

      expect(result).toMatchObject({ index: 1 });
    });
  });

  describe('edit_widget', () => {
    it('validates index bounds', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.autocomplete',
            parameters: { container: '#search' },
          },
        ],
      };
      const callbacks = createCallbacks(experience);
      const tools = getTools(callbacks);

      const result = await tools.edit_widget.execute!(
        { index: 5, parameters: { container: '#new' } },
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
      };
      const callbacks = createCallbacks(experience);
      const tools = getTools(callbacks);

      const result = await tools.edit_widget.execute!(
        { index: 0, parameters: { container: '#new', showRecent: true } },
        { toolCallId: 'tc1', messages: [] }
      );

      expect(result).toMatchObject({
        success: true,
        applied: expect.arrayContaining(['container', 'showRecent']),
      });
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        0,
        'container',
        '#new'
      );
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        0,
        'showRecent',
        true
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
      };
      const callbacks = createCallbacks(experience);
      const tools = getTools(callbacks);

      const result = await tools.edit_widget.execute!(
        { index: 0, parameters: { container: '#new', unknownParam: 42 } },
        { toolCallId: 'tc1', messages: [] }
      );

      expect(result).toMatchObject({
        success: true,
        applied: ['container'],
        rejected: ['unknownParam'],
      });
    });

    it('returns a clear error for empty experience', async () => {
      const callbacks = createCallbacks({ blocks: [] });
      const tools = getTools(callbacks);

      const result = await tools.edit_widget.execute!(
        { index: 0, parameters: { container: '#new' } },
        { toolCallId: 'tc1', messages: [] }
      );

      expect(result).toMatchObject({
        success: false,
        error: expect.stringContaining('no widgets'),
      });
    });

    it('allows editing placement', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.autocomplete',
            parameters: { container: '#search', placement: 'inside' },
          },
        ],
      };
      const callbacks = createCallbacks(experience);
      const tools = getTools(callbacks);

      const result = await tools.edit_widget.execute!(
        { index: 0, parameters: { placement: 'after' } },
        { toolCallId: 'tc1', messages: [] }
      );

      expect(result).toMatchObject({
        success: true,
        applied: ['placement'],
      });
      expect(callbacks.onParameterChange).toHaveBeenCalledWith(
        0,
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
      };
      const callbacks = createCallbacks(experience);
      const tools = getTools(callbacks);

      const result = await tools.edit_widget.execute!(
        {
          index: 0,
          parameters: {
            cssVariables: { 'primary-color-rgb': '#ff0000' },
          },
        },
        { toolCallId: 'tc1', messages: [] }
      );

      expect(result).toMatchObject({ success: true });
      expect(callbacks.onCssVariableChange).toHaveBeenCalledWith(
        0,
        'primary-color-rgb',
        '#ff0000'
      );
    });
  });

  describe('remove_widget', () => {
    it('calls onDeleteBlock for valid index', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.autocomplete',
            parameters: { container: '#search' },
          },
        ],
      };
      const callbacks = createCallbacks(experience);
      const tools = getTools(callbacks);

      const result = await tools.remove_widget.execute!(
        { index: 0 },
        { toolCallId: 'tc1', messages: [] }
      );

      expect(callbacks.onDeleteBlock).toHaveBeenCalledWith(0);
      expect(result).toMatchObject({
        success: true,
        removedType: 'ais.autocomplete',
      });
    });

    it('validates index bounds', async () => {
      const experience: ExperienceApiResponse = {
        blocks: [
          {
            type: 'ais.autocomplete',
            parameters: { container: '#search' },
          },
        ],
      };
      const callbacks = createCallbacks(experience);
      const tools = getTools(callbacks);

      const result = await tools.remove_widget.execute!(
        { index: 3 },
        { toolCallId: 'tc1', messages: [] }
      );

      expect(result).toMatchObject({ success: false });
      expect(callbacks.onDeleteBlock).not.toHaveBeenCalled();
    });

    it('returns a clear error for empty experience', async () => {
      const callbacks = createCallbacks({ blocks: [] });
      const tools = getTools(callbacks);

      const result = await tools.remove_widget.execute!(
        { index: 0 },
        { toolCallId: 'tc1', messages: [] }
      );

      expect(result).toMatchObject({
        success: false,
        error: expect.stringContaining('no widgets'),
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
        { type: 'ais.autocomplete', placement: 'before', container: '#search' },
        { success: true }
      )
    ).toBe('Added ais.autocomplete before #search');
  });

  it('describes edit_widget with applied params', () => {
    expect(
      describeToolAction(
        'edit_widget',
        { index: 0 },
        { success: true, applied: ['container', 'showRecent'], rejected: [] }
      )
    ).toBe('Edited widget 0 — container, showRecent');
  });

  it('describes edit_widget with no applied params', () => {
    expect(
      describeToolAction(
        'edit_widget',
        { index: 2 },
        { success: true, applied: [], rejected: ['unknownParam'] }
      )
    ).toBe('Edited widget 2');
  });

  it('describes remove_widget', () => {
    expect(
      describeToolAction(
        'remove_widget',
        { index: 1 },
        { success: true, removedType: 'ais.chat' }
      )
    ).toBe('Removed widget 1');
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
