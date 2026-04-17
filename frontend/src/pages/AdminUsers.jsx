import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Badge } from '../components/common/UI.jsx';
import { useDebounce, useOptimistic } from 'devil-frontend';
import { useApi } from 'devil-frontend';
import { useAppData } from '../context/DataContext';
import { Search, Loader2, Trash2, ShieldCheck, ShieldOff, Users, UserCheck, UserX, Crown, X } from 'lucide-react';

export default function AdminUsers() {
  const { get, put } = useApi();
  const {
    adminUsers,
    setAdminUsers,
    adminUsersPagination,
    setAdminUsersPagination,
    deleteUser,
    usersInitialized,
    dataInitialized
  } = useAppData();

  // Search
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const updateDebouncedSearch = useDebounce(val => setDebouncedSearch(val), 500);
  useEffect(() => { updateDebouncedSearch(searchTerm); }, [searchTerm]);

  // Pagination — local page only, baaki sab Context se
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef('');

  // Context pagination se derive karo
  const total = adminUsersPagination?.total ?? 0;
  const hasMore = page * (adminUsersPagination?.limit ?? 10) < total;

  useEffect(() => {
    if (!dataInitialized) return;
    if (!usersInitialized) return; // DataContext ka wait karo

    const searchChanged = searchRef.current !== debouncedSearch;
    searchRef.current = debouncedSearch;

    // Mount pe DataContext ne already load kiya → skip
    if (page === 1 && !searchChanged) return;

    // Search change + page already reset nahi hua
    if (searchChanged && page !== 1) {
      setAdminUsers([]);
      setAdminUsersPagination(null);
      setPage(1);
      return;
    }

    // Search change + page 1 → clear karo
    if (searchChanged) {
      setAdminUsers([]);
      setAdminUsersPagination(null);
    }

    let cancelled = false;
    const fetchPage = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (debouncedSearch) params.set('search', debouncedSearch);
        params.set('page', page.toString());
        params.set('limit', '10');

        const res = await get(`/users?${params.toString()}`);
        const newData = res?.data ?? (Array.isArray(res) ? res : []);

        if (cancelled) return;

        // ✅ Context pagination update karo
        if (res?.pagination) setAdminUsersPagination(res.pagination);

        setAdminUsers(prev => page === 1 ? newData : [...prev, ...newData]);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPage();
    return () => { cancelled = true; };
  }, [page, debouncedSearch, dataInitialized, usersInitialized]);

  // Optimistic
  const { data: optimisticUsers, optimisticUpdate, setOptimisticData } = useOptimistic(adminUsers);
  useEffect(() => { setOptimisticData(adminUsers); }, [adminUsers]);

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const handleDelete = async id => {
    try {
      await optimisticUpdate(id, null, () => deleteUser(id));
      // Pagination total update karo
      setAdminUsersPagination(prev => prev ? { ...prev, total: prev.total - 1 } : prev);
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  const getRoleBadge = role => {
    if (role === 'admin')
      return <Badge variant="dark" className="text-[9px] whitespace-nowrap">Admin</Badge>;
    return <Badge variant="dark" className="text-[9px] whitespace-nowrap">User</Badge>;
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter italic">Users Directory</h1>
          <p className="text-[10px] font-black uppercase tracking-[4px] text-muted">Manage accounts & permissions</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Users', val: total || optimisticUsers.length, icon: Users, color: 'primary' },
          { label: 'Admins', val: optimisticUsers.filter(u => u.role === 'admin').length, icon: UserCheck, color: 'dark' },
          { label: 'Regular Users', val: optimisticUsers.filter(u => u.role !== 'admin').length, icon: UserX, color: 'warning' }
        ].map((stat, i) => (
          <Card key={i} className="flex items-center gap-5 p-6 border-none shadow-xl hover:-translate-y-1 transition-all">
            <div className={`w-14 h-14 rounded-2xl bg-${stat.color}/10 flex items-center justify-center text-${stat.color}`}>
              <stat.icon size={28} />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-muted">{stat.label}</span>
              <span className="text-2xl font-black italic tracking-tighter text-dark">{stat.val}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Search */}
      <Card className="flex items-center gap-4 py-4 px-8 border-none shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
        <Search className="text-muted group-focus-within:text-primary transition-colors" size={24} />
        <input
          type="text"
          placeholder="Search users by name or email..."
          className="flex-1 bg-transparent border-none outline-none font-bold text-lg uppercase tracking-tight placeholder:text-gray-300"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="p-2 rounded-xl bg-gray-100 text-muted hover:bg-danger hover:text-white transition-all">
            <X size={16} />
          </button>
        )}
      </Card>

      {/* Table */}
      <Card className="overflow-hidden p-0 border-none shadow-2xl rounded-3xl bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="hidden md:table-header-group bg-dark text-white uppercase text-[10px] font-black tracking-widest">
              <tr>
                <th className="px-5 py-4">User</th>
                <th className="px-4 py-4 text-center">Email</th>
                <th className="px-4 py-4 text-center">Role</th>
                <th className="px-4 py-4 text-center">Joined</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="flex flex-col md:table-row-group gap-3 p-3 md:gap-0 md:p-0">
              {optimisticUsers.map(user => (
                <tr key={user._id} className="flex flex-col md:table-row bg-white rounded-3xl md:rounded-none shadow-lg shadow-primary/15 md:shadow-none border border-gray-100 md:border-b md:border-b-primary/10 overflow-hidden hover:bg-gray-50/50 transition-colors group">
                  <td className="px-4 py-3 flex md:table-cell justify-between items-center gap-3 bg-gray-50 md:bg-transparent border-b border-gray-100 md:border-none">
                    <span className="md:hidden text-[9px] font-black uppercase tracking-widest text-gray-500">User</span>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-sm shrink-0">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span className="font-black text-sm uppercase italic tracking-tight text-dark">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 flex md:table-cell justify-between items-center gap-3 border-b border-gray-50 md:border-none md:text-center">
                    <span className="md:hidden text-[9px] font-black uppercase tracking-widest text-gray-400">Email</span>
                    <span className="text-xs font-bold text-muted">{user.email}</span>
                  </td>
                  <td className="px-4 py-2.5 flex md:table-cell justify-between items-center gap-3 border-b border-gray-50 md:border-none md:text-center">
                    <span className="md:hidden text-[9px] font-black uppercase tracking-widest text-gray-400">Role</span>
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-4 py-2.5 flex md:table-cell justify-between items-center gap-3 border-b border-gray-50 md:border-none md:text-center">
                    <span className="md:hidden text-[9px] font-black uppercase tracking-widest text-gray-400">Joined</span>
                    <span className="text-[10px] font-bold text-muted">
                      {new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 flex md:table-cell justify-between items-center gap-3 md:text-right">
                    <span className="md:hidden text-[9px] font-black uppercase tracking-widest text-gray-400">Actions</span>
                    {deleteConfirmId === user._id ? (
                      <div className="flex gap-2">
                        <Button onClick={() => handleDelete(user._id)} variant="danger" className="p-2 px-3 text-[8px] font-black tracking-widest whitespace-nowrap">CONFIRM</Button>
                        <Button onClick={() => setDeleteConfirmId(null)} variant="outline" className="p-2 px-3 text-[8px] font-black tracking-widest whitespace-nowrap">CANCEL</Button>
                      </div>
                    ) : (
                      <div className="flex gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setDeleteConfirmId(user._id)} className="p-2.5 bg-gray-100 rounded-xl text-muted hover:bg-danger hover:text-white transition-all">
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

        {hasMore && !loading && optimisticUsers.length > 0 && (
          <div className="flex justify-center py-8 border-t border-gray-100">
            <Button onClick={() => setPage(prev => prev + 1)} className="px-8 py-3 text-[10px] font-black uppercase tracking-widest">
              Load More
            </Button>
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-12 bg-gray-50/50 border-t border-gray-100">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        )}

        {!loading && optimisticUsers.length === 0 && (
          <div className="py-24 text-center flex flex-col items-center gap-4">
            <Users size={40} className="text-gray-200" />
            <h3 className="text-xl font-black uppercase tracking-tighter">No users found</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted">Try clearing your search</p>
          </div>
        )}
      </Card>
    </div>
  );
}
