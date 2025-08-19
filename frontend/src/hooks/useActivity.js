import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getSearchHistory, logEvent, summarizeQuery, deleteSearchItem, renameSearchItem } from '../api/activity';

export function useActivity() {
  const { token } = useAuth();

  const fetchSearchHistory = useCallback(async (opts) => {
    if (!token) throw new Error('Not authenticated');
    return getSearchHistory(token, opts);
  }, [token]);

  const sendEvent = useCallback(async (payload) => {
    if (!token) throw new Error('Not authenticated');
    try {
      await logEvent(token, payload);
    } catch (_) {
      // silent
    }
  }, [token]);

  const summarize = useCallback(async (text) => {
    const res = await summarizeQuery(text);
    return res.summary;
  }, []);

  const removeSearch = useCallback(async (search_id) => {
    if (!token) throw new Error('Not authenticated');
    return deleteSearchItem(token, search_id);
  }, [token]);

  const renameSearch = useCallback(async (search_id, custom_label) => {
    if (!token) throw new Error('Not authenticated');
    return renameSearchItem(token, search_id, custom_label);
  }, [token]);

  return { fetchSearchHistory, sendEvent, summarize, removeSearch, renameSearch };
}


