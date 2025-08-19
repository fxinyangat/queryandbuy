import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { addFavorite, removeFavorite, isFavorite, listFavorites } from '../api/favorites';

export function useFavorites() {
  const { token } = useAuth();

  const checkFavorite = useCallback(async (productId) => {
    if (!token) return { exists: false };
    try {
      return await isFavorite(token, productId);
    } catch {
      return { exists: false };
    }
  }, [token]);

  const toggleFavorite = useCallback(async (productId, current, snapshot) => {
    if (!token) throw new Error('Not authenticated');
    if (current) {
      await removeFavorite(token, productId);
      return false;
    }
    await addFavorite(token, {
      product_id: productId,
      user_notes: undefined,
      platform_name: snapshot?.platform_name,
      product_name: snapshot?.product_name,
      product_url: snapshot?.product_url,
      image_url: snapshot?.image_url,
    });
    return true;
  }, [token]);

  const getFavorites = useCallback(async (opts) => {
    if (!token) throw new Error('Not authenticated');
    return listFavorites(token, opts);
  }, [token]);

  return { checkFavorite, toggleFavorite, getFavorites };
}


