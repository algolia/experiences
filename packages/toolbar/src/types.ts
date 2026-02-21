export type Environment = 'prod' | 'beta';

export type Placement = 'inside' | 'before' | 'after' | 'replace' | 'body';

export type SaveState = 'idle' | 'saving' | 'saved';

export type ExperienceApiBlockParameters = {
  container?: string;
  placement?: Placement;
  cssVariables?: Record<string, string>;
  indexName?: string;
  indexId?: string;
} & Record<string, unknown>;

export type ExperienceApiBlock = {
  type: string;
  parameters: ExperienceApiBlockParameters;
  blocks?: ExperienceApiBlock[];
};

export type BlockPath = [number] | [number, number];

export type AddBlockResult = {
  path: BlockPath;
  indexCreated: boolean;
};

export type ExperienceApiResponse = {
  blocks: ExperienceApiBlock[];
  indexName: string;
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
