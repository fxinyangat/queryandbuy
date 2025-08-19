import { API_BASE_URL } from '../config';

export async function getSearchHistory(token, { limit = 20, offset = 0 } = {}) {
  const res = await fetch(`${API_BASE_URL}/api/activity/searches?limit=${limit}&offset=${offset}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch search history');
  return res.json(); // { items, total }
}

export async function deleteSearchItem(token, search_id) {
  const res = await fetch(`${API_BASE_URL}/api/activity/searches/${search_id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to delete search item');
  return res.json();
}

export async function renameSearchItem(token, search_id, custom_label) {
  const res = await fetch(`${API_BASE_URL}/api/activity/searches/${search_id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ custom_label }),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to rename search');
  return res.json();
}

export async function logEvent(token, { event_type, product_id, action, source, metadata }) {
  const res = await fetch(`${API_BASE_URL}/api/activity/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ event_type, product_id, action, source, metadata }),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to log event');
  return res.json();
}

export async function summarizeQuery(text) {
  const q = encodeURIComponent(text || '');
  const res = await fetch(`${API_BASE_URL}/api/search/summarize?text=${q}`);
  if (!res.ok) throw new Error('Failed to summarize');
  return res.json(); // { summary }
}


