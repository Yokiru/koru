
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Clock, Trash2, ArrowLeftToLine, Workflow, FileQuestion, MoreVertical, Pin } from 'lucide-react';
import './Sidebar.css';
import { supabase } from '../services/supabase';
import ProfileSection from './ProfileSection';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const MAX_PINNED = 5;

const Sidebar = ({ isOpen, toggle }) => {
    const [history, setHistory] = useState([]);
    const [activeMenu, setActiveMenu] = useState(null); // Track which item has open menu
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { isAuthenticated, user } = useAuth();
    const menuRef = useRef(null);

    useEffect(() => {
        const loadHistory = async () => {
            if (!isAuthenticated || !user) {
                setHistory([]);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('history')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('is_pinned', { ascending: false })
                    .order('pinned_at', { ascending: false, nullsFirst: false })
                    .order('created_at', { ascending: false })
                    .limit(15);

                if (error) throw error;
                setHistory(data || []);
            } catch (e) {
                console.error("Failed to load history", e);
                setHistory([]);
            }
        };

        loadHistory();

        const channel = supabase
            .channel('history_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'history' }, () => {
                loadHistory();
            })
            .subscribe();

        window.addEventListener('historyUpdated', loadHistory);

        return () => {
            supabase.removeChannel(channel);
            window.removeEventListener('historyUpdated', loadHistory);
        };
    }, [isAuthenticated, user]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setActiveMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDelete = async (e, itemToDelete) => {
        e.stopPropagation();
        setActiveMenu(null);
        try {
            const { error } = await supabase
                .from('history')
                .delete()
                .eq('id', itemToDelete.id);

            if (error) throw error;
            setHistory(prev => prev.filter(item => item.id !== itemToDelete.id));
        } catch (e) {
            console.error("Failed to delete history item", e);
        }
    };

    const handleTogglePin = async (e, item) => {
        e.stopPropagation();
        setActiveMenu(null);

        // Check max pinned limit
        const pinnedCount = history.filter(h => h.is_pinned).length;
        if (!item.is_pinned && pinnedCount >= MAX_PINNED) {
            alert(`Maksimal ${MAX_PINNED} item yang bisa disematkan`);
            return;
        }

        try {
            const newPinnedState = !item.is_pinned;
            const { error } = await supabase
                .from('history')
                .update({
                    is_pinned: newPinnedState,
                    pinned_at: newPinnedState ? new Date().toISOString() : null
                })
                .eq('id', item.id);

            if (error) throw error;

            // Optimistic update
            setHistory(prev => {
                const updated = prev.map(h =>
                    h.id === item.id
                        ? { ...h, is_pinned: newPinnedState, pinned_at: newPinnedState ? new Date().toISOString() : null }
                        : h
                );
                // Re-sort: pinned first
                return updated.sort((a, b) => {
                    if (a.is_pinned && !b.is_pinned) return -1;
                    if (!a.is_pinned && b.is_pinned) return 1;
                    if (a.is_pinned && b.is_pinned) {
                        return new Date(b.pinned_at) - new Date(a.pinned_at);
                    }
                    return new Date(b.created_at) - new Date(a.created_at);
                });
            });
        } catch (e) {
            console.error("Failed to toggle pin", e);
        }
    };

    const handleHistoryClick = (query) => {
        navigate(`/result?q=${encodeURIComponent(query)}`, { state: { query } });
    };

    const handleMenuToggle = (e, itemId) => {
        e.stopPropagation();
        setActiveMenu(activeMenu === itemId ? null : itemId);
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.1 }}
                        onClick={toggle}
                        className="sidebar-overlay"
                    />
                )}
            </AnimatePresence>

            <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: isOpen ? 0 : "-100%" }}
                transition={{ type: "tween", duration: 0.15, ease: "easeOut" }}
                className="sidebar-container"
            >
                <div className="sidebar-header">
                    <div className="sidebar-brand">
                        <img src="/logo-koru.png" alt="Koru" className="sidebar-logo" />
                        <span className="sidebar-app-name">Koru</span>
                    </div>
                    <button
                        onClick={toggle}
                        className="sidebar-toggle-btn open"
                        aria-label="Close Sidebar"
                    >
                        <ArrowLeftToLine size={20} strokeWidth={1.5} />
                    </button>
                </div>

                <div className="sidebar-content">
                    <div className="sidebar-menu">
                        <div className="sidebar-menu-item coming-soon">
                            <div className="menu-icon">
                                <Workflow size={16} />
                            </div>
                            <span className="menu-text">{t('nav.mindmap')}</span>
                            <span className="badge">{t('nav.soon')}</span>
                        </div>
                        <div
                            className="sidebar-menu-item"
                            onClick={() => navigate('/quizzes')}
                            role="button"
                            tabIndex={0}
                        >
                            <div className="menu-icon">
                                <FileQuestion size={16} />
                            </div>
                            <span className="menu-text">{t('nav.quizzes')}</span>
                        </div>
                    </div>

                    <div className="sidebar-divider"></div>

                    <div className="sidebar-section-title">{t('nav.recents')}</div>
                    {history.length === 0 ? (
                        <p className="empty-history">{t('nav.no_chats')}</p>
                    ) : (
                        <ul className="history-list" ref={menuRef}>
                            {history.map((item) => (
                                <li key={item.id}>
                                    <div
                                        onClick={() => handleHistoryClick(item.query)}
                                        className={`history-item ${item.is_pinned ? 'pinned' : ''} ${activeMenu === item.id ? 'menu-open' : ''}`}
                                        role="button"
                                        tabIndex={0}
                                    >
                                        <div className="history-content-wrapper">
                                            <div className="history-icon">
                                                {item.is_pinned ? <Pin size={16} /> : <Clock size={16} />}
                                            </div>
                                            <span className="history-text">{item.query}</span>
                                        </div>
                                        <div className="history-actions">
                                            <button
                                                className="more-btn"
                                                onClick={(e) => handleMenuToggle(e, item.id)}
                                                aria-label="More options"
                                            >
                                                <MoreVertical size={16} />
                                            </button>

                                            {activeMenu === item.id && (
                                                <div className="history-dropdown">
                                                    <button
                                                        className="dropdown-item"
                                                        onClick={(e) => handleTogglePin(e, item)}
                                                    >
                                                        <Pin size={14} />
                                                        <span>{item.is_pinned ? 'Lepas Sematan' : 'Sematkan'}</span>
                                                    </button>
                                                    <button
                                                        className="dropdown-item danger"
                                                        onClick={(e) => handleDelete(e, item)}
                                                    >
                                                        <Trash2 size={14} />
                                                        <span>Hapus</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Profile Section at Bottom */}
                <ProfileSection />
            </motion.div>

            {!isOpen && (
                <button
                    onClick={toggle}
                    className="sidebar-toggle-btn closed"
                    aria-label="Open Sidebar"
                >
                    <Menu size={24} strokeWidth={1.5} />
                </button>
            )}
        </>
    );
};

export default Sidebar;
