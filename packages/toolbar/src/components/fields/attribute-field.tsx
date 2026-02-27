import { useId } from 'preact/hooks';

import { useFacetAttributes } from '../../hooks/use-facet-attributes';
import { InfoTooltip } from './info-tooltip';
import { Combobox } from '../ui/combobox';
import { Label } from '../ui/label';

type AttributeFieldProps = {
  label: string;
  description?: string;
  value: string;
  placeholder?: string;
  onInput: (text: string) => void;
  indexName?: string;
};

export function AttributeField({
  label,
  description,
  value,
  placeholder,
  onInput,
  indexName,
}: AttributeFieldProps) {
  const id = useId();
  const attributes = useFacetAttributes(indexName);

  return (
    <div class="group space-y-1">
      <Label htmlFor={id}>
        {label}
        {description && <InfoTooltip content={description} class="mt-0.5" />}
      </Label>
      <Combobox
        id={id}
        value={value}
        placeholder={placeholder}
        onInput={onInput}
        suggestions={attributes}
        label={label}
      />
    </div>
  );
}
