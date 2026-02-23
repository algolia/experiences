type ParseJsonObjectSuccess = {
  success: true;
  value: Record<string, unknown>;
};

type ParseJsonObjectError = {
  success: false;
  error: string;
};

export type ParseJsonObjectResult =
  | ParseJsonObjectSuccess
  | ParseJsonObjectError;

export function parseJsonObject(input: string): ParseJsonObjectResult {
  let parsed: unknown;

  try {
    parsed = JSON.parse(input);
  } catch {
    return { success: false, error: 'Invalid JSON' };
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { success: false, error: 'Must be a JSON object' };
  }

  return { success: true, value: parsed as Record<string, unknown> };
}
