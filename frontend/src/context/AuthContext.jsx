import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useApi } from 'devil-frontend';

const AppAuthContext = createContext(null);

export function AppAuthProvider({ children }) {
  const { get, post, put, setAuthToken, clearToken, del } = useApi();

  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('webbags_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [emailPreferences, setEmailPreferences] = useState({
    promotions: false,
    orderUpdates: true,
  });

  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('webbags_admin') === 'true';
  });

  const [loading, setLoading] = useState(true);
  const [myOrders, setMyOrders] = useState([]);
  const isFetchingMe = useRef(false);
  const fetchMe = useCallback(async () => {
    if (isFetchingMe.current) return;
    isFetchingMe.current = true;

    try {
      const res = await get('/users/profile');
      // Fix: Handle both nested and direct response formats
      const userData = res.user || res.data || res;
      const admin = userData?.role === 'admin';

      setUser(userData);
      setIsAdmin(admin);
      localStorage.setItem('webbags_user', JSON.stringify(userData));
      localStorage.setItem('webbags_admin', String(admin));

      // Only fetch user orders if NOT admin
      if (userData && !admin) fetchMyOrders();
    } catch (err) {
      console.error('Session validation failed:', err);
      _clearAuth();
    } finally {
      // Keep isFetchingMe true to prevent subsequent mount-related re-runs 
      // if the component somehow re-triggers despite []
      setLoading(false);
    }
  }, [get]);
  useEffect(() => {
    // Only fetch if not already in flight
    if (!isFetchingMe.current) {
      loadEmailPreferences();
      fetchMe();
    }
  }, [user]); // Run ONLY once on mount
  const loadEmailPreferences = async () => {
    const res = await get('/settings/email');
    const prefs = res?.emailPreferences || {};
    setEmailPreferences({
      promotions: !!prefs.promotions,
      orderUpdates:
        prefs.orderUpdates !== undefined ? !!prefs.orderUpdates : true,
    });
  };
  const updateEmailPreferences = async (partial) => {
    const updated = { ...emailPreferences, ...partial };
    setEmailPreferences(updated); // optimistic

    try {
      const res = await put('/settings/email', {
        promotions: updated.promotions,
        orderUpdates: updated.orderUpdates,
      });
      const prefs = res?.emailPreferences || {};
      setEmailPreferences({
        promotions: !!prefs.promotions,
        orderUpdates:
          prefs.orderUpdates !== undefined ? !!prefs.orderUpdates : true,
      });
    } catch (err) {
      // revert on error
      setEmailPreferences(emailPreferences);
      throw err;
    }
  };

  const fetchMyOrders = useCallback(async () => {
    if (isAdmin) return;
    try {
      const res = await get('/orders/my-orders');
      if (res.data || res.docs) setMyOrders(res.data || res.docs);
      return res;
    } catch (err) {
      console.error('Failed to sync orders history:', err);
    }
  }, [get, isAdmin]);

  const _clearAuth = useCallback(() => {
    clearToken();
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('webbags_user');
    localStorage.removeItem('webbags_admin');
  }, [clearToken]);

  const register = useCallback(async (formData) => {
    try {
      const res = await post('/auth/register', formData);
      const userData = res.user || res.data;
      const admin = userData?.role === 'admin';
      if (res.accessToken) setAuthToken(res.accessToken);
      setUser(userData);
      setIsAdmin(admin);
      localStorage.setItem('webbags_user', JSON.stringify(userData));
      localStorage.setItem('webbags_admin', String(admin));
      return res;
    } catch (err) {
      // ✅ Normalized error throw
      const msg =
        err?.response?.data?.errors?.[0] || // Get first error from array if available
        err?.response?.data?.message ||
        err?.message ||
        'Registration failed, please try again';
      throw new Error(msg);
    }
  }, [post, setAuthToken]);

  const login = useCallback(async (formData) => {
    try {
      const res = await post('/auth/login', formData);
      const userData = res.user || res.data;
      const admin = userData?.role === 'admin';
      if (res.accessToken) setAuthToken(res.accessToken);
      setUser(userData);
      setIsAdmin(admin);
      isFetchingMe.current = false;
      localStorage.setItem('webbags_user', JSON.stringify(userData));
      localStorage.setItem('webbags_admin', String(admin));
      fetchMe();
      return res;
    } catch (err) {
      // ✅ Normalized error throw
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Login failed, please try again';
      throw new Error(msg);
    }
  }, [post, setAuthToken]);


  const logout = useCallback(async () => {
    try { await post('/auth/logout'); } catch { /* ignore */ }
    _clearAuth();
  }, [post, _clearAuth]);

  const authValue = useMemo(() => ({
    user,
    isAdmin,
    isLoggedIn: !!user,
    loading,
    login,
    logout,
    register,
    forgotPassword: async (email) => {
      try {
        const res = await post('/auth/forgot-password', { email });
        return res;
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          'Failed to send reset link';
        throw new Error(msg);
      }
    },

    resetPassword: async (token, password) => {
      try {
        const res = await post('/auth/reset-password/' + token, { password });
        return res;
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          'Failed to reset password';
        throw new Error(msg);
      }
    },

    updateProfile: async (formData) => {
      const res = await put('/users/profile', formData);
      const userData = res.user || res.data;
      setUser(userData);
      localStorage.setItem('webbags_user', JSON.stringify(userData));
      return res;
    },
    changePassword: async (formData) => await put('/users/change-password', formData),
    fetchMe,
    myOrders,
    fetchMyOrders,
    // authValue me
    deleteAccount: async (password) => {
      const res = await post('/users/delete-account', { password });
      _clearAuth();
      return res;
    },
    emailPreferences,
    loadEmailPreferences,
    updateEmailPreferences,

  }), [user, isAdmin, loading, login, logout, register, post, put, fetchMe, myOrders, fetchMyOrders]);

  if (loading) return null;

  return (
    <AppAuthContext.Provider value={authValue}>
      {children}
    </AppAuthContext.Provider>
  );
}

export function useAppAuth() {
  const ctx = useContext(AppAuthContext);
  if (!ctx) throw new Error('useAppAuth must be used within AppAuthProvider');
  return ctx;
}
