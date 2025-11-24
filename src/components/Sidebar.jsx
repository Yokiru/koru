import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Clock, Trash2, ArrowLeftToLine, Workflow, FileQuestion } from 'lucide-react';
import './Sidebar.css';
import { supabase } from '../services/supabase';

const Sidebar = ({ isOpen, toggle }) => {
    const [history, setHistory] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const { data, error } = await supabase
                    .from('history')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(10);

                if (error) throw error;
                setHistory(data || []);
            } catch (e) {
                console.error("Failed to load history", e);
            }
        };

        const migrateHistory = async () => {
            const localHistory = localStorage.getItem('learn_history');
            const isMigrated = localStorage.getItem('supabase_migrated');

            if (localHistory && !isMigrated) {
                try {
                    const parsed = JSON.parse(localHistory);
                    // Filter valid items
                    const validItems = parsed.filter(item => item.query && item.content);

                    if (validItems.length > 0) {
                        // Prepare data for insertion
                        const itemsToInsert = validItems.map(item => ({
                            query: item.query,
                            content: item.content,
                            // Use current time if timestamp is missing or invalid
                            created_at: item.timestamp || new Date().toISOString()
                        }));

                        const { error } = await supabase
                            .from('history')
                            .insert(itemsToInsert);

                        if (!error) {
                            console.log("Migration successful");
                            localStorage.setItem('supabase_migrated', 'true');
                            loadHistory(); // Reload after migration
                        } else {
                            console.error("Migration failed", error);
                        }
                    } else {
                        // No valid items to migrate, mark as done
                        localStorage.setItem('supabase_migrated', 'true');
                    }
                } catch (e) {
                    console.error("Migration error", e);
                }
            } else {
                loadHistory();
            }
        };

        migrateHistory();

        // Subscribe to realtime changes
        const channel = supabase
            .channel('history_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'history' }, () => {
                loadHistory();
            })
            .subscribe();

        // Also listen for custom local event as fallback/immediate update
        window.addEventListener('historyUpdated', loadHistory);

        return () => {
            supabase.removeChannel(channel);
            window.removeEventListener('historyUpdated', loadHistory);
        };
    }, []);

    const handleDelete = async (e, itemToDelete) => {
        e.stopPropagation();
        try {
            const { error } = await supabase
                .from('history')
                .delete()
                .eq('id', itemToDelete.id);

            if (error) throw error;

            // Optimistic update
            setHistory(prev => prev.filter(item => item.id !== itemToDelete.id));
        } catch (e) {
            console.error("Failed to delete history item", e);
        }
    };

    const handleHistoryClick = (query) => {
        navigate('/result', { state: { query } });
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={toggle}
                        className="sidebar-overlay"
                    />
                )}
            </AnimatePresence>

            <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: isOpen ? 0 : "-100%" }}
                transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
                className="sidebar-container"
            >
                <div className="sidebar-header">
                    <button
                        onClick={toggle}
                        className="sidebar-toggle-btn open"
                        aria-label="Close Sidebar"
                    >
                        <ArrowLeftToLine size={24} />
                    </button>
                    <span className="sidebar-app-name">Nue</span>
                </div>

                <div className="sidebar-content">
                    <div className="sidebar-menu">
                        <div className="sidebar-menu-item coming-soon">
                            <div className="menu-icon">
                                <Workflow size={16} />
                            </div>
                            <span className="menu-text">Mindmap</span>
                            <span className="badge">Soon</span>
                        </div>
                        <div className="sidebar-menu-item coming-soon">
                            <div className="menu-icon">
                                <FileQuestion size={16} />
                            </div>
                            <span className="menu-text">Quizzes</span>
                            <span className="badge">Soon</span>
                        </div>
                    </div>

                    <div className="sidebar-divider"></div>

                    <div className="sidebar-section-title">Recents</div>
                    {history.length === 0 ? (
                        <p className="empty-history">No recent chats</p>
                    ) : (
                        <ul className="history-list">
                            {history.map((item, index) => (
                                <li key={index}>
                                    <div
                                        onClick={() => handleHistoryClick(item.query)}
                                        className="history-item"
                                        role="button"
                                        tabIndex={0}
                                    >
                                        <div className="history-content-wrapper">
                                            <div className="history-icon">
                                                <Clock size={16} />
                                            </div>
                                            <span className="history-text">{item.query}</span>
                                        </div>
                                        <button
                                            className="delete-history-btn"
                                            onClick={(e) => handleDelete(e, item)}
                                            aria-label="Delete history item"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </motion.div>

            {!isOpen && (
                <button
                    onClick={toggle}
                    className="sidebar-toggle-btn closed"
                    aria-label="Open Sidebar"
                >
                    <Menu size={24} />
                </button>
            )}
        </>
    );
};

export default Sidebar;
