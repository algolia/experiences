/** @jsxImportSource preact */

import { render } from 'preact';
import { vi } from 'vitest';

import { BlockEditor } from '../src/components/block-editor';
import { ToolbarProvider } from '../src/lib/toolbar-context';

export function renderEditor(
  params: Record<string, unknown>,
  type: string,
  options?: { parentIndexName?: string }
) {
  const onParameterChange = vi.fn();
  const container = document.createElement('div');
  document.body.appendChild(container);

  render(
    <ToolbarProvider
      value={{
        config: { appId: 'TEST_APP', apiKey: 'TEST_KEY', experienceId: 'test' },
        experience: { blocks: [], indexName: '' },
      }}
    >
      <BlockEditor
        type={type}
        parameters={{ container: '', ...params }}
        onParameterChange={onParameterChange}
        onCssVariableChange={vi.fn()}
        onPickElement={vi.fn()}
        parentIndexName={options?.parentIndexName}
      />
    </ToolbarProvider>,
    container
  );

  return { onParameterChange, container };
}

export function getInput(
  container: HTMLElement,
  label: string
): HTMLInputElement {
  const labels = Array.from(container.querySelectorAll('label'));
  const target = labels.find((el) => {
    return el.textContent?.trim() === label;
  });

  if (!target) {
    throw new Error(`No label found with text "${label}"`);
  }

  const id = target.getAttribute('for');
  const input = container.querySelector(`#${id}`);

  if (!input) {
    throw new Error(`No input found for label "${label}" (for="${id}")`);
  }

  return input as HTMLInputElement;
}

export function getSwitch(
  container: HTMLElement,
  label: string
): HTMLButtonElement {
  const labels = Array.from(container.querySelectorAll('label'));
  const target = labels.find((el) => {
    return el.textContent?.trim() === label;
  });

  if (!target) {
    throw new Error(`No label found with text "${label}"`);
  }

  const id = target.getAttribute('for');
  const button = container.querySelector(`#${id}`);

  if (!button) {
    throw new Error(`No switch found for label "${label}" (for="${id}")`);
  }

  return button as HTMLButtonElement;
}

/**
 * Finds the text input inside a toggleable text field (where the label
 * points to the switch, not the input).
 */
export function getToggleableInput(
  container: HTMLElement,
  label: string
): HTMLInputElement {
  const labels = Array.from(container.querySelectorAll('label'));
  const target = labels.find((el) => {
    return el.textContent?.trim() === label;
  });

  if (!target) {
    throw new Error(`No label found with text "${label}"`);
  }

  const fieldRoot = target.closest(
    'div:has([data-slot="collapsible-content"])'
  );

  if (!fieldRoot) {
    throw new Error(
      `No toggleable field found for label "${label}" (missing collapsible content)`
    );
  }

  const input = fieldRoot.querySelector('input');

  if (!input) {
    throw new Error(`No input found in toggleable field "${label}"`);
  }

  return input;
}

export function fireInput(input: HTMLInputElement, value: string) {
  Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value'
  )!.set!.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}
