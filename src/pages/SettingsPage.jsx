import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, User, Lock, Moon, Sun, Trash2, Settings, Globe, Check, Loader, Camera, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { getAvatarUrl } from '../utils/avatarUtils';
import './SettingsPage.css';

const SettingsPage = () => {
    const navigate = useNavigate();
    const { user, profile, updateProfile, updatePassword, deleteAccount, uploadAvatar } = useAuth();
    const { t, language, setLanguage } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const [activeMenu, setActiveMenu] = useState('general');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Form states
    const [displayName, setDisplayName] = useState(profile?.display_name || '');
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [deleteConfirm, setDeleteConfirm] = useState('');
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        const { success, error } = await updateProfile({ display_name: displayName });

        if (success) {
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } else {
            setMessage({ type: 'error', text: error?.message || 'Failed to update profile' });
        }
        setLoading(false);
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }
        if (passwordData.newPassword.length < 8) {
            setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        const { success, error } = await updatePassword(passwordData.newPassword);

        if (success) {
            setMessage({ type: 'success', text: 'Password updated successfully!' });
            setPasswordData({ newPassword: '', confirmPassword: '' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } else {
            setMessage({ type: 'error', text: error?.message || 'Failed to update password' });
        }
        setLoading(false);
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirm !== 'DELETE') {
            setMessage({ type: 'error', text: 'Please type DELETE to confirm' });
            return;
        }

        setLoading(true);
        const { success, error } = await deleteAccount();

        if (!success) {
            setMessage({ type: 'error', text: error?.message || 'Failed to delete account' });
            setLoading(false);
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setMessage({ type: 'error', text: 'Please select an image file' });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'Image size should be less than 5MB' });
            return;
        }

        try {
            setUploadingAvatar(true);
            setMessage({ type: '', text: '' });

            const { success, error } = await uploadAvatar(file);

            if (success) {
                setMessage({ type: 'success', text: 'Profile photo updated!' });
            } else {
                setMessage({ type: 'error', text: error?.message || 'Failed to upload avatar' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An unexpected error occurred' });
        } finally {
            setUploadingAvatar(false);
        }
    };

    const getInitials = () => {
        if (profile?.display_name) {
            return profile.display_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        }
        return user?.email?.charAt(0).toUpperCase() || 'U';
    };

    const menuItems = [
        { id: 'general', icon: Settings, label: 'General' },
        { id: 'profile', icon: User, label: 'Profile' },
        { id: 'security', icon: Lock, label: 'Security' },
        { id: 'theme', icon: theme === 'dark' ? Moon : Sun, label: 'Appearance' },
        { id: 'account', icon: Trash2, label: 'Account', danger: true },
    ];

    const renderContent = () => {
        switch (activeMenu) {
            case 'general':
                return (
                    <div className="settings-panel">
                        <h2 className="panel-title">General</h2>

                        <div className="settings-option">
                            <div className="option-header">
                                <span className="option-title">Language</span>
                                <span className="option-description">Select your preferred language</span>
                            </div>
                            <select
                                className="settings-select"
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                            >
                                <option value="en">English</option>
                                <option value="id">Bahasa Indonesia</option>
                            </select>
                        </div>

                        <div className="settings-option">
                            <div className="option-header">
                                <span className="option-title">App Version</span>
                                <span className="option-description">Current version of Nue Learning</span>
                            </div>
                            <span className="option-value">v1.0.0</span>
                        </div>
                    </div>
                );

            case 'profile':
                return (
                    <div className="settings-panel">
                        <h2 className="panel-title">Profile</h2>

                        {message.text && (
                            <div className={`settings-alert ${message.type}`}>
                                {message.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
                                <span>{message.text}</span>
                            </div>
                        )}

                        <div className="avatar-section">
                            <div className="avatar-preview">
                                {getAvatarUrl(profile || user) ? (
                                    <img src={getAvatarUrl(profile || user)} alt={profile?.display_name || 'User'} />
                                ) : (
                                    <div className="avatar-initials">{getInitials()}</div>
                                )}
                                <label className="avatar-edit-btn" htmlFor="avatar-input">
                                    {uploadingAvatar ? <Loader className="spin" size={16} /> : <Camera size={16} />}
                                </label>
                                <input
                                    type="file"
                                    id="avatar-input"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    disabled={uploadingAvatar}
                                    hidden
                                />
                            </div>
                            <p className="avatar-hint">Click to change photo</p>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="settings-form">
                            <div className="form-field">
                                <label>Display Name</label>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="What should we call you?"
                                />
                            </div>
                            <div className="form-field">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={user?.email}
                                    disabled
                                    className="disabled"
                                />
                                <span className="field-hint">Email cannot be changed</span>
                            </div>
                            <button type="submit" className="save-btn" disabled={loading}>
                                {loading ? <Loader className="spin" size={16} /> : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                );

            case 'security':
                return (
                    <div className="settings-panel">
                        <h2 className="panel-title">Security</h2>

                        {message.text && (
                            <div className={`settings-alert ${message.type}`}>
                                {message.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
                                <span>{message.text}</span>
                            </div>
                        )}

                        <form onSubmit={handleUpdatePassword} className="settings-form">
                            <div className="form-field">
                                <label>New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    placeholder="Enter new password (min. 8 characters)"
                                />
                            </div>
                            <div className="form-field">
                                <label>Confirm Password</label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    placeholder="Confirm new password"
                                />
                            </div>
                            <button type="submit" className="save-btn" disabled={loading}>
                                {loading ? <Loader className="spin" size={16} /> : 'Update Password'}
                            </button>
                        </form>
                    </div>
                );

            case 'theme':
                return (
                    <div className="settings-panel">
                        <h2 className="panel-title">Appearance</h2>

                        <div className="settings-option clickable" onClick={toggleTheme}>
                            <div className="option-header">
                                <span className="option-title">Dark Mode</span>
                                <span className="option-description">Toggle between light and dark theme</span>
                            </div>
                            <div className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={theme === 'dark'}
                                    onChange={toggleTheme}
                                    id="theme-toggle"
                                />
                                <label htmlFor="theme-toggle"></label>
                            </div>
                        </div>
                    </div>
                );

            case 'account':
                return (
                    <div className="settings-panel">
                        <h2 className="panel-title danger">Account</h2>

                        {message.text && (
                            <div className={`settings-alert ${message.type}`}>
                                {message.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
                                <span>{message.text}</span>
                            </div>
                        )}

                        <div className="danger-zone">
                            <div className="danger-warning">
                                <AlertTriangle size={24} />
                                <div>
                                    <h4>Delete Account</h4>
                                    <p>This action is irreversible. All your data will be permanently deleted.</p>
                                </div>
                            </div>

                            <div className="form-field">
                                <label>Type "DELETE" to confirm</label>
                                <input
                                    type="text"
                                    value={deleteConfirm}
                                    onChange={(e) => setDeleteConfirm(e.target.value)}
                                    placeholder="DELETE"
                                    className="danger-input"
                                />
                            </div>
                            <button
                                onClick={handleDeleteAccount}
                                className="delete-btn"
                                disabled={loading || deleteConfirm !== 'DELETE'}
                            >
                                {loading ? <Loader className="spin" size={16} /> : 'Delete My Account'}
                            </button>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="settings-page-overlay">
            <div className="settings-page-modal">
                {/* Close Button */}
                <button className="modal-close-btn" onClick={() => navigate(-1)}>
                    <X size={20} />
                </button>

                {/* Sidebar */}
                <div className="settings-sidebar">
                    <nav className="settings-nav">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                className={`nav-item ${activeMenu === item.id ? 'active' : ''} ${item.danger ? 'danger' : ''}`}
                                onClick={() => {
                                    setActiveMenu(item.id);
                                    setMessage({ type: '', text: '' });
                                }}
                            >
                                <item.icon size={18} />
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div className="settings-content">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
