import { API_BASE_URL } from '../config';

export async function addFavorite(token, body) {
  const res = await fetch(`${API_BASE_URL}/api/favorites`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to add favorite');
  return res.json();
}

export async function removeFavorite(token, productId) {
  const res = await fetch(`${API_BASE_URL}/api/favorites/${productId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to remove favorite');
  return res.json();
}

export async function isFavorite(token, productId) {
  const res = await fetch(`${API_BASE_URL}/api/favorites/${productId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to check favorite');
  return res.json(); // { exists }
}

export async function listFavorites(token, { limit = 20, offset = 0 } = {}) {
  const res = await fetch(`${API_BASE_URL}/api/favorites?limit=${limit}&offset=${offset}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch favorites');
  return res.json(); // { items, total }
}


