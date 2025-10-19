import React, { useEffect, useState } from 'react';
import './TrendingRail.css';
import { useCompare } from '../../hooks/useCompare';
import { useAuth } from '../../contexts/AuthContext';

// TrendingRail (repurposed)
// WHAT: Horizontally scrollable rail. Supports resume sessions or single-product cards.
// WHY: Encourages exploration prior to search
const TrendingRail = ({ title = 'Resume comparing', items = [], onResume, largeCards = false, onViewAll, viewAllLabel = 'View all' }) => {
    const { isAuthenticated } = useAuth();
    const { fetchSessions } = useCompare();
    const [sessions, setSessions] = useState([]);

    useEffect(() => {
        let mounted = true;
        async function load() {
            // If parent passed items, we don't need to fetch
            if ((items && items.length > 0) || !isAuthenticated) return;
            try {
                const res = await fetchSessions({ limit: 10, offset: 0 });
                if (mounted) setSessions(res.items || []);
            } catch (_) {
                if (mounted) setSessions([]);
            }
        }
        load();
        return () => { mounted = false; };
    }, [items, isAuthenticated, fetchSessions]);

    const source = (items && items.length > 0) ? items : sessions;
    const display = (source || []).slice(0, 10);
    return (
        <div className="trending-wrap">
            <div className="trending-head">
                <div className="head-title"><span className="dot" /> {title}</div>
                <button className="view-all" onClick={() => onViewAll?.()}>{viewAllLabel}</button>
            </div>
            <div className="trending-scroll" role="list">
                {display.length === 0 ? (
                    <div className="trend-empty">Your recent compare sessions will appear here.</div>
                ) : (
                    display.map((it, idx) => {
                        const products = (it.products && it.products.length > 0) ? it.products : (it.products_preview || []);
                        const thumbs = products.slice(0,4);
                        return (
                        <button key={idx} role="listitem" className={`trend-card${largeCards ? ' large' : ''}`} onClick={() => onResume?.(it)}>
                            {largeCards ? (
                                <>
                                    <div className="hero-image-wrap">
                                        <img className="hero-image" src={(products[0]?.image || products[0]?.image_url || products[0]?.thumbnail || 'https://picsum.photos/600/380')} alt={products[0]?.title || products[0]?.product_name || 'product'} loading="lazy" />
                                        {products[0]?.price ? <span className="price-badge">{products[0]?.currency_symbol || '$'}{products[0]?.price}</span> : null}
                                    </div>
                                    <div className="trend-title one-line">{products[0]?.title || it.title || 'Product'}</div>
                                </>
                            ) : (
                                <>
                                    <div className="thumb-row" style={{ ['--cols']: thumbs.length }}>
                                        {thumbs.map((p, i) => {
                                            const src = p.image || p.image_url || p.thumbnail || 'https://picsum.photos/50/50';
                                            const alt = p.title || p.product_name || p.product_id || 'product';
                                            return <img key={i} className={`thumb thumb-${i}`} src={src} alt={alt} loading="lazy" />
                                        })}
                                    </div>
                                    <div className="trend-title">{it.display_query || it.searchQuery || it.original_search_query || it.session_name || it.title || 'Comparison session'}</div>
                                </>
                            )}
                        </button>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default TrendingRail;


