/**
 * Production entry point.
 * Loads configuration from URL parameters and fetches runtime config from the API.
 */
import { getConfig, load } from '../core';

export default (async () => {
  await load(getConfig());
})().catch(console.error);
