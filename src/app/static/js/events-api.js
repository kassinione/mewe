export async function fetchEvents(url, search = '', categoryId = '') {
  const requestUrl = new URL(url, window.location.origin);

  if (search) {
    requestUrl.searchParams.set('search', search);
  }

  if (categoryId) {
    requestUrl.searchParams.set('category', categoryId);
  }

  const response = await fetch(requestUrl, {
    headers: { Accept: 'application/json' }
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json()
    : null;

  if (!response.ok) {
    throw new Error(data?.error || `HTTP error: ${response.status}`);
  }

  if (!data?.success) {
    throw new Error(data?.error || 'Unknown error');
  }

  return data.data;
}
