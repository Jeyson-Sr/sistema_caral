export type SaveResult = {
  success: boolean;
  inserted?: number;
  updated?: number;
  message?: string;
};

const getCsrf = () =>
  (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';

export async function saveAlmacen(url: string, data: any[]): Promise<SaveResult> {
  const resp = await fetch(url, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': getCsrf(),
      'X-Requested-With': 'XMLHttpRequest',
      Accept: 'application/json',
    },
    body: JSON.stringify({ data }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Server ${resp.status}: ${text}`);
  }

  const json = await resp.json();
  return json as SaveResult;
}

/**
 * Utility to fetch almacen data (GET).
 */
export async function fetchAlmacen(url: string): Promise<any[]> {
  const resp = await fetch(url, {
    method: 'GET',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
  });

  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`Fetch ${resp.status}: ${t}`);
  }

  const json = await resp.json();
  return Array.isArray(json) ? json : json.data ?? [];
}
