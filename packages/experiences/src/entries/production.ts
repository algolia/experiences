/**
 * Production entry point.
 * Reads credentials from URL parameters and calls run() without config override.
 * The runtime bundle fetches its configuration from the API.
 */
import { getConfig, load } from '../core';

export default (async () => {
  await load(getConfig());
})().catch(console.error);
