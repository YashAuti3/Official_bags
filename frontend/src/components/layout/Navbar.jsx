import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, Menu, X, LogOut } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAppAuth } from '../../context/AuthContext';
import logo from "../../assets/logo.png";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(false); // ✅ new state

  const { cartCount } = useCart();
  const { isLoggedIn, logout } = useAppAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ navbar animation on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNavbar(true);
    }, 200); // thoda delay for smooth feel

    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const isActive = (path) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(path);

  const linkClass = (path) =>
    `hover:text-primary transition-colors ${isActive(path) ? 'text-primary' : ''}`;

  return (
    <nav
      className={`fixed top-0 left-0 w-full bg-container text-white z-50 shadow-md 
      transition-transform duration-500 ease-in-out 
      ${showNavbar ? 'translate-y-0' : '-translate-y-full'}`}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">

        <Link to="/" className="flex items-center gap-2">
          <img 
            src={logo} 
            alt="logo" 
            className="h-12 md:h-14 w-auto object-contain"
          />
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-8 items-center font-medium uppercase text-sm">
          <Link to="/" className={linkClass('/')}>Home</Link> 
          <Link to="/categories" className={linkClass('/categories')}>Categories</Link>
          <Link to="/about" className={linkClass('/about')}>About Us</Link>
          <Link to="/contact" className={linkClass('/contact')}>Contact</Link>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-4 md:gap-6">
          <Link to="/cart" className="relative hover:text-primary transition-colors">
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>

          {isLoggedIn ? (
            <div className="flex items-center gap-3 md:gap-4">
              <Link to="/profile" className="hover:text-primary transition-colors">
                <User size={22} />
              </Link>
              <button
                onClick={handleLogout}
                className="hover:text-primary transition-colors hidden md:block"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="hover:text-primary transition-colors">
              <User size={22} />
            </Link>
          )}

          <button
            className="md:hidden hover:text-primary transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden bg-container border-t border-white/10 overflow-hidden transition-all duration-300 ease-in-out 
        ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="px-6 py-4 flex flex-col gap-4 text-sm font-medium uppercase">
          <Link to="/" onClick={() => setIsOpen(false)} className={linkClass('/')}>Home</Link>
          <Link to="/categories" onClick={() => setIsOpen(false)} className={linkClass('/categories')}>Categories</Link>
          <Link to="/about" onClick={() => setIsOpen(false)} className={linkClass('/about')}>About Us</Link>
          <Link to="/contact" onClick={() => setIsOpen(false)} className={linkClass('/contact')}>Contact</Link>
          {isLoggedIn ? (
            <>
              <Link to="/profile" onClick={() => setIsOpen(false)} className={linkClass('/profile')}>My Profile</Link>
              <button onClick={handleLogout} className="text-left hover:text-primary text-danger">Logout</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setIsOpen(false)} className={linkClass('/login')}>Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}