import type { Ref } from 'preact';
import { useMemo, useEffect, useRef, useState } from 'preact/hooks';

import type { ThemeOverrideValue, ThemePreset } from '@experiences/theme';

import type {
  AddBlockResult,
  BlockPath,
  ExperienceApiResponse,
  SaveState,
} from '../types';
import {
  useAgentStudioAgents,
  useFacetAttributes,
  useIndexAttributes,
  useIndices,
} from '../hooks/use-indices';
import type { IndexSuggestKind } from '../widget-types';
import { Check, LayoutGrid, LoaderCircle, Palette, X } from 'lucide-preact';

import { AlgoliaLogo } from './icons/algolia-logo';
import { AddWidgetPopover } from './add-widget-popover';
import { BlockCard } from './block-card';
import { IndexBlockGroup } from './index-block-group';
import { ThemeEditor } from './theme-editor';
import { Button } from './ui/button';
import type { Suggestion } from './ui/combobox';
import { TabsList, TabsTrigger, TabsContent } from './ui/tabs';

export type SuggestLists = Partial<Record<IndexSuggestKind, Suggestion[]>>;

type PanelProps = {
  experience: ExperienceApiResponse;
  dirty: boolean;
  saveState: SaveState;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  onParameterChange: (path: BlockPath, key: string, value: unknown) => void;
  onLocate: (container: string, placement: string | undefined) => void;
  onDeleteBlock: (path: BlockPath) => void;
  onAddBlock: (type: string, targetParentIndex?: number) => AddBlockResult;
  onChangeWidgetIndex: (widgetPath: BlockPath, targetIndexName: string) => void;
  onPickElement: (callback: (selector: string) => void) => void;
  panelRef?: Ref<HTMLDivElement>;
  themeOverrides: {
    light: Record<string, ThemeOverrideValue>;
    dark: Record<string, ThemeOverrideValue>;
  };
  baselineOverrides: {
    light: Record<string, ThemeOverrideValue>;
    dark: Record<string, ThemeOverrideValue>;
  };
  themeMode: 'light' | 'dark';
  onThemeVariableChange: (key: string, value: ThemeOverrideValue) => void;
  onThemeVariableReset: (key: string) => void;
  onThemeResetAll: () => void;
  onThemeModeChange: (mode: 'light' | 'dark') => void;
  themeModeConfig: 'adaptive' | 'fixed';
  onThemeModeConfigChange: (modeConfig: 'adaptive' | 'fixed') => void;
  onPresetApply: (preset: ThemePreset) => void;
};

type Tab = 'blocks' | 'theme';

export function Panel({
  experience,
  dirty,
  saveState,
  open,
  onClose,
  onSave,
  onParameterChange,
  onLocate,
  onDeleteBlock,
  onAddBlock,
  onChangeWidgetIndex,
  onPickElement,
  panelRef,
  themeOverrides,
  baselineOverrides,
  themeMode,
  onThemeVariableChange,
  onThemeVariableReset,
  onThemeResetAll,
  onThemeModeChange,
  themeModeConfig,
  onThemeModeConfigChange,
  onPresetApply,
}: PanelProps) {
  const [tab, setTab] = useState<Tab>('blocks');
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null);
  const prevBlocksRef = useRef(experience.blocks);

  const autocompleteBlocks = experience.blocks.flatMap((block) => {
    if (block.type === 'ais.autocomplete') return [block];
    return (
      block.children?.filter((child) => {
        return child.type === 'ais.autocomplete';
      }) ?? []
    );
  });
  const hasAutocomplete = autocompleteBlocks.length > 0;
  const hasTwoColumnLayout = autocompleteBlocks.some((block) => {
    return block.parameters.panelLayout === 'two-columns';
  });

  const allIndexNames = useIndices();
  const qsIndexNames = useIndices({
    type: 'querySuggestions',
    enabled:
      expandedBlock !== null &&
      experience.blocks[Number(expandedBlock)]?.type === 'ais.autocomplete',
  });
  const agentStudioAgents = useAgentStudioAgents();
  const agentSuggestions = useMemo(() => {
    return agentStudioAgents.map((agent) => {
      return { value: agent.id, label: agent.name };
    });
  }, [agentStudioAgents]);
  const facetAttributes = useFacetAttributes(experience.indexName);
  const indexAttributes = useIndexAttributes(experience.indexName);
  const suggestLists: SuggestLists = useMemo(() => {
    return {
      indices: allIndexNames.length > 0 ? allIndexNames : undefined,
      'indices:qs': qsIndexNames.length > 0 ? qsIndexNames : undefined,
      agentStudioAgents:
        agentSuggestions.length > 0 ? agentSuggestions : undefined,
      facetAttributes: facetAttributes.length > 0 ? facetAttributes : undefined,
      indexAttributes: indexAttributes.length > 0 ? indexAttributes : undefined,
    };
  }, [
    allIndexNames,
    qsIndexNames,
    agentSuggestions,
    facetAttributes,
    indexAttributes,
  ]);

  const widgetCount = experience.blocks.reduce((count, block) => {
    return block.type === 'ais.index'
      ? count + (block.children?.length ?? 0)
      : count + 1;
  }, 0);

  const indexBlocks = useMemo(() => {
    return experience.blocks
      .map((block, index) => {
        return { index, block };
      })
      .filter(({ block }) => {
        return block.type === 'ais.index';
      });
  }, [experience.blocks]);

  useEffect(() => {
    const prev = prevBlocksRef.current;
    const curr = experience.blocks;
    prevBlocksRef.current = curr;

    if (curr.length > prev.length) {
      const lastIdx = curr.length - 1;
      const lastBlock = curr[lastIdx]!;

      if (
        lastBlock.type === 'ais.index' &&
        (lastBlock.children?.length ?? 0) > 0
      ) {
        setExpandedBlock(`${lastIdx}.${lastBlock.children!.length - 1}`);
      } else {
        setExpandedBlock(String(lastIdx));
      }
    } else if (curr.length < prev.length) {
      // Blocks were removed (e.g. empty index auto-cleanup) — reset
      setExpandedBlock(null);
    } else {
      for (let i = 0; i < curr.length; i++) {
        const currBlock = curr[i]!;
        const prevBlock = prev[i];
        if (
          currBlock.type === 'ais.index' &&
          prevBlock?.type === 'ais.index' &&
          (currBlock.children?.length ?? 0) > (prevBlock.children?.length ?? 0)
        ) {
          const childIdx = currBlock.children!.length - 1;
          setExpandedBlock(`${i}.${childIdx}`);
          break;
        }
      }
    }
  }, [experience.blocks]);

  const handleToggleExpand = (key: string) => {
    setExpandedBlock(expandedBlock === key ? null : key);
  };

  return (
    <div
      ref={panelRef}
      class="bg-background text-foreground fixed left-0 top-0 bottom-0 z-[2147483647] flex w-[480px] flex-col border-r shadow-2xl transition-transform duration-300 ease-in-out"
      style={{ transform: open ? 'translateX(0)' : 'translateX(-100%)' }}
      aria-hidden={!open || undefined}
      inert={!open || undefined}
    >
      {/* Header */}
      <div class="flex items-center justify-between px-4 pt-3 pb-1.5">
        <div class="flex items-center gap-3">
          <AlgoliaLogo class="size-7 text-primary" />
          <div>
            <h2 class="text-sm font-semibold">Algolia Experiences</h2>
            <p class="text-muted-foreground text-xs">
              {widgetCount} block
              {widgetCount !== 1 ? 's' : ''} configured
            </p>
          </div>
        </div>
        <div class="flex items-center gap-1">
          <Button
            disabled={!dirty || saveState !== 'idle'}
            onClick={onSave}
            class={
              saveState === 'saved'
                ? 'bg-green-600 hover:bg-green-600'
                : undefined
            }
          >
            {saveState === 'saving' && (
              <LoaderCircle class="size-4 animate-spin" />
            )}
            {saveState === 'saved' && <Check class="size-4" />}
            {saveState === 'idle' && 'Save'}
            {saveState === 'saving' && 'Saving\u2026'}
            {saveState === 'saved' && 'Saved'}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close toolbar"
          >
            <X class="size-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div class="px-4 pt-1.5 pb-3 border-b">
        <TabsList>
          <TabsTrigger
            active={tab === 'blocks'}
            onClick={() => {
              return setTab('blocks');
            }}
          >
            <LayoutGrid class="size-4" />
            Blocks
          </TabsTrigger>
          <TabsTrigger
            active={tab === 'theme'}
            onClick={() => {
              return setTab('theme');
            }}
          >
            <Palette class="size-4" />
            Theme
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Blocks tab */}
      <TabsContent
        active={tab === 'blocks'}
        class="flex flex-1 flex-col overflow-hidden"
      >
        {/* Block list */}
        <div class="flex-1 overflow-y-auto p-4 pb-40">
          <div class="space-y-3">
            {experience.blocks.map((block, index) => {
              if (block.type === 'ais.index') {
                return (
                  <IndexBlockGroup
                    key={index}
                    block={block}
                    parentIndex={index}
                    expandedBlock={expandedBlock}
                    indexBlocks={indexBlocks}
                    suggestLists={suggestLists}
                    onToggleExpand={handleToggleExpand}
                    onParameterChange={onParameterChange}
                    onLocate={onLocate}
                    onDeleteBlock={onDeleteBlock}
                    onChangeWidgetIndex={onChangeWidgetIndex}
                    onPickElement={onPickElement}
                    onNavigateToTheme={() => {
                      return setTab('theme');
                    }}
                  />
                );
              }

              return (
                <BlockCard
                  key={index}
                  type={block.type}
                  parameters={block.parameters}
                  open={expandedBlock === String(index)}
                  onToggle={() => {
                    return handleToggleExpand(String(index));
                  }}
                  onParameterChange={(key, value) => {
                    return onParameterChange([index], key, value);
                  }}
                  onLocate={() => {
                    return onLocate(
                      block.parameters.container ?? '',
                      block.parameters.placement as string | undefined
                    );
                  }}
                  onDeleteBlock={() => {
                    return onDeleteBlock([index]);
                  }}
                  onPickElement={onPickElement}
                  onNavigateToTheme={
                    block.type === 'ais.autocomplete'
                      ? () => {
                          return setTab('theme');
                        }
                      : undefined
                  }
                  suggestLists={suggestLists}
                />
              );
            })}
            <AddWidgetPopover
              onSelect={onAddBlock}
              filter={(widgetType) => {
                return widgetType === 'ais.autocomplete';
              }}
            />
          </div>
        </div>
      </TabsContent>

      {/* Theme tab */}
      <TabsContent
        active={tab === 'theme'}
        class="flex flex-1 flex-col overflow-hidden"
      >
        {hasAutocomplete ? (
          <ThemeEditor
            themeOverrides={themeOverrides}
            baselineOverrides={baselineOverrides}
            themeMode={themeMode}
            onThemeVariableChange={onThemeVariableChange}
            onThemeVariableReset={onThemeVariableReset}
            onThemeResetAll={onThemeResetAll}
            onThemeModeChange={onThemeModeChange}
            themeModeConfig={themeModeConfig}
            onThemeModeConfigChange={onThemeModeConfigChange}
            onPresetApply={onPresetApply}
            hasTwoColumnLayout={hasTwoColumnLayout}
          />
        ) : (
          <div class="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <p class="text-sm text-muted-foreground">
              Add an Autocomplete block to start customizing the theme.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                return setTab('blocks');
              }}
            >
              Go to blocks
            </Button>
          </div>
        )}
      </TabsContent>
    </div>
  );
}
