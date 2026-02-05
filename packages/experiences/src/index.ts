/**
 * Entry point that auto-executes on script load.
 * Exports a promise for testing purposes.
 */
import { load } from './load';

export default load().catch(console.error);
