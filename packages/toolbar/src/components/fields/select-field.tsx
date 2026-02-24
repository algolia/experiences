import { Label } from '../ui/label';
import { TabsList, TabsTrigger } from '../ui/tabs';

type SelectFieldProps = {
  label: string;
  value: string | undefined;
  options: Array<{ value: string; label: string }>;
  defaultValue: string;
  onChange: (value: string | undefined) => void;
};

export function SelectField({
  label,
  value,
  options,
  defaultValue,
  onChange,
}: SelectFieldProps) {
  const selected = value ?? defaultValue;

  return (
    <div class="space-y-1">
      <Label>{label}</Label>
      <TabsList>
        {options.map((option) => {
          return (
            <TabsTrigger
              key={option.value}
              active={selected === option.value}
              onClick={() => {
                onChange(
                  option.value === defaultValue ? undefined : option.value
                );
              }}
            >
              {option.label}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </div>
  );
}
