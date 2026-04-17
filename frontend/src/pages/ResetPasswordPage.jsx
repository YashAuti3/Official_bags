import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppAuth } from '../context/AuthContext';
import { Button, Card } from '../components/common/UI';
import { Lock, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

export default function ResetPasswordPage() {
    const { token } = useParams();
    const { resetPassword } = useAppAuth();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        if (!password || !confirm) {
            setError('All fields are required');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        if (password !== confirm) {
            setError('Passwords do not match');
            return;
        }

        try {
            setSubmitting(true);
            const res = await resetPassword(token, password);
            setSuccessMsg(res?.message || 'Password reset successful');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg py-10 px-4">
            <Card className="w-full max-w-md p-8 md:p-10 shadow-2xl border-none rounded-3xl flex flex-col gap-6">
                <Link to="/login" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted hover:text-primary">
                    <ArrowLeft size={14} /> Back to login
                </Link>

                <div className="flex flex-col gap-2">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Lock size={18} />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
                        Reset Password
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted">
                        Set a new password for your account
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="New password"
                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-5 py-3.5 text-base font-bold text-dark focus:border-primary focus:bg-white outline-none transition-all"
                    />
                    <input
                        type="password"
                        value={confirm}
                        onChange={e => setConfirm(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-5 py-3.5 text-base font-bold text-dark focus:border-primary focus:bg-white outline-none transition-all"
                    />

                    {error && (
                        <p className="text-[10px] font-black uppercase tracking-widest text-danger">
                            {error}
                        </p>
                    )}

                    {successMsg && (
                        <p className="text-[10px] font-black uppercase tracking-widest text-green-600 flex items-center gap-2">
                            <CheckCircle2 size={14} /> {successMsg}
                        </p>
                    )}

                    <Button
                        type="submit"
                        disabled={submitting}
                        className="mt-2 py-3.5 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <Loader2 size={16} className="animate-spin" /> Updating...
                            </>
                        ) : (
                            'Reset Password'
                        )}
                    </Button>
                </form>
            </Card>
        </div>
    );
}
