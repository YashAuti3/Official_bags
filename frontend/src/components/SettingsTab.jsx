import { Show, useApi } from 'devil-frontend';
import {
    Bell,
    Lock,
    Trash2,
    Eye,
    EyeOff,
    CheckCircle,
    Loader2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppAuth } from '../context/AuthContext';
import { Button, Card } from '../components/common/UI';

function SettingsTab({ user, isAdmin }) {
    const {
        changePassword,
        deleteAccount,
        emailPreferences,
        updateEmailPreferences,
    } = useAppAuth();
    const navigate = useNavigate();
    const [emailLoading, setEmailLoading] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [emailSaved, setEmailSaved] = useState(false);

    const handleToggleEmailPref = async (key) => {
        try {
            setEmailError('');
            setEmailSaved(false);
            setEmailLoading(true);

            const newValue = !emailPreferences[key];
            await updateEmailPreferences({ [key]: newValue });

            setEmailSaved(true);
            setTimeout(() => setEmailSaved(false), 2000);
        } catch (err) {
            setEmailError(err?.message || 'Failed to update preferences');
        } finally {
            setEmailLoading(false);
        }
    };

    // ── Change Password ──
    const [pwData, setPwData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPw, setShowPw] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [pwLoading, setPwLoading] = useState(false);
    const [pwError, setPwError] = useState('');
    const [pwSuccess, setPwSuccess] = useState(false);

    const handleChangePassword = async () => {
        setPwError('');
        if (
            !pwData.currentPassword ||
            !pwData.newPassword ||
            !pwData.confirmPassword
        ) {
            return setPwError('All fields are required');
        }
        if (pwData.newPassword.length < 6) {
            return setPwError('New password must be at least 6 characters');
        }
        if (pwData.newPassword !== pwData.confirmPassword) {
            return setPwError('New passwords do not match');
        }
        try {
            setPwLoading(true);
            await changePassword({
                currentPassword: pwData.currentPassword,
                newPassword: pwData.newPassword,
            });
            setPwSuccess(true);
            setPwData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
            setTimeout(() => setPwSuccess(false), 3000);
        } catch (err) {
            setPwError(err?.message || 'Failed to change password');
        } finally {
            setPwLoading(false);
        }
    };

    // ── Delete Account ─
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleDeleteAccount = async () => {
        if (!deletePassword) return setDeleteError('Password is required');
        try {
            setDeleteLoading(true);
            await deleteAccount(deletePassword);
            navigate('/');
        } catch (err) {
            setDeleteError(err?.message || 'Incorrect password');
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* ── Email Notification Settings (server-based) ── */}
            <Card className="p-6 md:p-10 flex flex-col gap-6 shadow-2xl border-none rounded-2xl md:rounded-[32px]">
                <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-black uppercase tracking-tighter  flex items-center gap-2">
                        <Bell size={18} className="text-primary" /> Email Notifications
                    </h3>
                    {emailLoading && (
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" /> Saving
                        </span>
                    )}
                    {emailSaved && !emailLoading && (
                        <span className="text-[9px] font-black uppercase tracking-widest text-green-500 flex items-center gap-1">
                            <CheckCircle size={11} /> Saved
                        </span>
                    )}
                </div>

                <p className="text-[10px] font-black uppercase tracking-widest text-muted">
                    Control when WebBags can email you about your orders and offers.
                </p>

                <div className="flex flex-col gap-3">
                    {/* Order updates */}
                    <div className="flex justify-between items-center bg-gray-50 p-4 md:p-5 rounded-xl border border-gray-100 hover:border-primary/20 transition-all gap-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest">
                                Order Status Emails
                            </span>
                            <p className="text-[9px] font-medium text-muted mt-0.5 uppercase tracking-tighter">
                                Get emails when your order is placed, shipped, or delivered
                            </p>
                        </div>
                        <button
                            type="button"
                            disabled={emailLoading}
                            onClick={() => handleToggleEmailPref('orderUpdates')}
                            className={`w-10 h-5 rounded-full p-0.5 flex shrink-0 transition-all duration-300 ${emailPreferences.orderUpdates
                                ? 'bg-primary justify-end'
                                : 'bg-gray-200 justify-start'
                                } ${emailLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                            <div className="w-4 h-4 bg-white rounded-full shadow-md" />
                        </button>
                    </div>

                    {/* Promotions */}
                    <div className="flex justify-between items-center bg-gray-50 p-4 md:p-5 rounded-xl border border-gray-100 hover:border-primary/20 transition-all gap-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest">
                                Promotional Emails
                            </span>
                            <p className="text-[9px] font-medium text-muted mt-0.5 uppercase tracking-tighter">
                                Receive discounts, new drops, and special offers
                            </p>
                        </div>
                        <button
                            type="button"
                            disabled={emailLoading}
                            onClick={() => handleToggleEmailPref('promotions')}
                            className={`w-10 h-5 rounded-full p-0.5 flex shrink-0 transition-all duration-300 ${emailPreferences.promotions
                                ? 'bg-primary justify-end'
                                : 'bg-gray-200 justify-start'
                                } ${emailLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                            <div className="w-4 h-4 bg-white rounded-full shadow-md" />
                        </button>
                    </div>
                </div>

                {emailError && (
                    <p className="text-[10px] font-black uppercase tracking-widest text-danger">
                        {emailError}
                    </p>
                )}
            </Card>

            {/* ── Change Password ── */}
            <Card className="p-6 md:p-10 flex flex-col gap-6 shadow-2xl border-none rounded-2xl md:rounded-[32px]">
                <h3 className="text-lg font-black uppercase tracking-tighter  flex items-center gap-2">
                    <Lock size={18} className="text-primary" /> Change Password
                </h3>

                <div className="flex flex-col gap-4">
                    {[
                        {
                            key: 'currentPassword',
                            label: 'Current Password',
                            show: showPw.current,
                            toggle: () =>
                                setShowPw((p) => ({ ...p, current: !p.current })),
                        },
                        {
                            key: 'newPassword',
                            label: 'New Password',
                            show: showPw.new,
                            toggle: () => setShowPw((p) => ({ ...p, new: !p.new })),
                        },
                        {
                            key: 'confirmPassword',
                            label: 'Confirm New Password',
                            show: showPw.confirm,
                            toggle: () =>
                                setShowPw((p) => ({ ...p, confirm: !p.confirm })),
                        },
                    ].map(({ key, label, show, toggle }) => (
                        <div key={key} className="relative">
                            <input
                                type={show ? 'text' : 'password'}
                                placeholder={label}
                                value={pwData[key]}
                                onChange={(e) =>
                                    setPwData((p) => ({ ...p, [key]: e.target.value }))
                                }
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-5 py-3.5 pr-12 text-base font-bold text-dark focus:border-primary focus:bg-white outline-none transition-all"
                            />
                            <button
                                type="button"
                                onClick={toggle}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-dark transition-colors"
                            >
                                {show ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    ))}

                    {pwError && (
                        <p className="text-[10px] font-black uppercase tracking-widest text-danger">
                            {pwError}
                        </p>
                    )}
                    {pwSuccess && (
                        <p className="text-[10px] font-black uppercase tracking-widest text-green-500 flex items-center gap-2">
                            <CheckCircle size={14} /> Password changed successfully!
                        </p>
                    )}

                    <Button
                        onClick={handleChangePassword}
                        loading={pwLoading}
                        className="w-max px-8 py-3 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                    >
                        Update Password
                    </Button>
                </div>
            </Card>

            {/* ── Danger Zone ── */}
            <Card className="p-6 md:p-10 flex flex-col gap-6 shadow-2xl border-none rounded-2xl md:rounded-[32px]">
                <h3 className="text-lg font-black uppercase tracking-tighter  text-danger flex items-center gap-2">
                    <Trash2 size={18} /> Danger Zone
                </h3>

                {!showDeleteConfirm ? (
                    <div className="p-5 rounded-xl border-2 border-dashed border-red-100 bg-red-50/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-danger">
                                Deactivate Account
                            </span>
                            <p className="text-[9px] font-medium text-muted uppercase tracking-tighter">
                                This action is permanent and cannot be undone
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteConfirm(true)}
                            className="border-red-200 text-danger hover:bg-red-50 px-6"
                        >
                            Deactivate
                        </Button>
                    </div>
                ) : (
                    <div className="p-6 rounded-xl border-2 border-red-200 bg-red-50/50 flex flex-col gap-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-danger">
                            ⚠️ Confirm with your password to permanently delete your account
                        </p>
                        <div className="relative">
                            <input
                                type="password"
                                placeholder="Enter your password to confirm"
                                value={deletePassword}
                                onChange={(e) => {
                                    setDeletePassword(e.target.value);
                                    setDeleteError('');
                                }}
                                className="w-full bg-white border-2 border-red-100 rounded-xl px-5 py-3.5 text-base font-bold text-dark focus:border-danger outline-none transition-all"
                            />
                        </div>
                        {deleteError && (
                            <p className="text-[10px] font-black uppercase tracking-widest text-danger">
                                {deleteError}
                            </p>
                        )}
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setDeletePassword('');
                                    setDeleteError('');
                                }}
                                className="px-6 border-gray-200"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleDeleteAccount}
                                loading={deleteLoading}
                                className="px-6 bg-danger border-none shadow-xl shadow-danger/20"
                            >
                                Yes, Delete My Account
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}

export default SettingsTab;
