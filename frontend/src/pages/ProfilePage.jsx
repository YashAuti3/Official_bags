import { User, Package, Settings, LogOut, CheckCircle, Clock, Loader2, Truck, ShieldCheck, Bell } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppAuth } from '../context/AuthContext';
import { Button, Card } from '../components/common/UI';
import SettingsTab from '../components/SettingsTab';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', phone: '', address: { street: '', city: '', state: '', pincode: '' } });
  const { user: authUser, logout, myOrders, updateProfile, isAdmin } = useAppAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const user = authUser || {};
  const orders = myOrders || [];

  const handleEdit = () => {
    setEditData({
      name: user.name || '',
      phone: user.phone || '',
      address: typeof user.address === 'object' ? {
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        pincode: user.address?.pincode || ''
      } : { street: user.address || '', city: '', state: '', pincode: '' }
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setSubmitting(true);
      await updateProfile(editData);
      setIsEditing(false);
    } catch {
      alert('Failed to update profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getProgress = (status) => {
    switch (status) {
      case 'Pending': return 20;
      case 'Processing': return 45;
      case 'Shipped': return 75;
      case 'Delivered': return 100;
      default: return 10;
    }
  };

  const tabs = [
    { name: 'Overview', icon: User },
    { name: 'Orders', icon: Package },
    { name: 'Settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-bg py-8 md:py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col gap-6 md:gap-12">

        {/* ── Profile Header ──────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 bg-white p-6 md:p-10 rounded-2xl md:rounded-[32px] shadow-2xl shadow-gray-200/50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 md:gap-7 relative z-10 w-full sm:w-auto">
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl md:rounded-[24px] overflow-hidden border-4 border-primary/20 p-1.5 bg-white flex items-center justify-center group-hover:border-primary transition-all duration-500 shrink-0">
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                alt={user.name}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div className="flex flex-col gap-1 md:gap-2">
              <span className="text-[10px] font-black uppercase text-primary tracking-[4px]">Welcome Back</span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter  leading-none">
                {user.name}
              </h1>
              <p className="text-muted font-medium text-sm md:text-base lowercase">{user.email}</p>
              {/* ✅ Admin badge */}
              {isAdmin && (
                <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full w-max mt-1">
                  <ShieldCheck size={11} /> Administrator
                </span>
              )}
            </div>
          </div>

          {/* ✅ Admin Dashboard Button + Logout */}
          <div className="flex items-center gap-3 z-10 shrink-0">
            {isAdmin && (
              <Button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2.5 px-6 md:px-7 py-3 md:py-3.5 text-sm shadow-xl shadow-primary/20"
              >
                <ShieldCheck size={16} /> Admin Panel
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2.5 px-6 md:px-7 py-3 md:py-3.5 border-gray-200 text-danger hover:bg-red-50 hover:border-red-100 transition-all text-sm"
            >
              <LogOut size={16} /> Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-10">

          {/* Tabs */}
          <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`flex items-center gap-3 px-5 md:px-7 py-3 md:py-4 rounded-xl font-black uppercase tracking-widest text-[10px] md:text-xs transition-all duration-300 whitespace-nowrap shrink-0 ${activeTab === tab.name
                  ? 'bg-primary text-white shadow-2xl shadow-primary/30 lg:translate-x-2'
                  : 'bg-white text-muted hover:bg-gray-100 hover:lg:translate-x-1 border border-transparent hover:border-gray-200'
                  }`}
              >
                <tab.icon size={16} /> {tab.name}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="lg:col-span-3 flex flex-col gap-6 md:gap-8">

            {/* ── Overview ── */}
            {activeTab === 'Overview' && (
              <Card className="p-6 md:p-10 flex flex-col gap-6 md:gap-8 shadow-2xl border-none rounded-2xl md:rounded-[32px]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                  {[
                    { label: 'Full Name', value: user.name, key: 'name', disabled: true },
                    { label: 'Email Address', value: user.email, key: 'email', disabled: true },
                    { label: 'Phone Number', value: user.phone || 'Not provided', key: 'phone' },
                    { label: 'Default Address', value: typeof user.address === 'object' ? [user.address?.street, user.address?.city, user.address?.state, user.address?.pincode].filter(Boolean).join(', ') : user.address || 'No address saved', key: 'address', fullWidth: true },
                  ].map(({ label, value, key, disabled, fullWidth }) => (
                    <div key={label} className={`flex flex-col gap-2.5 ${fullWidth ? 'sm:col-span-2' : ''}`}>
                      <label className="text-[10px] font-black uppercase tracking-[3px] text-primary">{label}</label>
                      {isEditing && !disabled ? (
                        key === 'address' ? (
                          <div className="flex flex-col gap-3">
                            <input
                              type="text"
                              value={editData.address?.street || ''}
                              onChange={(e) => setEditData({ ...editData, address: { ...editData.address, street: e.target.value } })}
                              className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-5 py-3.5 text-base font-bold text-dark focus:border-primary focus:bg-white outline-none transition-all"
                              placeholder="Street Address / Landmark"
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <input
                                type="text"
                                value={editData.address?.city || ''}
                                onChange={(e) => setEditData({ ...editData, address: { ...editData.address, city: e.target.value } })}
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-5 py-3.5 text-base font-bold text-dark focus:border-primary focus:bg-white outline-none transition-all"
                                placeholder="City"
                              />
                              <input
                                type="text"
                                value={editData.address?.state || ''}
                                onChange={(e) => setEditData({ ...editData, address: { ...editData.address, state: e.target.value } })}
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-5 py-3.5 text-base font-bold text-dark focus:border-primary focus:bg-white outline-none transition-all"
                                placeholder="State"
                              />
                              <input
                                type="text"
                                value={editData.address?.pincode || ''}
                                onChange={(e) => setEditData({ ...editData, address: { ...editData.address, pincode: e.target.value } })}
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-5 py-3.5 text-base font-bold text-dark focus:border-primary focus:bg-white outline-none transition-all"
                                placeholder="Pincode"
                              />
                            </div>
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={editData[key]}
                            onChange={(e) => setEditData({ ...editData, [key]: e.target.value })}
                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-5 py-3.5 text-base font-bold text-dark focus:border-primary focus:bg-white outline-none transition-all"
                            placeholder={`Enter your ${label.toLowerCase()}`}
                          />
                        )
                      ) : (
                        <p className={`text-base md:text-xl font-black uppercase tracking-tighter break-words ${disabled ? 'opacity-50' : ''}`}>{value}</p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="h-px bg-gray-100" />
                <div className="flex flex-wrap justify-end gap-3">
                  {isEditing ? (
                    <>
                      <Button variant="outline" onClick={() => setIsEditing(false)} disabled={submitting} className="px-5 md:px-7 border-gray-200 py-2.5 text-sm">Cancel</Button>
                      <Button onClick={handleSave} loading={submitting} className="px-5 md:px-7 shadow-xl shadow-primary/20 py-2.5 text-sm">Save Changes</Button>
                    </>
                  ) : (
                    <Button variant="outline" onClick={handleEdit} className="px-5 md:px-7 border-gray-200 py-2.5 text-sm">Edit Profile</Button>
                  )}
                </div>
              </Card>
            )}

            {/* ── Orders ── */}
            {activeTab === 'Orders' && (
              <>
                {/* ✅ Admin message */}
                {isAdmin ? (
                  <Card className="p-10 flex flex-col items-center gap-5 shadow-2xl border-none rounded-2xl md:rounded-[32px] text-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <ShieldCheck size={32} />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tighter ">You are an Administrator</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted max-w-xs">
                      Admin accounts don't have personal orders. Manage all orders from the admin panel.
                    </p>
                    <Button
                      onClick={() => navigate('/admin/orders')}
                      className="px-8 py-3.5 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 mt-2"
                    >
                      <Package size={16} className="mr-2" /> View All Orders
                    </Button>
                  </Card>
                ) : (
                  <div className="flex flex-col gap-5 md:gap-7">
                    {orders.length > 0 ? orders.map((order) => {
                      const progress = getProgress(order.status);
                      return (
                        <Card key={order._id} className="p-0 overflow-hidden shadow-2xl border-none group rounded-2xl md:rounded-[28px]">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 md:p-7 bg-white border-b border-gray-50 gap-4">
                            <div className="flex items-center gap-4 md:gap-5">
                              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                                <Package size={20} />
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[9px] font-black uppercase tracking-[3px] text-primary">#{order._id?.slice(-8)}</span>
                                <h3 className="text-base md:text-lg font-black uppercase tracking-tighter">{new Date(order.createdAt).toLocaleDateString()}</h3>
                              </div>
                            </div>
                            <div className="flex items-center gap-6 md:gap-10 w-full sm:w-auto justify-between sm:justify-end">
                              <div className="flex flex-col items-end">
                                <span className="text-[9px] font-black uppercase tracking-widest text-muted">Total Paid</span>
                                <p className="text-lg md:text-xl font-black text-dark">₹{order.totalAmount}</p>
                              </div>
                              <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary'}`}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                          <div className="p-5 md:p-7 bg-gray-50/50 flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] uppercase font-black tracking-widest text-muted">Order Progress</span>
                              <span className="text-[9px] uppercase font-black text-primary">{progress}%</span>
                            </div>
                            <div className="w-full h-2.5 bg-white rounded-full overflow-hidden border border-gray-100 p-0.5">
                              <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
                            </div>
                            <div className="flex justify-between mt-1">
                              {[
                                { label: 'Placed', icon: Clock, threshold: 0 },
                                { label: 'Packed', icon: Package, threshold: 35 },
                                { label: 'Shipped', icon: Truck, threshold: 65 },
                                { label: 'Delivered', icon: CheckCircle, threshold: 100 },
                              ].map(({ label, icon: ProgressIcon, threshold }) => (
                                <div key={label} className={`flex flex-col items-center gap-1.5 ${progress >= threshold ? 'text-primary' : 'text-gray-300'}`}>
                                  <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center ${progress >= threshold ? 'bg-primary text-white shadow-md' : 'bg-white border-2 border-gray-100'}`}>
                                    <ProgressIcon size={12} />
                                  </div>
                                  <span className="text-[8px] font-black uppercase tracking-tighter">{label}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </Card>
                      );
                    }) : (
                      <div className="text-center py-20 bg-white rounded-3xl shadow-xl">
                        <Package size={48} className="mx-auto text-gray-200 mb-4" />
                        <p className="font-black uppercase tracking-widest text-muted">No orders yet</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {activeTab === 'Settings' && (
              <SettingsTab user={user} isAdmin={isAdmin} />
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
