import React, { useEffect, useMemo, useRef, useState } from 'react';
import './Sidebar.css';
import { useActivity } from '../../hooks/useActivity';
import { useAuth } from '../../contexts/AuthContext';
import ConfirmationDialog from '../common/ConfirmationDialog';

// Sidebar
// WHAT: Renders collapsible sidebar with search history and categories
// WHY: Central place to access recent searches quickly
const Sidebar = ({ 
    isExpanded, 
    onToggle, 
    searchHistory, 
    onHistoryItemClick, 
    onClearHistory,
    onMenuItemClick,
}) => {
    const sidebarRef = useRef(null);
    const { isAuthenticated } = useAuth();
    const { fetchSearchHistory, summarize, removeSearch, renameSearch } = useActivity();
    const [historyItems, setHistoryItems] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [openItemMenuIndex, setOpenItemMenuIndex] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [dialogTarget, setDialogTarget] = useState(null); // { ...item, mode: 'delete'|'rename' }
    const [working, setWorking] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isExpanded && 
                sidebarRef.current && 
                !sidebarRef.current.contains(event.target) &&
                !event.target.classList.contains('sidebar-toggle')) {
                onToggle();
            }
        };

        const closeMenusOnOutside = (event) => {
            if (!event.target.closest('.item-menu')) {
                setOpenItemMenuIndex(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('mousedown', closeMenusOnOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('mousedown', closeMenusOnOutside);
        };
    }, [isExpanded, onToggle]);

    const capFirst = (txt) => {
        if (!txt || typeof txt !== 'string') return txt;
        return txt.charAt(0).toUpperCase() + txt.slice(1);
    };

    // EFFECT: Load search history from backend when sidebar opens
    useEffect(() => {
        let mounted = true;
        async function load() {
            if (!isExpanded || !isAuthenticated) return;
            setLoadingHistory(true);
            try {
                const res = await fetchSearchHistory({ limit: 20, offset: 0 });
                let items = res.items || [];
                // Summarize long queries (best-effort) and map to display objects
                const mapped = await Promise.all(items.map(async (it) => {
                    const q = it.search_query || '';
                    if (q.length > 60) {
                        try {
                            const s = await summarize(q);
                            return { ...it, display_query: capFirst(it.custom_label || s || q) };
                        } catch {
                            return { ...it, display_query: capFirst(it.custom_label || q) };
                        }
                    }
                    return { ...it, display_query: capFirst(it.custom_label || q) };
                }));
                if (mounted) setHistoryItems(mapped);
            } catch (_) {
                if (mounted) setHistoryItems([]);
            } finally {
                if (mounted) setLoadingHistory(false);
            }
        }
        load();
        return () => { mounted = false; };
    }, [isExpanded, isAuthenticated, fetchSearchHistory, summarize]);

    return (
        <>
            <button className="sidebar-toggle" onClick={onToggle}>
                {isExpanded ? '◀' : '☰'}
            </button>
            
            <div className={`sidebar ${isExpanded ? 'expanded' : ''}`} ref={sidebarRef}>
                <div className="sidebar-inner">
                    {/* Mobile Menu Items */}
                    <div className="sidebar-section mobile-only">
                        <div className="section-content">
                            <div className="section-header">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M3 4h18M3 8h18M3 12h18M3 16h18M3 20h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                                <h3>Menu</h3>
                            </div>
                            <div className="menu-items">
                                <div className="menu-item" onClick={() => onMenuItemClick?.('trending')}>
                                    <span>Trending</span>
                                </div>
                                <div className="menu-item" onClick={() => onMenuItemClick?.('hot-deals')}>
                                    <span>Hot Deals</span>
                                </div>
                                <div className="menu-item" onClick={() => onMenuItemClick?.('new-items')}>
                                    <span>New Items</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="sidebar-section">
                        <div className="section-content">
                            <div className="section-header">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                                </svg>
                                <h3>Recent Searches</h3>
                            </div>
                            {loadingHistory ? (
                                <div className="empty-state">Loading...</div>
                            ) : historyItems.length > 0 ? (
                                historyItems.map((it, index) => (
                                    <div key={it.search_id || it.created_at} className="history-item-row">
                                        <div 
                                            className="history-item"
                                            onClick={() => {
                                                // Debounced click handled in parent; avoid double triggers
                                                onHistoryItemClick(it.search_query, { log: true });
                                            }}
                                            title={it.search_query}
                                        >
                                            <span className="history-text">{it.display_query}</span>
                                        </div>
                                        <div className="item-menu">
                                            <button className="dots-btn" onClick={(e) => { e.stopPropagation(); setOpenItemMenuIndex(openItemMenuIndex === index ? null : index); }}>⋮</button>
                                            {openItemMenuIndex === index && (
                                                <div className="item-dropdown">
                                                    <button className="dropdown-item" onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenItemMenuIndex(null);
                                                        setDialogTarget({ ...it, mode: 'rename' });
                                                        setConfirmOpen(true);
                                                    }}>Rename</button>
                                                    <button className="dropdown-item" disabled title="Coming soon">Share Chat</button>
                                                    <button className="dropdown-item" disabled title="Coming soon">Report</button>
                                                    <button className="dropdown-item danger" onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenItemMenuIndex(null);
                                                        setDialogTarget({ ...it, mode: 'delete' });
                                                        setConfirmOpen(true);
                                                    }}>Delete</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">No recent searches</div>
                            )}
                        </div>
                    </div>

                    <div className="sidebar-section">
                        <div className="section-content">
                            <div className="section-header">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M4 4h4v4H4V4zm8 0h4v4h-4V4zm8 0h4v4h-4V4z" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M4 10h4v4H4v-4zm8 0h4v4h-4v-4zm8 0h4v4h-4v-4z" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M4 16h4v4H4v-4zm8 0h4v4h-4v-4zm8 0h4v4h-4v-4z" stroke="currentColor" strokeWidth="2"/>
                                </svg>
                                <h3>Categories</h3>
                            </div>
                            {categories.map((category, index) => (
                                <div key={index} className="category-item">
                                    <span className="category-icon">{category.icon}</span>
                                    <span>{category.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <ConfirmationDialog
                isOpen={confirmOpen}
                title={dialogTarget?.mode === 'rename' ? 'Rename Search' : 'Delete Search?'}
                confirmText={dialogTarget?.mode === 'rename' ? 'Save' : 'Delete'}
                confirmButtonClass={dialogTarget?.mode === 'rename' ? 'confirm-btn' : 'delete-btn'}
                variant={dialogTarget?.mode === 'rename' ? 'primary' : 'danger'}
                loading={working}
                onCancel={() => { setConfirmOpen(false); setDialogTarget(null); }}
                onConfirm={async () => {
                    if (!dialogTarget) return;
                    try {
                        setWorking(true);
                        if (dialogTarget.mode === 'rename') {
                            const input = document.getElementById('rename-input');
                            const label = (input?.value || '').trim();
                            await renameSearch(dialogTarget.search_id, label || null);
                            setHistoryItems(prev => prev.map(h => h.search_id === dialogTarget.search_id ? { ...h, custom_label: label || null, display_query: label || h.display_query } : h));
                        } else {
                            await removeSearch(dialogTarget.search_id);
                            setHistoryItems(prev => prev.filter(h => h.search_id !== dialogTarget.search_id));
                        }
                    } catch (_) {
                    } finally {
                        setWorking(false);
                        setConfirmOpen(false);
                        setDialogTarget(null);
                    }
                }}
            >
                {dialogTarget?.mode === 'rename' ? (
                    <div style={{ width: '100%' }}>
                        <p style={{ marginTop: 0, color: '#555' }}>Enter a new name for this search.</p>
                        <input id="rename-input" type="text" className="dialog-input" defaultValue={dialogTarget?.custom_label || dialogTarget?.display_query || ''} />
                    </div>
                ) : (
                    <p>{`This will remove "${dialogTarget?.display_query || dialogTarget?.search_query || 'this search'}" from your recent searches. This action cannot be undone.`}</p>
                )}
            </ConfirmationDialog>
        </>
    );
};

const categories = [
    { icon: '📱', name: 'Electronics' },
    { icon: '🎮', name: 'Gaming' },
    { icon: '🏠', name: 'Home' },
    { icon: '👕', name: 'Fashion' }
];

export default Sidebar; 