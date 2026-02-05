import { getConfig } from './get-config';
import { loadScript } from './load-script';
import { resolve } from './resolve';

export async function load() {
  const config = getConfig();
  const { bundleUrl } = await resolve(config);

  loadScript(bundleUrl);
}
