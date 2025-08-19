import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { API_BASE_URL } from '../config';

const CompareContext = createContext(null);

export function CompareProvider({ children }) {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [activeComparisonSessionId, setActiveComparisonSessionId] = useState(null);
  const [isCompareMinimized, setIsCompareMinimized] = useState(false);

  // In-memory product snapshot cache for enrichment results
  const productCacheRef = useRef(new Map()); // id -> snapshot from enrich endpoint
  const detailCacheRef = useRef(new Map()); // id -> product detail JSON

  // Initialize from sessionStorage
  useEffect(() => {
    try {
      const storedSel = sessionStorage.getItem('compare_selected');
      const storedId = sessionStorage.getItem('compare_session_id');
      const storedMin = sessionStorage.getItem('compare_minimized');
      if (storedSel) setSelectedProducts(JSON.parse(storedSel));
      if (storedId) setActiveComparisonSessionId(storedId || null);
      if (storedMin) setIsCompareMinimized(JSON.parse(storedMin));
    } catch {}
  }, []);

  // Mirror to sessionStorage
  useEffect(() => {
    try { sessionStorage.setItem('compare_selected', JSON.stringify(selectedProducts)); } catch {}
  }, [selectedProducts]);
  useEffect(() => {
    try { sessionStorage.setItem('compare_session_id', activeComparisonSessionId || ''); } catch {}
  }, [activeComparisonSessionId]);
  useEffect(() => {
    try { sessionStorage.setItem('compare_minimized', JSON.stringify(isCompareMinimized)); } catch {}
  }, [isCompareMinimized]);

  // Enrich helper that uses cache; returns a mapping id -> snapshot
  const enrichProducts = async (ids, authToken) => {
    const unique = Array.from(new Set(ids.filter(Boolean)));
    if (unique.length === 0) return {};
    const byId = Object.create(null);
    const missing = [];
    for (const id of unique) {
      if (productCacheRef.current.has(id)) {
        byId[id] = productCacheRef.current.get(id);
      } else {
        missing.push(id);
      }
    }
    if (missing.length > 0) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/compare/sessions/enrich_session_products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
          },
          body: JSON.stringify({ product_ids: missing })
        });
        if (res.ok) {
          const data = await res.json();
          for (const item of (data.products || [])) {
            productCacheRef.current.set(item.product_id, item);
            byId[item.product_id] = item;
          }
        }
      } catch {}
    }
    return byId;
  };

  const getProductDetailCached = async (id, fetcher) => {
    if (!id) return null;
    if (detailCacheRef.current.has(id)) return detailCacheRef.current.get(id);
    try {
      const data = await fetcher(id);
      detailCacheRef.current.set(id, data);
      return data;
    } catch (e) {
      return null;
    }
  };

  const value = useMemo(() => ({
    selectedProducts,
    setSelectedProducts,
    activeComparisonSessionId,
    setActiveComparisonSessionId,
    isCompareMinimized,
    setIsCompareMinimized,
    enrichProducts,
    getProductDetailCached,
  }), [selectedProducts, activeComparisonSessionId, isCompareMinimized]);

  return (
    <CompareContext.Provider value={value}>
      {/* Expose a minimal global getter to allow caching from non-hook code paths */}
      <ScriptInjector getDetail={(id, fetcher) => getProductDetailCached(id, fetcher)} />
      {children}
    </CompareContext.Provider>
  );
}

export function useCompareContext() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompareContext must be used within CompareProvider');
  return ctx;
}

function ScriptInjector({ getDetail }) {
  useEffect(() => {
    window.__getProductDetailCached = getDetail;
    return () => { try { delete window.__getProductDetailCached; } catch (_) {} };
  }, [getDetail]);
  return null;
}


