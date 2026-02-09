export type LoaderConfiguration = {
  appId: string;
  apiKey: string;
  experienceId: string;
  env?: string;
  runtimeConfig?: Record<string, unknown>;
};
