import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useApi } from 'devil-frontend';
import { useAppAuth } from './AuthContext';

const AppDataContext = createContext(null);

const PREDEFINED_CATEGORIES = [
  "Leather Bags",
  "Office Bags",
  "Travel Bags",
  "Luxury Bags",
  "New Arrivals",
];

export function AppDataProvider({ children }) {
  const { get, post, put, del } = useApi();
  const { isAdmin } = useAppAuth();
  const [products, setProducts] = useState([]);
  const [categories] = useState(PREDEFINED_CATEGORIES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataInitialized, setDataInitialized] = useState(false);
  const [usersInitialized, setUsersInitialized] = useState(false); // ← ADD
  const [ordersInitialized, setOrdersInitialized] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  // const [totalPages, setTotalPages] = useState(1);

  // Admin Specific
  const [adminOrders, setAdminOrders] = useState([]);
  const [adminOrdersPagination, setAdminOrdersPagination] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminUsersPagination, setAdminUsersPagination] = useState(null);
  const [adminProducts, setAdminProducts] = useState([]);
  const [adminProductsPagination, setAdminProductsPagination] = useState(null);
  const hasFetchedInit = useRef(false);
  const hasFetchedAdmin = useRef(false);

  // Always fetch public product data once on mount
  useEffect(() => {
    if (!hasFetchedInit.current) {
      hasFetchedInit.current = true;
      fetchInitialData();
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      hasFetchedAdmin.current = false;
      return;
    }
    if (hasFetchedAdmin.current) return;
    hasFetchedAdmin.current = true;
    fetchAdminOrders();
    fetchAdminUsers();
  }, [isAdmin]);

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);

      const res = await get('/products?limit=10');

      if (res?.data) {
        setProducts(res.data);
      }
      if (res?.pagination) {
        setPage(res.pagination.page || 1);
        setHasMore((res.pagination.page) < (res.pagination.totalPages));
      } else {
        // if no pagination object, assume no more pages
        setHasMore(false);
      }
    } catch {
      setError('Failed to sync with the warehouse. Please check your connection.');
    } finally {
      setLoading(false);
      setDataInitialized(true);
    }
  }, [get]);

  const refreshProducts = async (filters = '') => {
    try {
      setLoading(true);
      const res = await get(`/products?limit=10${filters}`);
      if (res.data) setProducts(res.data);
      return res;
    } catch (err) {
      setError('Could not update the collection right now.');
      throw err;
    } finally {
      setLoading(false);
    }
  };


  // ✅ BAAD — stable reference
  const fetchSingleProduct = useCallback(async (id) => {
    try {
      setLoading(true);
      return await get(`/products/${id}`);
    } catch (err) {
      setError('The design you are looking for is currently unavailable.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [get]);

  const fetchRelatedProducts = useCallback(async (category, excludeId) => {
    try {
      const res = await get(`/products?category=${category}&limit=5`);
      if (res.docs) {
        return res.docs.filter(p => p._id !== excludeId).slice(0, 4);
      }
      return [];
    } catch {
      return [];
    }
  }, [get]);


  // Checkout
  const createRazorpayOrder = async () => {
    return await post('/orders/create-razorpay-order');
  };

  const verifyPayment = async (payload) => {
    return await post('/orders/verify', payload);
  };

  // Product CRUD
  const addProduct = async (formData) => {
    const res = await post('/products', formData);
    await fetchInitialData();
    return res;
  };

  const updateProduct = async (id, formData) => {
    const res = await put(`/products/${id}`, formData);
    await fetchInitialData();
    return res;
  };

  const deleteProduct = async (id) => {
    const res = await del(`/products/${id}`);
    await fetchInitialData();
    return res;
  };

  // Admin Data
  const fetchAdminOrders = useCallback(async (status = 'All', page = 1, limit = 10, search = '') => {
    if (!isAdmin) return;
    try {
      const query = new URLSearchParams();
      if (status !== 'All') query.append('status', status);
      if (search) query.append('search', search);
      query.append('page', page);
      query.append('limit', limit);

      const res = await get(`/orders?${query.toString()}`);
      if (res.data) {
        setAdminOrders(res.data);
        setAdminOrdersPagination(res.pagination);
      }
      return res;
    } catch {
      setError('Unable to fetch the order manifest.');
    } finally {
      setOrdersInitialized(true); // ← ADD
    }
  }, [get, isAdmin]);

  const updateOrderStatus = async (id, status) => {
    const res = await put(`/orders/${id}/status`, { status });
    return res;
  };

  const deleteAdminOrder = async (id) => {
    const res = await del(`/orders/${id}`);
    return res;
  };

  const fetchAdminUsers = useCallback(async (page = 1, limit = 10, search = '') => {
    if (!isAdmin) return;
    try {
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      query.append('page', page);
      query.append('limit', limit);

      const res = await get(`/users?${query.toString()}`);
      if (res.data) {
        setAdminUsers(res.data);
        setAdminUsersPagination(res.pagination);
      }
      return res;
    } catch {
      setError('Failed to retrieve the user base.');
    } finally {
      setUsersInitialized(true);
    }
  }, [get, isAdmin]);

  const deleteUser = async (id) => {
    const res = await del(`/users/${id}`);
    await fetchAdminUsers();
    return res;
  };

  const fetchAdminProducts = async (page = 1, limit = 10, search = '') => {
    if (!isAdmin) return;
    try {
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      query.append('page', page);
      query.append('limit', limit);

      const res = await get(`/products?${query.toString()}`);
      if (res.data) {
        setAdminProducts(res.data.data);
        setAdminProductsPagination({
          total: res.data.total,
          page: res.data.page,
          limit: res.data.limit,
          totalPages: res.data.totalPages
        });
      }
      return res;
    } catch (err) {
      setError('Warehouse manifest retrieval failed.');
    }
  };

  return (
    <AppDataContext.Provider value={{
      products,
      categories: ['All', ...categories],
      rawCategories: categories,
      loading,
      error,
      refreshProducts,
      fetchSingleProduct,
      fetchRelatedProducts,
      addProduct,
      updateProduct,
      deleteProduct,
      createRazorpayOrder,
      verifyPayment,
      adminOrders,
      adminOrdersPagination,
      fetchAdminOrders,
      updateOrderStatus,
      deleteAdminOrder,
      adminUsers,
      setAdminUsers,
      adminUsersPagination,
      fetchAdminUsers,
      adminProducts,
      adminProductsPagination,
      fetchAdminProducts,
      deleteUser,
      sync: fetchInitialData,
      setProducts,
      dataInitialized,
      usersInitialized,
      setAdminUsersPagination,
      setAdminOrders,
      setAdminOrdersPagination,
      ordersInitialized,
      page,
      setPage,
      hasMore,
      setHasMore,
    }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
