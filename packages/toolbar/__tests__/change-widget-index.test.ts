import { describe, expect, it } from 'vitest';

import { changeWidgetIndex } from '../src/components/app';
import type { ExperienceApiBlock } from '../src/types';

function makeIndex(
  indexName: string,
  children: ExperienceApiBlock[]
): ExperienceApiBlock {
  return {
    type: 'ais.index',
    parameters: { indexName, indexId: '' },
    blocks: children,
  };
}

function makeWidget(
  type: string,
  params: Record<string, unknown> = {}
): ExperienceApiBlock {
  return { type, parameters: { container: '', ...params } };
}

describe('changeWidgetIndex', () => {
  it('returns blocks unchanged for a top-level path', () => {
    const blocks = [makeIndex('products', [makeWidget('ais.hits')])];
    const result = changeWidgetIndex(blocks, [0], 'other');
    expect(result).toEqual(blocks);
  });

  it('returns blocks unchanged when the widget does not exist', () => {
    const blocks = [makeIndex('products', [makeWidget('ais.hits')])];
    const result = changeWidgetIndex(blocks, [0, 5], 'other');
    expect(result).toEqual(blocks);
  });

  it('moves a widget to an existing index block', () => {
    const widget = makeWidget('ais.hits');
    const blocks = [
      makeIndex('products', [widget, makeWidget('ais.pagination')]),
      makeIndex('articles', [makeWidget('ais.searchBox')]),
    ];

    const result = changeWidgetIndex(blocks, [0, 0], 'articles');

    expect(result).toHaveLength(2);
    expect(result[0]!.blocks).toHaveLength(1);
    expect(result[0]!.blocks![0]!.type).toBe('ais.pagination');
    expect(result[1]!.blocks).toHaveLength(2);
    expect(result[1]!.blocks![1]!.type).toBe('ais.hits');
  });

  it('creates a new index block when target does not exist', () => {
    const blocks = [
      makeIndex('products', [
        makeWidget('ais.hits'),
        makeWidget('ais.pagination'),
      ]),
    ];

    const result = changeWidgetIndex(blocks, [0, 0], 'articles');

    expect(result).toHaveLength(2);
    expect(result[0]!.blocks).toHaveLength(1);
    expect(result[1]!.type).toBe('ais.index');
    expect(result[1]!.parameters.indexName).toBe('articles');
    expect(result[1]!.blocks).toHaveLength(1);
    expect(result[1]!.blocks![0]!.type).toBe('ais.hits');
  });

  it('removes the source index when it becomes empty', () => {
    const blocks = [
      makeIndex('products', [makeWidget('ais.hits')]),
      makeIndex('articles', [makeWidget('ais.searchBox')]),
    ];

    const result = changeWidgetIndex(blocks, [0, 0], 'articles');

    expect(result).toHaveLength(1);
    expect(result[0]!.parameters.indexName).toBe('articles');
    expect(result[0]!.blocks).toHaveLength(2);
    expect(result[0]!.blocks![1]!.type).toBe('ais.hits');
  });

  it('adjusts target index after source removal when target comes after source', () => {
    const blocks = [
      makeIndex('products', [makeWidget('ais.hits')]),
      makeIndex('articles', [makeWidget('ais.searchBox')]),
    ];

    const result = changeWidgetIndex(blocks, [0, 0], 'articles');

    // Source (index 0) was removed, so articles (originally index 1) shifted to index 0
    expect(result).toHaveLength(1);
    expect(result[0]!.parameters.indexName).toBe('articles');
    expect(result[0]!.blocks![1]!.type).toBe('ais.hits');
  });

  it('does not remove source index when it still has children', () => {
    const blocks = [
      makeIndex('products', [
        makeWidget('ais.hits'),
        makeWidget('ais.pagination'),
      ]),
      makeIndex('articles', []),
    ];

    const result = changeWidgetIndex(blocks, [0, 0], 'articles');

    expect(result).toHaveLength(2);
    expect(result[0]!.parameters.indexName).toBe('products');
    expect(result[0]!.blocks).toHaveLength(1);
    expect(result[0]!.blocks![0]!.type).toBe('ais.pagination');
  });

  it('syncs sortBy first item value to the new index name', () => {
    const sortByWidget = makeWidget('ais.sortBy', {
      items: [
        { label: 'Default', value: 'products' },
        { label: 'Price asc', value: 'products_price_asc' },
      ],
    });
    const blocks = [
      makeIndex('products', [sortByWidget]),
      makeIndex('articles', [makeWidget('ais.hits')]),
    ];

    const result = changeWidgetIndex(blocks, [0, 0], 'articles');

    const movedWidget = result[0]!.blocks![1]!;
    expect(movedWidget.type).toBe('ais.sortBy');
    const items = movedWidget.parameters.items as Array<Record<string, string>>;
    expect(items[0]!.value).toBe('articles');
    expect(items[1]!.value).toBe('products_price_asc');
  });

  it('does not modify sortBy items when there are none', () => {
    const sortByWidget = makeWidget('ais.sortBy', { items: [] });
    const blocks = [
      makeIndex('products', [sortByWidget, makeWidget('ais.hits')]),
      makeIndex('articles', []),
    ];

    const result = changeWidgetIndex(blocks, [0, 0], 'articles');

    const movedWidget = result[1]!.blocks![0]!;
    expect(movedWidget.parameters.items).toEqual([]);
  });

  it('returns blocks unchanged when target matches source index name', () => {
    const blocks = [
      makeIndex('products', [
        makeWidget('ais.hits'),
        makeWidget('ais.pagination'),
      ]),
    ];

    const result = changeWidgetIndex(blocks, [0, 0], 'products');

    expect(result).toBe(blocks);
  });

  it('creates a new index with correct parameters when target does not exist', () => {
    const blocks = [makeIndex('products', [makeWidget('ais.hits')])];

    const result = changeWidgetIndex(blocks, [0, 0], 'new-index');

    const newIndex = result[0]!;
    expect(newIndex.type).toBe('ais.index');
    expect(newIndex.parameters.indexName).toBe('new-index');
    expect(newIndex.parameters.indexId).toBe('');
  });
});
