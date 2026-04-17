import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Contexts
import { CartProvider } from './context/CartContext';
import { AppAuthProvider } from './context/AuthContext';
import { AppDataProvider } from './context/DataContext';
import { ApiProvider } from 'devil-frontend';
// Guards
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import Layout from './Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import CartPage from './pages/CartPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CategoriesPage from './pages/CategoriesPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';

// Admin Pages
import AdminLayout from './components/admin/AdminLayout.jsx';
import AdminDashboard from './components/admin/AdminDashboard.jsx';
import AdminProducts from './pages/AdminProducts.jsx';
import AdminOrders from './pages/AdminOrders.jsx';
import AdminUsers from './pages/AdminUsers.jsx';
import UserProtectedRoute from './components/common/UserProtectedRoute.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';

function App() {
  return (
    <ApiProvider baseURL='http://localhost:5002/api'>
      <AppAuthProvider>
        <AppDataProvider>
          <CartProvider>
            <Router>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Layout />}>
                  <Route index element={<HomePage />} />
                  <Route path="login" element={<LoginPage />} />
                  <Route path="cart" element={<CartPage />} />
                  <Route path="product/:id" element={<ProductDetailPage />} />
                  <Route path="categories" element={<CategoriesPage />} />
                  <Route path="categories/:slug" element={<CategoriesPage />} />
                  <Route path="register" element={<RegisterPage />} />
                  <Route path="about" element={<AboutPage />} />
                  <Route path="contact" element={<ContactPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                  <Route element={<UserProtectedRoute />}>
                    <Route path="/profile" element={<ProfilePage />} />
                    {/* aur bhi user routes agar hain */}
                  </Route>
                </Route>
                {/* Admin Routes — Protected */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="settings" element={<div className="p-10 text-2xl font-black uppercase tracking-tighter">Settings Module (Coming Soon)</div>} />
                  </Route>
                </Route>
              </Routes>
            </Router>
          </CartProvider>
        </AppDataProvider>
      </AppAuthProvider>
    </ApiProvider>
  );
}

export default App;
