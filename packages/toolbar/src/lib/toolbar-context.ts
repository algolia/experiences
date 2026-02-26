import { createContext } from 'preact';
import { useContext } from 'preact/hooks';

import type { ExperienceApiResponse, ToolbarConfig } from '../types';

type ToolbarContextValue = {
  config: ToolbarConfig;
  experience: ExperienceApiResponse;
};

const ToolbarContext = createContext<ToolbarContextValue | null>(null);

export const ToolbarProvider = ToolbarContext.Provider;

export function useToolbarContext(): ToolbarContextValue {
  const ctx = useContext(ToolbarContext);

  if (!ctx) {
    throw new Error('useToolbarContext must be used within ToolbarProvider');
  }

  return ctx;
}
