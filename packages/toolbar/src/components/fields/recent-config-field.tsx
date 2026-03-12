import { useId } from 'preact/hooks';

import { InfoTooltip } from './info-tooltip';
import { CollapsibleContent } from '../ui/collapsible';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';

type StoredRecentConfig = {
  templates: { header: string };
};

type RecentConfigFieldProps = {
  label: string;
  description?: string;
  value: Record<string, unknown> | boolean;
  onChange: (value: StoredRecentConfig | false) => void;
};

const DEFAULT_CONFIG: StoredRecentConfig = {
  templates: { header: '' },
};

function normalize(value: Record<string, unknown>): StoredRecentConfig {
  return {
    templates: {
      header:
        (value.templates as { header?: string } | undefined)?.header ?? '',
    },
  };
}

export function RecentConfigField({
  label,
  description,
  value,
  onChange,
}: RecentConfigFieldProps) {
  const id = useId();
  const enabled =
    value === true || (typeof value === 'object' && value !== null);
  const config =
    typeof value === 'object' && value !== null
      ? normalize(value as Record<string, unknown>)
      : DEFAULT_CONFIG;

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
              <Label>
                Header
                <InfoTooltip content="Section header text displayed above recent searches." />
              </Label>
              <Input
                value={config.templates.header}
                placeholder="Recent searches"
                onInput={(event) => {
                  onChange({
                    templates: {
                      header: (event.target as HTMLInputElement).value,
                    },
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
