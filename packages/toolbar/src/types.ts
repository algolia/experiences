import type { ThemeOverrides } from '@experiences/theme';

export type Environment = 'prod' | 'beta';

export type Placement = 'inside' | 'before' | 'after' | 'replace' | 'body';

export type SaveState = 'idle' | 'saving' | 'saved';

export type ExperienceApiBlockParameters = {
  container?: string;
  placement?: Placement;
  indexName?: string;
  indexId?: string;
} & Record<string, unknown>;

export type ExperienceApiBlock = {
  type: string;
  parameters: ExperienceApiBlockParameters;
  children?: ExperienceApiBlock[];
};

export type BlockPath = [number] | [number, number];

export type AddBlockResult = {
  path: BlockPath;
  indexCreated: boolean;
};

export type ThemeModeConfig = 'adaptive' | 'fixed';

export type ExperienceApiResponse = {
  blocks: ExperienceApiBlock[];
  indexName: string;
  cssVariables?: ThemeOverrides;
};

export type ToolbarConfig = {
  appId: string;
  apiKey: string;
  experienceId: string;
  env?: Environment;
};

export type SaveExperienceParams = {
  appId: string;
  apiKey: string;
  env: Environment;
  config: ExperienceApiResponse;
};
