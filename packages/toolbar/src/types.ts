export type Environment = 'prod' | 'beta';

export type ExperienceApiBlockParameters = {
  container: string;
  cssVariables?: Record<string, string>;
  indexName?: string;
} & Record<string, unknown>;

export type ExperienceApiResponse = {
  blocks: Array<{
    type: string;
    parameters: ExperienceApiBlockParameters;
  }>;
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
  experienceId: string;
  env: Environment;
  config: ExperienceApiResponse;
};
