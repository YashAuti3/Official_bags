import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Badge } from '../components/common/UI.jsx';
import { useDebounce, useOptimistic, useApi } from 'devil-frontend';
import { useAppData } from '../context/DataContext';
import {
  Search, Loader2, Trash2, ShoppingBag,
  PackageCheck, PackageX, Clock, X, ChevronDown, FileDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const STATUS_OPTIONS = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const STATUS_STYLES = {
  Pending: { variant: 'warning', icon: Clock },
  Processing: { variant: 'primary', icon: PackageCheck },
  Shipped: { variant: 'dark', icon: PackageCheck },
  Delivered: { variant: 'success', icon: PackageCheck },
  Cancelled: { variant: 'danger', icon: PackageX },
};

const formatAddress = (addr, isShort = false) => {
  if (!addr) return 'No Address';
  
  if (typeof addr === 'object' && Object.keys(addr).length > 0) {
    return isShort 
      ? [addr.street, addr.city].filter(Boolean).join(', ') || 'No Address'
      : [addr.street, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ') || 'No Address';
  }
  
  if (typeof addr === 'string' && addr.trim() !== '') return addr;
  return 'No Address';
};

export default function AdminOrders() {
  const { get } = useApi();
  const {
    adminOrders,
    setAdminOrders,
    adminOrdersPagination,
    setAdminOrdersPagination,
    updateOrderStatus,
    deleteAdminOrder,
    ordersInitialized,
    dataInitialized,
  } = useAppData();

  // Search
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const updateDebouncedSearch = useDebounce(val => setDebouncedSearch(val), 500);
  useEffect(() => { updateDebouncedSearch(searchTerm); }, [searchTerm]);

  // Status filter
  const [activeStatus, setActiveStatus] = useState('All');
  const statusRef = useRef('All');

  // Pagination
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const searchRef = useRef('');

  // Derived from Context pagination
  const total = adminOrdersPagination?.total ?? 0;
  const hasMore = page * (adminOrdersPagination?.limit ?? 10) < total;

  useEffect(() => {
    if (!dataInitialized) return;
    if (!ordersInitialized) return; // DataContext ka wait karo

    const searchChanged = searchRef.current !== debouncedSearch;
    const statusChanged = statusRef.current !== activeStatus;
    searchRef.current = debouncedSearch;
    statusRef.current = activeStatus;

    const filterChanged = searchChanged || statusChanged;

    // Mount pe DataContext ne already load kiya → skip
    if (page === 1 && !filterChanged) return;

    // Filter change + page reset nahi hua
    if (filterChanged && page !== 1) {
      setAdminOrders([]);
      setAdminOrdersPagination(null);
      setPage(1);
      return;
    }

    // Filter change + page 1 → clear karo
    if (filterChanged) {
      setAdminOrders([]);
      setAdminOrdersPagination(null);
    }

    let cancelled = false;
    const fetchPage = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (debouncedSearch) params.set('search', debouncedSearch);
        if (activeStatus !== 'All') params.set('status', activeStatus);
        params.set('page', page.toString());
        params.set('limit', '10');

        const res = await get(`/orders?${params.toString()}`);
        const newData = res?.data ?? (Array.isArray(res) ? res : []);

        if (cancelled) return;

        if (res?.pagination) setAdminOrdersPagination(res.pagination);
        setAdminOrders(prev => page === 1 ? newData : [...prev, ...newData]);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPage();
    return () => { cancelled = true; };
  }, [page, debouncedSearch, activeStatus, dataInitialized, ordersInitialized]);

  // Optimistic
  const { data: optimisticOrders, optimisticUpdate, setOptimisticData } = useOptimistic(adminOrders);
  useEffect(() => { setOptimisticData(adminOrders); }, [adminOrders]);

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [statusDropdownId, setStatusDropdownId] = useState(null);

  const handleDelete = async id => {
    try {
      await optimisticUpdate(id, null, () => deleteAdminOrder(id));
      setAdminOrdersPagination(prev => prev ? { ...prev, total: prev.total - 1 } : prev);
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Failed to delete order:', err);
    }
  };

  const handleStatusChange = async (order, newStatus) => {
    try {
      await optimisticUpdate(
        order._id,
        { ...order, status: newStatus },
        () => updateOrderStatus(order._id, newStatus)
      );
      setStatusDropdownId(null);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleExport = async () => {
    try {
      setExportLoading(true);

      const params = new URLSearchParams();
      if (activeStatus && activeStatus !== 'All') {
        params.set('status', activeStatus);
      }

      const query = params.toString();
      const url = query ? `/orders/export?${query}` : `/orders/export`;

      const response = await get(url);

      if (!response?.success) {
        throw new Error(response?.message || 'Failed to fetch export data');
      }

      const excelData = (response.data || []).flatMap((order) =>
        (order.items || []).map((item) => ({
          'Order ID': order._id,
          'Customer Name': order.user?.name || '-',
          'Customer Email': order.user?.email || '-',
          'Customer Phone': order.user?.phone || '-',
          'Shipping Address': formatAddress(order.shippingAddress),
          'Order Status': order.status || '-',
          'Payment Status': order.paymentStatus || '-',
          'Payment ID': order.paymentId || '-',
          'Razorpay Order ID': order.razorpayOrderId || '-',
          'Total Amount': order.totalAmount || 0,
          'Product Title': item.title || '-',
          'Product Price': item.price || 0,
          'Product Quantity': item.quantity || 0,
          'Selected Color': item.selectedColor || '-',
        }))
      );

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

      const excelBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });

      const file = new Blob(
        [excelBuffer],
        {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
        }
      );

      saveAs(file, `orders-${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExportLoading(false);
    }
  };

  const getStatusBadge = status => {
    const s = STATUS_STYLES[status] ?? { variant: 'dark', icon: Clock };
    return (
      <Badge variant={s.variant} className="flex items-center gap-1 text-[9px] whitespace-nowrap">
        <s.icon size={10} /> {status}
      </Badge>
    );
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter italic">
            Orders
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[4px] text-muted">
            Manage & track all orders
          </p>
        </div>
        <Button
          onClick={handleExport}
          disabled={exportLoading}
          className="flex items-center gap-2 px-5 py-3 text-[10px] font-black uppercase tracking-widest shrink-0"
        >
          {exportLoading
            ? <Loader2 size={14} className="animate-spin" />
            : <FileDown size={14} />}
          Export Excel
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Total', val: total || optimisticOrders.length, icon: ShoppingBag, color: 'primary' },
          { label: 'Pending', val: optimisticOrders.filter(o => o.status === 'Pending').length, icon: Clock, color: 'warning' },
          { label: 'Delivered', val: optimisticOrders.filter(o => o.status === 'Delivered').length, icon: PackageCheck, color: 'dark' },
          { label: 'Cancelled', val: optimisticOrders.filter(o => o.status === 'Cancelled').length, icon: PackageX, color: 'danger' },
        ].map((stat, i) => (
          <Card key={i} className="flex items-center gap-4 p-5 border-none shadow-xl hover:-translate-y-1 transition-all">
            <div className={`w-12 h-12 rounded-2xl bg-${stat.color}/10 flex items-center justify-center text-${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-muted">{stat.label}</span>
              <span className="text-2xl font-black italic tracking-tighter text-dark">{stat.val}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Search + Status Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <Card className="flex-1 flex items-center gap-4 py-4 px-8 border-none shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
          <Search className="text-muted group-focus-within:text-primary transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search by order ID or customer..."
            className="flex-1 bg-transparent border-none outline-none font-bold text-base uppercase tracking-tight placeholder:text-gray-300"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="p-2 rounded-xl bg-gray-100 text-muted hover:bg-danger hover:text-white transition-all">
              <X size={16} />
            </button>
          )}
        </Card>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap gap-2 items-center">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => setActiveStatus(s)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                ${activeStatus === s
                  ? 'bg-dark text-white shadow-lg'
                  : 'bg-white text-muted shadow hover:bg-gray-100'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <Card className="relative p-0 border-none shadow-2xl rounded-3xl bg-white overflow-visible">
        {/* Scrollable table area */}
        <div className="relative overflow-visible">
          <table className="w-full text-left border-collapse relative">
            <thead className="hidden md:table-header-group bg-dark text-white uppercase text-[10px] font-black tracking-widest">
              <tr>
                <th className="px-5 py-4">Order ID</th>
                <th className="px-4 py-4">Customer</th>
                <th className="px-4 py-4">Items</th>
                <th className="px-4 py-4 text-center">Amount</th>
                <th className="px-4 py-4 text-center">Status</th>
                <th className="px-4 py-4 text-center">Date</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="flex flex-col md:table-row-group gap-3 p-3 md:gap-0 md:p-0">
              {optimisticOrders.map(order => (
                <tr
                  key={order._id}
                  className="relative flex flex-col md:table-row bg-white rounded-3xl md:rounded-none shadow-lg shadow-primary/10 md:shadow-none border border-gray-100 md:border-b md:border-b-primary/10 hover:bg-gray-50/50 transition-colors group"
                >
                  {/* Order ID */}
                  <td className="px-4 py-3 flex md:table-cell justify-between items-center gap-3 bg-gray-50 md:bg-transparent border-b border-gray-100 md:border-none">
                    <span className="md:hidden text-[9px] font-black uppercase tracking-widest text-gray-500">
                      Order ID
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-black text-xs uppercase italic tracking-tight text-dark">
                        #{order._id?.slice(-8).toUpperCase()}
                      </span>
                      <span
                        className={`text-[9px] font-black uppercase tracking-widest ${order.paymentStatus === 'Paid'
                          ? 'text-green-500'
                          : 'text-danger'
                          }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </div>
                  </td>

                  {/* Customer */}
                  <td className="px-4 py-2.5 flex md:table-cell justify-between items-start gap-3 border-b border-gray-50 md:border-none">
                    <span className="md:hidden text-[9px] font-black uppercase tracking-widest text-gray-400 mt-1">
                      Customer
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-black text-dark uppercase tracking-tight">
                        {order.user?.name ?? 'Guest'}
                      </span>
                      <span className="text-[10px] font-bold text-muted">
                        {order.user?.email}
                      </span>
                      <span className="text-[10px] font-bold text-muted">
                        {order.user?.phone}
                      </span>
                      <span 
                        className="text-[10px] font-bold text-muted truncate max-w-[160px]" 
                        title={formatAddress(order.shippingAddress)}
                      >
                        📍 {formatAddress(order.shippingAddress, true)}
                      </span>
                    </div>
                  </td>

                  {/* Items */}
                  <td className="px-4 py-2.5 flex md:table-cell justify-between items-start gap-3 border-b border-gray-50 md:border-none">
                    <span className="md:hidden text-[9px] font-black uppercase tracking-widest text-gray-400 mt-1">
                      Items
                    </span>
                    <div className="flex flex-col gap-2">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="flex flex-col gap-0.5">
                            <Link
                              to={`/product/${item.product}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] font-black text-dark uppercase tracking-tight leading-tight hover:text-primary hover:underline transition-colors"
                            >
                              For product details click here
                              {/* {item.title} */}
                            </Link>

                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1 text-[10px] font-bold text-muted capitalize">
                                <span
                                  className="w-3 h-3 rounded-full border border-gray-200 inline-block shrink-0"
                                  style={{ backgroundColor: item.selectedColor }}
                                />
                                {item.selectedColor}
                              </span>
                              <span className="text-[10px] font-black text-dark">
                                ₹{item.price}
                              </span>
                              <span className="text-[10px] font-bold text-muted">
                                ×{item.quantity}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="px-4 py-2.5 flex md:table-cell justify-between items-center gap-3 border-b border-gray-50 md:border-none md:text-center">
                    <span className="md:hidden text-[9px] font-black uppercase tracking-widest text-gray-400">
                      Amount
                    </span>
                    <span className="text-sm font-black text-dark">
                      ₹{order.totalAmount?.toLocaleString('en-IN')}
                    </span>
                  </td>

                  {/* Status Dropdown */}
                  <td className="px-4 py-2.5 flex md:table-cell justify-between items-center gap-3 border-b border-gray-50 md:border-none md:text-center relative overflow-visible">
                    <span className="md:hidden text-[9px] font-black uppercase tracking-widest text-gray-400">
                      Status
                    </span>
                    <div className="relative">
                      <button
                        onClick={() =>
                          setStatusDropdownId(
                            statusDropdownId === order._id ? null : order._id
                          )
                        }
                        className="flex items-center gap-1"
                      >
                        {getStatusBadge(order.status)}
                        <ChevronDown
                          size={12}
                          className={`text-muted transition-transform duration-200 ${statusDropdownId === order._id ? 'rotate-180' : ''}`}
                        />
                      </button>

                      <AnimatePresence>
                        {statusDropdownId === order._id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -5 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className="absolute z-50 top-full mt-1 left-0 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden min-w-[130px] origin-top-left"
                          >
                            {STATUS_OPTIONS.filter(s => s !== 'All').map(s => (
                              <button
                                key={s}
                                onClick={() => handleStatusChange(order, s)}
                                className={`w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-colors ${order.status === s ? 'text-primary' : 'text-dark'
                                  }`}
                              >
                                {s}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="px-4 py-2.5 flex md:table-cell justify-between items-center gap-3 border-b border-gray-50 md:border-none md:text-center">
                    <span className="md:hidden text-[9px] font-black uppercase tracking-widest text-gray-400">
                      Date
                    </span>
                    <span className="text-[10px] font-bold text-muted">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-2.5 flex md:table-cell justify-between items-center gap-3 md:text-right">
                    <span className="md:hidden text-[9px] font-black uppercase tracking-widest text-gray-400">
                      Actions
                    </span>
                    {deleteConfirmId === order._id ? (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleDelete(order._id)}
                          variant="danger"
                          className="p-2 px-3 text-[8px] font-black tracking-widest whitespace-nowrap"
                        >
                          CONFIRM
                        </Button>
                        <Button
                          onClick={() => setDeleteConfirmId(null)}
                          variant="outline"
                          className="p-2 px-3 text-[8px] font-black tracking-widest whitespace-nowrap"
                        >
                          CANCEL
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setDeleteConfirmId(order._id)}
                          className="p-2.5 bg-gray-100 rounded-xl text-muted hover:bg-danger hover:text-white transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Load More */}
        {hasMore && !loading && optimisticOrders.length > 0 && (
          <div className="flex justify-center py-8 border-t border-gray-100">
            <Button
              onClick={() => setPage(prev => prev + 1)}
              className="px-8 py-3 text-[10px] font-black uppercase tracking-widest"
            >
              Load More
            </Button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12 bg-gray-50/50 border-t border-gray-100">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        )}

        {/* Empty state */}
        {!loading && optimisticOrders.length === 0 && (
          <div className="py-24 text-center flex flex-col items-center gap-4">
            <ShoppingBag size={40} className="text-gray-200" />
            <h3 className="text-xl font-black uppercase tracking-tighter">
              No orders found
            </h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted">
              Try clearing your filters
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
