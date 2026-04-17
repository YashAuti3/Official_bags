// src/components/common/UserProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAppAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function UserProtectedRoute() {
    const { isLoggedIn, loading } = useAppAuth();

    if (loading) return (
        <div className="flex items-center justify-center h-screen">
            <Loader2 className="animate-spin text-primary" />
        </div>
    );

    if (!isLoggedIn) return <Navigate to="/login" replace />;

    return <Outlet />;
}
