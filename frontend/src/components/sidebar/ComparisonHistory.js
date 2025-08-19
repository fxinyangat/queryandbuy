import React, { useEffect, useState } from 'react';
import './ComparisonHistory.css';
import { useCompare } from '../../hooks/useCompare';
import { useAuth } from '../../contexts/AuthContext';
import { clearSessions as apiClearSessions } from '../../api/compare';
import { useActivity } from '../../hooks/useActivity';

// ComparisonHistory
// WHAT: Lists previous comparison sessions (from backend) and allows resuming
// WHY: Users can jump back into a chat-like comparison they started earlier
const ComparisonHistory = ({ comparisonHistory, onSelectComparison, onClearHistory, selectedComparisonId }) => {
    const { isAuthenticated } = useAuth();
    const { fetchSessions } = useCompare();
    const { summarize } = useActivity();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);

    const capFirst = (txt) => {
        if (!txt || typeof txt !== 'string') return txt;
        return txt.charAt(0).toUpperCase() + txt.slice(1);
    };

    useEffect(() => {
        let mounted = true;
        async function load() {
            if (!isAuthenticated) return;
            setLoading(true);
            try {
                const res = await fetchSessions({ limit: 10, offset: 0 });
                let items = res.items || [];
                // Summarize long original_search_query for display (best-effort)
                const mapped = await Promise.all(items.map(async (it) => {
                    const q = it.original_search_query || '';
                    if (q && q.length > 60) {
                        try {
                            const s = await summarize(q);
                            return { ...it, display_query: capFirst(s || q) };
                        } catch {
                            return { ...it, display_query: capFirst(q) };
                        }
                    }
                    return { ...it, display_query: capFirst(q) };
                }));
                if (mounted) setSessions(mapped);
            } catch (_) {
                if (mounted) setSessions([]);
            } finally {
                if (mounted) setLoading(false);
            }
        }
        load();
        return () => { mounted = false; };
    }, [isAuthenticated, fetchSessions, summarize]);

    const data = (comparisonHistory && comparisonHistory.length > 0) ? comparisonHistory : sessions;

    if (!data || data.length === 0) {
        return (
            <div className="comparison-history">
                <div className="comparison-history-header">
                    <h3>Comparison History</h3>
                </div>
                <div className="comparison-history-empty">
                    <p>{loading ? 'Loading...' : 'No comparison history yet'}</p>
                    <p>Start comparing products to see your history here</p>
                </div>
            </div>
        );
    }

    const handleClearAll = async () => {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) return;
            await apiClearSessions(token);
            setSessions([]);
            onClearHistory?.();
        } catch (_) {
            // non-fatal
        }
    };

    return (
        <div className="comparison-history">
            <div className="comparison-history-header">
                <h3>Comparison History</h3>
                <button 
                    className="clear-history-btn"
                    onClick={handleClearAll}
                    title="Clear all history"
                >
                    Clear All
                </button>
            </div>
            <div className="comparison-history-list">
                {data.map((item, index) => (
                    <div 
                        key={index} 
                        className={`comparison-history-item${selectedComparisonId && item?.comparison_id === selectedComparisonId ? ' active' : ''}`}
                        onClick={() => onSelectComparison(item)}
                    >
                        <div className="comparison-history-products">
                            {(item.products_preview && item.products_preview.length > 0) ? (
                                item.products_preview.slice(0,3).map((p, idx) => (
                                    <div key={idx} className="comparison-product-thumbnail">
                                        <img src={p.image_url || 'https://picsum.photos/50/50'} alt={p.product_id} />
                                    </div>
                                ))
                            ) : (
                                <div className="comparison-product-thumbnail">
                                    <img src={'https://picsum.photos/50/50'} alt="session" />
                                </div>
                            )}
                        </div>
                        <div className="comparison-history-details">
                            <p className="comparison-query">{item.display_query || item.session_name || 'Comparison session'}</p>
                            <p className="comparison-date">{new Date(item.created_at).toLocaleString()}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ComparisonHistory; 