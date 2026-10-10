import { authFetch } from './telegram-auth.js';

export async function fetchEvents(url, search = '', categoryIds = [], page = 1) {
  const requestUrl = new URL(url, window.location.origin);

  if (search) {
    requestUrl.searchParams.set('search', search);
  }

  if (page > 1) {
    requestUrl.searchParams.set('page', String(page));
  }

  const selectedCategoryIds = Array.isArray(categoryIds) ? categoryIds : [categoryIds];
  selectedCategoryIds.filter(Boolean).forEach(categoryId => {
    requestUrl.searchParams.append('category', categoryId);
  });

  const response = await authFetch(requestUrl, {
    headers: { Accept: 'application/json' }
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json()
    : null;

  if (!response.ok) {
    throw new Error(data?.error || `HTTP error: ${response.status}`);
  }

  return data;
}

async function requestJson(url, options = {}) {
  const response = await authFetch(url, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...options.headers
    }
  });

  if (response.status === 204) {
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    return null;
  }

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json()
    : null;

  if (!response.ok) {
    throw new Error(data?.error || `HTTP error: ${response.status}`);
  }

  return data;
}

function participantUrl(eventId) {
  return `/api/events/${encodeURIComponent(eventId)}/participants/me`;
}

export function fetchParticipantStatus(eventId) {
  return requestJson(participantUrl(eventId));
}

export function joinEvent(eventId) {
  return requestJson(participantUrl(eventId), { method: 'PUT' });
}

export function leaveEvent(eventId) {
  return requestJson(participantUrl(eventId), { method: 'DELETE' });
}

export function deleteEvent(eventId) {
  return requestJson(`/api/events/${encodeURIComponent(eventId)}`, {
    method: 'DELETE'
  });
}
