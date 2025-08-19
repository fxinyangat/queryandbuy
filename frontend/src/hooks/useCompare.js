import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createSession, listSessions, getSession, listMessages, postMessage, clearSessions } from '../api/compare';

// useCompare
// WHAT: Hook wrapper around compare session APIs
// WHY: Keep components thin and reuse logic
export function useCompare() {
  const { token } = useAuth();

  const startSession = useCallback(async ({ product_ids, original_search_query, session_name }) => {
    if (!token) throw new Error('Not authenticated');
    return createSession(token, { product_ids, original_search_query, session_name });
  }, [token]);

  const fetchSessions = useCallback(async (opts) => {
    if (!token) throw new Error('Not authenticated');
    return listSessions(token, opts);
  }, [token]);

  const fetchSession = useCallback(async (comparison_id) => {
    if (!token) throw new Error('Not authenticated');
    return getSession(token, comparison_id);
  }, [token]);

  const fetchMessages = useCallback(async (comparison_id, opts) => {
    if (!token) throw new Error('Not authenticated');
    return listMessages(token, comparison_id, opts);
  }, [token]);

  const sendMessage = useCallback(async (comparison_id, message_content) => {
    if (!token) throw new Error('Not authenticated');
    return postMessage(token, comparison_id, message_content);
  }, [token]);

  return { startSession, fetchSessions, fetchSession, fetchMessages, sendMessage };
  
  // Note: clearSessions is exposed separately via a helper below
}

export async function useClearCompareHistory(token) {
  return clearSessions(token);
}


