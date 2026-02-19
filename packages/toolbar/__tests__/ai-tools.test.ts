import { describe, expect, it, vi } from 'vitest';

import {
  describeExperience,
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

  it('includes CSS variable descriptions as sub-items', () => {
    const result = describeWidgetTypes();
    expect(result).toContain('primary-color-rgb');
    expect(result).toContain('brand color');
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

  it('formats blocks with indices', () => {
    const experience: ExperienceApiResponse = {
      blocks: [
        {
          type: 'ais.autocomplete',
          parameters: { container: '#search', showRecent: false },
        },
        {
          type: 'ais.chat',
          parameters: { container: '#chat', agentId: 'agent-1' },
        },
      ],
    };

    const result = describeExperience(experience);
    expect(result).toContain('[0] Autocomplete');
    expect(result).toContain('container="#search"');
    expect(result).toContain('[1] Chat');
    expect(result).toContain('container="#chat"');
    expect(result).toContain('agentId="agent-1"');
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
    it('calls onAddBlock and onParameterChange for container', async () => {
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
        'container',
        '#search'
      );
      expect(result).toMatchObject({
        success: true,
        index: 0,
        type: 'ais.autocomplete',
        container: '#search',
        applied: ['container'],
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
        applied: expect.arrayContaining(['container', 'showRecent']),
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

    it('applies cssVariables via top-level field', async () => {
      const experience: ExperienceApiResponse = { blocks: [] };
      const callbacks = createCallbacks(experience);
      const tools = getTools(callbacks);

      const result = await tools.add_widget.execute!(
        {
          type: 'ais.autocomplete',
          container: '#search',
          cssVariables: { 'primary-color-rgb': '255, 0, 0' },
        },
        { toolCallId: 'tc1', messages: [] }
      );

      expect(result).toMatchObject({
        success: true,
        applied: expect.arrayContaining([
          'container',
          'cssVariables.primary-color-rgb',
        ]),
      });
      expect(callbacks.onCssVariableChange).toHaveBeenCalledWith(
        0,
        'primary-color-rgb',
        '255, 0, 0'
      );
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

    it('handles cssVariables changes via top-level field', async () => {
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
          cssVariables: { 'primary-color-rgb': '#ff0000' },
        },
        { toolCallId: 'tc1', messages: [] }
      );

      expect(result).toMatchObject({
        success: true,
        applied: ['cssVariables.primary-color-rgb'],
      });
      expect(callbacks.onCssVariableChange).toHaveBeenCalledWith(
        0,
        'primary-color-rgb',
        '#ff0000'
      );
    });

    it('ignores cssVariables nested inside parameters', async () => {
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
        {
          index: 0,
          parameters: {
            cssVariables: { 'primary-color-rgb': '#ff0000' },
          },
        },
        { toolCallId: 'tc1', messages: [] }
      );

      expect(callbacks.onCssVariableChange).not.toHaveBeenCalled();
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
