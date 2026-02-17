const APPS_SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbyR9QBRtaMHTP_SVQ3N4ZoSrFM4hwHGfArF9Cl0sRCAADwGOpQCHE_mpTWH6QvKbdy_/exec';

function flattenForForm(data: Record<string, unknown>) {
  const out: Record<string, string> = {};
  Object.keys(data).forEach((k) => {
    const v = (data as any)[k];
    if (v === undefined || v === null) return;
    // If complex object/array, stringify so Apps Script can parse
    if (typeof v === 'object') out[k] = JSON.stringify(v);
    else out[k] = String(v);
  });
  return out;
}

export async function submitUser(data: Record<string, unknown>): Promise<{ success: boolean; data?: { row: number }; message?: string }> {
  const formObj = flattenForForm(data);
  const body = new URLSearchParams(formObj as Record<string, string>).toString();

  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body,
    // avoid preflight by using a simple content type
  });

  // Apps Script often returns JSON as text; attempt to parse safely and
  // normalize various response shapes (e.g. `{ ok: true }`).
  const text = await res.text();
  let parsed: any = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    // not JSON — return text as a success message when HTTP status is OK
    return { success: res.ok, message: text };
  }

  // Normalize common shapes from Apps Script / other endpoints
  if (typeof parsed === 'object') {
    if (parsed.success !== undefined) return { success: Boolean(parsed.success), data: parsed.data, message: parsed.message };
    if (parsed.ok !== undefined) return { success: Boolean(parsed.ok), data: parsed.data, message: parsed.error || parsed.message };
    if (parsed.status !== undefined) return { success: parsed.status === 'ok' || parsed.status === 'success', data: parsed.data, message: parsed.message };
  }

  // Fallback: treat truthy parsed as success
  return { success: Boolean(parsed), message: typeof parsed === 'string' ? parsed : undefined } as any;
}

export async function submitToAppsScript(data: Record<string, unknown>) {
  return submitUser(data);
}
