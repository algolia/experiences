import { useId } from 'preact/hooks';

import { useIndices } from '../../hooks/use-indices';
import { InfoTooltip } from './info-tooltip';
import { Combobox, type Suggestion } from '../ui/combobox';
import { CollapsibleContent } from '../ui/collapsible';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';

type StoredSuggestionsConfig = {
  indexName: string;
  searchPageUrl: string;
  queryParam: string;
  templates: { header: string };
};

type SuggestionsConfigFieldProps = {
  label: string;
  description?: string;
  value: Record<string, unknown> | false;
  onChange: (value: StoredSuggestionsConfig | false) => void;
  suggestLists?: Partial<Record<string, Suggestion[]>>;
};

const DEFAULT_CONFIG: StoredSuggestionsConfig = {
  indexName: '',
  searchPageUrl: '',
  queryParam: 'q',
  templates: { header: '' },
};

function normalize(value: Record<string, unknown>): StoredSuggestionsConfig {
  return {
    indexName: (value.indexName as string) ?? '',
    searchPageUrl: (value.searchPageUrl as string) ?? '',
    queryParam: (value.queryParam as string) ?? (value.q as string) ?? 'q',
    templates: {
      header:
        (value.templates as { header?: string } | undefined)?.header ?? '',
    },
  };
}

export function SuggestionsConfigField({
  label,
  description,
  value,
  onChange,
  suggestLists,
}: SuggestionsConfigFieldProps) {
  const id = useId();
  const enabled = typeof value === 'object' && value !== null;
  const config = enabled
    ? normalize(value as Record<string, unknown>)
    : DEFAULT_CONFIG;

  const qsIndices = useIndices({ type: 'querySuggestions' });
  const qsSuggestions = suggestLists?.['indices:qs'] ?? [];

  function update(patch: Partial<StoredSuggestionsConfig>) {
    onChange({ ...config, ...patch });
  }

  return (
    <div>
      <div class="flex items-center justify-between">
        <Label htmlFor={id}>
          {label}
          {description && <InfoTooltip content={description} class="mt-0.5" />}
        </Label>
        <Switch
          id={id}
          checked={enabled}
          onCheckedChange={(checked) => {
            return onChange(checked ? { ...DEFAULT_CONFIG } : false);
          }}
        />
      </div>
      <CollapsibleContent open={enabled}>
        <div class="mt-2 rounded-md border border-border">
          <div class="space-y-3 px-2.5 py-3">
            <div class="group space-y-1">
              <Label>Index Name</Label>
              <Combobox
                value={config.indexName}
                suggestions={qsSuggestions}
                label="Index Name"
                placeholder="Select a suggestions index"
                onInput={(inputValue) => {
                  const patch: Partial<StoredSuggestionsConfig> = {
                    indexName: inputValue,
                  };
                  if (
                    qsIndices.includes(inputValue) &&
                    (!config.templates.header || config.templates.header === '')
                  ) {
                    patch.templates = {
                      ...config.templates,
                      header: 'Suggestions',
                    };
                  }
                  update(patch);
                }}
              />
            </div>

            <div class="group space-y-1">
              <Label>
                Header
                <InfoTooltip content="Section header text displayed above suggestions." />
              </Label>
              <Input
                value={config.templates.header}
                placeholder="Suggestions"
                onInput={(event) => {
                  update({
                    templates: {
                      ...config.templates,
                      header: (event.target as HTMLInputElement).value,
                    },
                  });
                }}
              />
            </div>

            <div class="group space-y-1">
              <Label>
                Search Page URL
                <InfoTooltip content="URL of the search page to navigate to when a suggestion is clicked." />
              </Label>
              <Input
                value={config.searchPageUrl}
                placeholder="/search"
                onInput={(event) => {
                  update({
                    searchPageUrl: (event.target as HTMLInputElement).value,
                  });
                }}
              />
            </div>

            <div class="group space-y-1">
              <Label>
                Query Parameter
                <InfoTooltip content="The URL query parameter name for the search query." />
              </Label>
              <Input
                value={config.queryParam}
                placeholder="q"
                onInput={(event) => {
                  update({
                    queryParam: (event.target as HTMLInputElement).value,
                  });
                }}
              />
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </div>
  );
}
