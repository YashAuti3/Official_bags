import React, { useState } from 'react';
import { Card, Button, Badge, Input } from '../components/common/UI';
import { Trash2, Plus, Minus, CreditCard, ShoppingBag, ArrowRight, X, MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Show } from 'devil-frontend';
import { useAppAuth } from '../context/AuthContext';
import { useAppData } from '../context/DataContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const { createRazorpayOrder, verifyPayment } = useAppData();
  const { user, fetchMyOrders } = useAppAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const defaultStreet = typeof user?.address === 'string' ? user.address : user?.address?.street || '';
  const [shippingAddress, setShippingAddress] = useState({
    street: defaultStreet,
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    pincode: user?.address?.pincode || '',
    phone: user?.phone || '',
  });

  const handleCheckout = async () => {
    if (!user) {
      alert('Please login to continue');
      navigate('/login');
      return;
    }
    if (user.role === 'admin') {
      alert('Admin accounts cannot checkout or make purchases.');
      return;
    }
    setIsModalOpen(true);
  };

  const placeOrder = async () => {
    const { street, city, state, pincode, phone } = shippingAddress;
    if (!street || !city || !state || !pincode || !phone) {
      return alert('Please fill in all shipping details (Street, City, State, Pincode, and Phone).');
    }

    try {
      setLoading(true);
      // 1. Create Razorpay Order
      const { razorpayOrder, razorpayKey } = await createRazorpayOrder();

      if (!razorpayKey) throw new Error('Razorpay key not provided by the server');
      if (!window.Razorpay) throw new Error('Razorpay checkout SDK failed to load');

      const options = {
        key: razorpayKey,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency || 'INR',
        name: 'WebBags Premium',
        description: 'Quality Bags Purchase',
        order_id: razorpayOrder.id,
        handler: async (response) => {
          try {
            // 2. Verify and Place Order
            await verifyPayment({
              shippingAddress: shippingAddress,
              paymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature
            });

            await fetchMyOrders();
            clearCart();
            setIsModalOpen(false);
            alert('Order Placed Successfully! 🎉');
            navigate('/profile');
          } catch {
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone || ''
        },
        notes: {
          customerId: user._id || user.id || '',
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
        theme: { color: '#000000' }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => {
        setLoading(false);
        alert('Payment failed. Please try again.');
      });
      rzp.open();
    } catch (err) {
      console.error('Checkout failed:', err);
      alert(err?.message || 'Payment initialization failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-0 min-h-screen bg-gray-50/50">

      {/* Dark Header */}
      <div className="bg-dark text-white py-10 md:py-20 px-4 md:px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-full bg-primary/20 blur-[100px] translate-x-1/3" />
        <div className="max-w-6xl mx-auto flex flex-col gap-4 relative z-10">
          <span className="text-xs font-black uppercase text-primary tracking-[8px]">Secure Checkout</span>
          <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter italic leading-none">Your Bag</h1>
          <p className="text-gray-500 text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <ShoppingBag size={14} /> {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'} Ready to Pulse
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 md:gap-16">

          {/* ── Cart Items ─────────────────────────────────────── */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {cartItems.length > 0 ? (
              <>
                <div className="flex flex-col gap-4">
                  {cartItems.map(item => (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={`${item._id || item.id}-${item.selectedColor}`}
                      className="group flex flex-col sm:flex-row gap-6 sm:items-center p-6 bg-white rounded-[32px] shadow-sm hover:shadow-2xl hover:shadow-primary/5 border border-gray-100 transition-all duration-500"
                    >
                      {/* ✅ Image */}
                      <div className="w-full sm:w-32 h-44 sm:h-32 bg-gray-50 rounded-[28px] overflow-hidden border border-gray-100 shrink-0 p-4 transition-all group-hover:bg-white group-hover:scale-105">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-contain mix-blend-multiply"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-grow flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="font-black text-dark uppercase tracking-tight text-xl leading-none">{item.title}</h3>
                          {item.selectedColor && (() => {
                            const colorData = item.colors?.find(c => c.name === item.selectedColor);
                            return (
                              <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg px-2 py-1 border border-gray-200">
                                {colorData && (
                                  <span className="w-3 h-3 rounded-full border border-black/10 inline-block shrink-0" style={{ backgroundColor: colorData.hex }}></span>
                                )}
                                <span className="text-[9px] font-black text-dark uppercase tracking-widest leading-none">{item.selectedColor}</span>
                              </div>
                            );
                          })()}
                        </div>
                        <p className="text-xs font-bold text-muted uppercase tracking-widest">{item.category}</p>
                        <div className="flex items-baseline gap-2 mt-4">
                          <p className="text-primary font-black text-2xl tracking-tighter italic">₹{item.price}</p>
                          <span className="text-[10px] font-bold uppercase text-muted tracking-widest">/ unit</span>
                        </div>
                      </div>

                      {/* Quantity Control */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-100">
                        <div className="flex items-center gap-2 bg-gray-50 rounded-2xl p-1.5 border border-gray-100">
                          <button
                            onClick={() => updateQuantity(item._id || item.id, item.quantity - 1, { name: item.selectedColor })}
                            className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm hover:bg-primary hover:text-white transition-all text-dark border border-gray-100"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="font-black text-base w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item._id || item.id, item.quantity + 1, { name: item.selectedColor })}
                            className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm hover:bg-primary hover:text-white transition-all text-dark border border-gray-100"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <div className="flex flex-col items-end">
                           <span className="text-[9px] font-black uppercase text-muted tracking-widest mb-1">Subtotal</span>
                           <span className="font-black text-dark text-2xl tracking-tighter italic">
                             ₹{item.price * item.quantity}
                           </span>
                        </div>

                        <button
                          onClick={() => removeFromCart(item._id || item.id, { name: item.selectedColor })}
                          className="w-12 h-12 flex items-center justify-center bg-red-50 text-danger rounded-2xl hover:bg-danger hover:text-white transition-all border border-red-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <Link
                  to="/categories"
                  className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[4px] text-muted hover:text-primary transition-all w-max mt-4 group"
                >
                  <div className="w-8 h-px bg-muted group-hover:w-12 group-hover:bg-primary transition-all" /> Continue Exploring
                </Link>
              </>
            ) : (
              /* Empty Cart */
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 md:py-32 flex flex-col items-center gap-10 bg-white rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-50">
                <div className="w-32 h-32 rounded-full bg-gray-50 border-4 border-dashed border-gray-200 flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-primary/5 rounded-full animate-ping opacity-20" />
                  <ShoppingBag size={56} className="text-gray-300" />
                </div>
                <div className="text-center flex flex-col gap-3">
                  <p className="text-2xl md:text-3xl font-black uppercase text-dark tracking-tighter italic">Bag is Silently Waiting</p>
                  <p className="text-muted font-black text-[10px] uppercase tracking-[4px]">Initiate your first premium pulse</p>
                </div>
                <Link to="/categories">
                  <Button className="flex items-center gap-4 px-12 py-5 font-black uppercase tracking-widest shadow-2xl shadow-primary/30 group">
                    Find Some Gear <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                  </Button>
                </Link>
              </motion.div>
            )}
          </div>

          {/* ── Order Summary ──────────────────────────────────── */}
          <AnimatePresence>
          {cartItems.length > 0 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-8 lg:sticky lg:top-32 self-start">
              <Card className="flex flex-col gap-10 p-10 shadow-2xl border-none rounded-[40px] bg-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <h2 className="text-2xl font-black uppercase tracking-tighter italic">Summary</h2>

                <div className="flex flex-col gap-6 text-[10px] font-black uppercase tracking-[3px]">
                  <div className="flex justify-between items-center text-muted">
                    <span>Quantity</span>
                    <span className="text-dark bg-gray-100 px-3 py-1 rounded-full">{cartItems.reduce((s, i) => s + i.quantity, 0)} Units</span>
                  </div>
                  <div className="flex justify-between items-center text-muted">
                    <span>Shipping</span>
                    <span className="text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full italic tracking-tighter">Complimentary</span>
                  </div>
                  <div className="h-px bg-gray-100" />
                  <div className="flex justify-between text-dark pt-2">
                    <span className="text-xs">Final Pulse</span>
                    <span className="text-primary text-4xl font-black tracking-tighter italic leading-none">₹{cartTotal}</span>
                  </div>
                </div>

                <Button onClick={handleCheckout} className="w-full py-6 text-xs font-black flex items-center justify-center gap-4 shadow-2xl shadow-primary/30 uppercase tracking-[4px] group">
                  Initiate Checkout <CreditCard size={20} className="group-hover:scale-110 transition-transform" />
                </Button>

                <div className="flex flex-col gap-3">
                  <div className="flex justify-center items-center gap-3">
                    <div className="h-px flex-1 bg-gray-100" />
                    <span className="text-[8px] font-black uppercase text-gray-300 tracking-[5px]">Encrypted</span>
                    <div className="h-px flex-1 bg-gray-100" />
                  </div>
                  <div className="flex justify-center gap-6 opacity-30 grayscale">
                    <span className="font-black italic text-xs">VISA</span>
                    <span className="font-black italic text-xs">MASTER</span>
                    <span className="font-black italic text-xs">UPI</span>
                  </div>
                </div>
              </Card>

              {/* Service Card */}
              <div className="bg-dark p-8 rounded-[32px] text-white flex items-center gap-6">
                 <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                    <MapPin size={24} />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">Fast Delivery</span>
                    <span className="text-sm font-black uppercase tracking-tight">Pan-India Fulfillment</span>
                 </div>
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>

      {/* Checkout Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-dark/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="w-full max-w-xl"
            >
              <Card className="flex flex-col gap-10 p-12 border-none shadow-2xl rounded-[40px] bg-white text-dark overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] -translate-y-1/2 translate-x-1/2" />

                <div className="flex justify-between items-center">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase tracking-[5px] text-primary">Shipping Detail</span>
                    <h2 className="text-4xl font-black uppercase tracking-tighter italic">Checkout</h2>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center hover:bg-dark hover:text-white transition-all border border-gray-200">
                    <X size={24} />
                  </button>
                </div>

                <div className="flex flex-col gap-8">
                  <div className="flex flex-col gap-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2 px-1">
                      <MapPin size={12} className="text-primary" /> Destination Address
                    </label>
                    <div className="flex flex-col gap-3">
                      <input
                        type="text"
                        value={shippingAddress.street}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                        placeholder="Street Address / Landmark"
                        className="w-full px-6 py-4 text-sm font-bold bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-gray-300"
                      />
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                          placeholder="City"
                          className="w-full px-6 py-4 text-sm font-bold bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-gray-300"
                        />
                        <input
                          type="text"
                          value={shippingAddress.state}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                          placeholder="State"
                          className="w-full px-6 py-4 text-sm font-bold bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-gray-300"
                        />
                      </div>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={shippingAddress.pincode}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                          placeholder="Pincode"
                          className="w-full px-6 py-4 text-sm font-bold bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-gray-300"
                        />
                        <input
                          type="text"
                          value={shippingAddress.phone}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                          placeholder="Phone Number"
                          className="w-full px-6 py-4 text-sm font-bold bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-gray-300"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 bg-gray-50 p-8 rounded-[30px] border border-gray-100">
                     <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted">
                        <span>Items Total</span>
                        <span>₹{cartTotal}</span>
                     </div>
                     <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted">
                        <span>GST (Inc.)</span>
                        <span>₹0</span>
                     </div>
                     <div className="h-px bg-gray-200" />
                     <div className="flex justify-between text-xl font-black uppercase tracking-tighter italic">
                        <span>Grand Total</span>
                        <span className="text-primary">₹{cartTotal}</span>
                     </div>
                  </div>

                  <Button
                    onClick={placeOrder}
                    disabled={loading}
                    className="w-full py-6 text-sm font-black uppercase tracking-[5px] shadow-2xl shadow-primary/30 flex items-center justify-center gap-4 group"
                  >
                    {loading ? 'Processing...' : 'Verify & Pay Now'} <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                  </Button>
                </div>

                <p className="text-center text-[9px] font-bold uppercase text-muted tracking-widest">
                   You are paying through a secure financial gateway
                </p>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
