import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  Settings, 
  LogOut,
  Bell,
  Search,
  Menu,
  X
} from 'lucide-react';
import { cn } from '../common/UI';

const sidebarLinks = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { name: 'Products', icon: Package, path: '/admin/products' },
  { name: 'Orders', icon: ShoppingCart, path: '/admin/orders' },
  { name: 'Users', icon: Users, path: '/admin/users' },
  { name: 'Settings', icon: Settings, path: '/admin/settings' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-bg overflow-hidden font-sans relative">
      {/* Mobile Header */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-16 bg-dark text-white flex items-center px-6 justify-between z-30 shadow-xl">
         <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-black text-sm italic tracking-tighter">WB</div>
             <span className="font-black text-lg tracking-tighter uppercase italic">Admin</span>
         </div>
         <button onClick={() => setIsSidebarOpen(true)} className="p-2 -mr-2 text-white/80 hover:text-white transition-colors">
            <Menu size={24} />
         </button>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
           className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity"
           onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out md:relative w-72 bg-dark text-white flex flex-col border-r border-white/5 shadow-2xl z-50`}>
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-black text-xl italic tracking-tighter shadow-lg shadow-primary/20">
               WB
             </div>
             <span className="font-black text-2xl tracking-tighter uppercase italic">Admin</span>
          </div>
          <button className="md:hidden p-2 text-white/50 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
             <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              end={link.path === '/admin'}
              className={({ isActive }) => cn(
                "flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-300 group relative overflow-hidden",
                isActive 
                  ? "bg-primary text-white shadow-xl shadow-primary/20" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <link.icon className={cn("transition-transform duration-300 group-hover:scale-110", "w-5 h-5")} />
              <span className="font-bold text-[11px] uppercase tracking-[2px]">{link.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5 mt-auto">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-4 px-4 py-4 w-full rounded-xl text-gray-400 hover:text-danger hover:bg-danger/5 transition-all group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold text-[11px] uppercase tracking-[2px]">Exit Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-gray-50/30 overflow-hidden pt-16 md:pt-0">
        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
