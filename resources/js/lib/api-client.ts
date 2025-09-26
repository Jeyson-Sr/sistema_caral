export async function apiFetch<T>(url: string, opts: RequestInit = {}): Promise<T> {
  const token = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
  const res = await fetch(url, {
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': token,
      ...(opts.headers || {})
    },
    ...opts
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`API ${res.status}: ${txt}`);
  }
  return (await res.json()) as T;
}
