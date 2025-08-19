import { API_BASE_URL } from '../config';

// Compare API
// WHAT: REST calls for comparison sessions and chat messages
// WHY: Encapsulate fetch logic and keep components/hooks lean

export async function createSession(token, { product_ids, original_search_query, session_name }) {
  const res = await fetch(`${API_BASE_URL}/api/compare/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ product_ids, original_search_query, session_name }),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to create comparison session');
  return res.json(); // { comparison_id }
}

export async function listSessions(token, { limit = 20, offset = 0 } = {}) {
  const res = await fetch(`${API_BASE_URL}/api/compare/sessions?limit=${limit}&offset=${offset}`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch comparison sessions');
  return res.json(); // { items, total }
}

export async function getSession(token, comparison_id) {
  const res = await fetch(`${API_BASE_URL}/api/compare/sessions/${comparison_id}`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch comparison session');
  return res.json();
}

export async function listMessages(token, comparison_id, { limit = 50, offset = 0 } = {}) {
  const res = await fetch(`${API_BASE_URL}/api/compare/sessions/${comparison_id}/messages?limit=${limit}&offset=${offset}`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch messages');
  return res.json(); // { items, total }
}

export async function postMessage(token, comparison_id, message_content) {
  const res = await fetch(`${API_BASE_URL}/api/compare/sessions/${comparison_id}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message_content }),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
}

export async function clearSessions(token) {
  const res = await fetch(`${API_BASE_URL}/api/compare/sessions`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to clear comparison sessions');
  return res.json();
}


