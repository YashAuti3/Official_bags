import React, { useMemo } from 'react';
import { Card, Button, Badge } from '../common/UI';
import {
    Users, Package, DollarSign, Zap, Target,
    Plus, Loader2, AlertTriangle, Clock,
    ExternalLink, ShoppingBag
} from 'lucide-react';
import { useAppData } from '../../context/DataContext';
import { Show } from 'devil-frontend';
import { Link } from 'react-router-dom';

// ── Revenue Line Chart ───────────────────────────────────────
const RevenueLineChart = ({ orders }) => {
    // Last 7 days ka revenue group karo
    const data = useMemo(() => {
        const days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toDateString();
        });
        return days.map(day =>
            orders
                .filter(o => new Date(o.createdAt).toDateString() === day)
                .reduce((sum, o) => sum + (o.totalAmount || 0), 0)
        );
    }, [orders]);

    const max = Math.max(...data, 1);
    const points = data
        .map((val, i) => `${(i * 100) / (data.length - 1)},${100 - (val / max) * 100}`)
        .join(' ');

    const days = ['6d', '5d', '4d', '3d', '2d', '1d', 'Today'];

    return (
        <div className="relative w-full mt-4">
            <div className="text-[8px] font-black uppercase text-muted tracking-widest mb-3">
                Revenue Growth (Last 7 Days)
            </div>
            <div className="h-48">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                    {[0, 25, 50, 75, 100].map(y => (
                        <line key={y} x1="0" y1={y} x2="100" y2={y}
                            stroke="currentColor" strokeOpacity="0.05" strokeWidth="0.5" />
                    ))}
                    <defs>
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <polyline
                        points={`${points} 100,100 0,100`}
                        fill="url(#areaGradient)"
                    />
                    <polyline
                        fill="none"
                        stroke="var(--primary)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={points}
                        style={{ filter: 'drop-shadow(0 4px 6px rgba(var(--primary-rgb),0.3))' }}
                    />
                    {data.map((val, i) => (
                        <circle
                            key={i}
                            cx={(i * 100) / (data.length - 1)}
                            cy={100 - (val / max) * 100}
                            r="1.8"
                            fill="white"
                            stroke="var(--primary)"
                            strokeWidth="1.2"
                        />
                    ))}
                </svg>
            </div>
            {/* X-axis labels */}
            <div className="flex justify-between mt-2">
                {days.map(d => (
                    <span key={d} className="text-[8px] font-bold text-muted uppercase">{d}</span>
                ))}
            </div>
            {/* Min / Max */}
            <div className="flex gap-8 mt-4 pt-4 border-t border-gray-50">
                <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase text-muted tracking-widest">Highest</span>
                    <span className="font-black text-dark text-lg italic tracking-tighter">
                        ₹{Math.max(...data).toLocaleString('en-IN')}
                    </span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase text-muted tracking-widest">Today</span>
                    <span className="font-black text-dark text-lg italic tracking-tighter">
                        ₹{data[6].toLocaleString('en-IN')}
                    </span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase text-muted tracking-widest">Total (7D)</span>
                    <span className="font-black text-dark text-lg italic tracking-tighter">
                        ₹{data.reduce((a, b) => a + b, 0).toLocaleString('en-IN')}
                    </span>
                </div>
            </div>
        </div>
    );
};

// ── Category Pie Chart ───────────────────────────────────────
const CategoryPieChart = ({ products }) => {
    const categoryData = useMemo(() => {
        const counts = {};
        products.forEach(p => {
            counts[p.category] = (counts[p.category] || 0) + 1;
        });
        const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
        const colors = ['var(--primary)', '#1a1a1a', '#9ca3af', '#e5e7eb', '#f97316'];
        return Object.entries(counts).map(([name, count], i) => ({
            name,
            count,
            pct: Math.round((count / total) * 100),
            color: colors[i % colors.length],
        }));
    }, [products]);

    // Cumulative dashoffset for each segment
    let offset = 0;
    const segments = categoryData.map(cat => {
        const seg = { ...cat, offset };
        offset += cat.pct;
        return seg;
    });

    const topCategory = categoryData[0];

    return (
        <div className="flex flex-col gap-4">
            <div className="relative flex items-center justify-center h-48">
                <svg viewBox="0 0 36 36" className="w-36 h-36 transform -rotate-90">
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f3f4f6" strokeWidth="4" />
                    {segments.map((seg, i) => (
                        <circle
                            key={i}
                            cx="18" cy="18" r="15.915"
                            fill="none"
                            stroke={seg.color}
                            strokeWidth="4"
                            strokeDasharray={`${seg.pct} ${100 - seg.pct}`}
                            strokeDashoffset={-seg.offset}
                        />
                    ))}
                </svg>
                <div className="absolute flex flex-col items-center">
                    <span className="text-xl font-black italic tracking-tighter">
                        {topCategory?.pct ?? 0}%
                    </span>
                    <span className="text-[8px] font-black uppercase text-muted tracking-widest text-center leading-tight">
                        {topCategory?.name?.split(' ')[0] ?? 'N/A'}
                    </span>
                </div>
            </div>
            {/* Legend */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-50">
                {categoryData.map((cat, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                        <span className="text-[10px] font-black uppercase tracking-tight truncate">
                            {cat.name} ({cat.pct}%)
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ── Status Badge helper ──────────────────────────────────────
const STATUS_VARIANT = {
    Delivered: 'success',
    Shipped: 'primary',
    Processing: 'warning',
    Pending: 'warning',
    Cancelled: 'danger',
};

// ── Main Dashboard ───────────────────────────────────────────
export default function AdminDashboard() {
    const {
        products,
        adminOrders,
        adminUsers,
        adminOrdersPagination,
        adminUsersPagination,
        loading,
    } = useAppData();

    const orders = adminOrders || [];
    const users = adminUsers || [];
    const prods = products || [];

    // Real stats
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalOrders = adminOrdersPagination?.total ?? orders.length;
    const totalUsers = adminUsersPagination?.total ?? users.length;
    const pendingOrders = orders.filter(o => o.status === 'Pending').length;

    // Today's revenue
    const todayRevenue = orders
        .filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString())
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const stats = [
        {
            title: 'Total Revenue',
            value: `₹${totalRevenue.toLocaleString('en-IN')}`,
            sub: `₹${todayRevenue.toLocaleString('en-IN')} today`,
            icon: DollarSign,
            color: 'text-green-500',
            bg: 'bg-green-50',
        },
        {
            title: 'Total Members',
            value: totalUsers.toString(),
            sub: `${users.filter(u => u.role !== 'admin').length} regular users`,
            icon: Users,
            color: 'text-blue-500',
            bg: 'bg-blue-50',
        },
        {
            title: 'Total Orders',
            value: totalOrders.toString(),
            sub: `${pendingOrders} pending`,
            icon: ShoppingBag,
            color: 'text-amber-500',
            bg: 'bg-amber-50',
        },
        {
            title: 'Total Products',
            value: prods.length.toString(),
            icon: Package,
            color: 'text-primary',
            bg: 'bg-primary/5',
        },
    ];

    return (
        <div className="flex flex-col gap-10">
            <Show
                when={!loading}
                fallback={
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-primary" size={40} />
                    </div>
                }
            >
                {/* Header */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter italic">
                        Workspace Analytics
                    </h1>
                    <p className="text-muted font-medium text-[10px] md:text-sm border-l-4 border-primary pl-4 uppercase tracking-[2px]">
                        Core pulses and performance metrics
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map(stat => (
                        <Card key={stat.title} className="p-6 md:p-8 group hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                                <stat.icon size={100} />
                            </div>
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-4 rounded-2xl group-hover:scale-110 transition-transform duration-500 shadow-sm ${stat.bg} ${stat.color}`}>
                                    <stat.icon size={28} />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black uppercase tracking-[3px] text-muted">{stat.title}</span>
                                <span className="text-3xl font-black text-dark tracking-tighter">{stat.value}</span>
                                <span className="text-[10px] font-bold text-muted">{stat.sub}</span>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <Card className="p-8 flex flex-col gap-2 shadow-2xl border-none">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-black uppercase tracking-tighter italic">Revenue Pulse</h3>
                            <Badge variant="success">Live</Badge>
                        </div>
                        <RevenueLineChart orders={orders} />
                    </Card>

                    <Card className="p-8 flex flex-col gap-4 shadow-2xl border-none">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-black uppercase tracking-tighter italic">Category Split</h3>
                            <Badge variant="outline">{prods.length} Products</Badge>
                        </div>
                        <CategoryPieChart products={prods} />
                    </Card>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    {/* Recent Orders Table */}
                    <Card className="lg:col-span-2 p-0 overflow-hidden border-none shadow-2xl">
                        <div className="flex justify-between items-center p-8 border-b border-gray-100">
                            <h3 className="text-xl font-black uppercase tracking-tighter italic">Recent Orders</h3>
                            <Link to="/admin/orders">
                                <Button variant="outline" className="text-[10px] font-black tracking-widest uppercase py-2">
                                    View All
                                </Button>
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 uppercase text-[9px] font-black tracking-widest text-muted">
                                    <tr>
                                        <th className="px-6 py-4">Order ID</th>
                                        <th className="px-6 py-4">Customer</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {orders.slice(0, 6).map(order => (
                                        <tr key={order._id} className="group hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-black text-xs uppercase tracking-tighter group-hover:text-primary transition-colors">
                                                <div className="flex items-center gap-2">
                                                    #{order._id?.slice(-8).toUpperCase()}
                                                    <ExternalLink size={11} className="opacity-0 group-hover:opacity-100" />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-dark uppercase tracking-tight">{order.user?.name ?? 'Guest'}</span>
                                                    <span className="text-[10px] text-muted">{order.user?.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Badge variant={STATUS_VARIANT[order.status] ?? 'primary'}>
                                                    {order.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right font-black text-sm tracking-tighter">
                                                ₹{order.totalAmount?.toLocaleString('en-IN')}
                                            </td>
                                        </tr>
                                    ))}
                                    {orders.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-16 text-center text-[10px] font-black uppercase text-muted tracking-widest">
                                                No orders yet
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Right Column */}
                    <div className="flex flex-col gap-6">

                        {/* Order Status Breakdown */}
                        <Card className="p-8 flex flex-col gap-5 border-none shadow-2xl">
                            <h3 className="text-lg font-black uppercase tracking-tighter italic flex items-center gap-3">
                                <Clock size={18} className="text-primary" /> Order Status
                            </h3>
                            {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(status => {
                                const count = orders.filter(o => o.status === status).length;
                                const pct = orders.length ? Math.round((count / orders.length) * 100) : 0;
                                return (
                                    <div key={status} className="flex flex-col gap-1.5">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted">{status}</span>
                                            <span className="text-[10px] font-black text-dark">{count} ({pct}%)</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-700 ${status === 'Delivered' ? 'bg-green-400' :
                                                    status === 'Cancelled' ? 'bg-danger' :
                                                        status === 'Shipped' ? 'bg-blue-400' :
                                                            status === 'Processing' ? 'bg-primary' :
                                                                'bg-amber-400'
                                                    }`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </Card>
                    </div>
                </div>
            </Show>
        </div>
    );
}
