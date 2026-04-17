import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button, Card, Badge } from '../components/common/UI';
import { Star, Truck, RefreshCw, ShieldCheck, ChevronRight, Minus, Plus, ShoppingBag, Check, Heart, Share2, Award, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAppAuth } from '../context/AuthContext';
import { Show } from 'devil-frontend';
import { useAppData } from '../context/DataContext';
import ProductCard from '../components/product/ProductCard';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { fetchSingleProduct, fetchRelatedProducts } = useAppData();
  const { addToCart } = useCart();
  const { user } = useAppAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState('');
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  // ✅ DIRECT EFFECT — sirf id pe depend
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const res = await fetchSingleProduct(id);
        if (cancelled) return;

        if (res.product) {
          setProduct(res.product);
          setMainImage(res.product.image);
          if (res.product.colors?.length > 0) setSelectedColor(res.product.colors[0]);

          // const related = await fetchRelatedProducts(res.product.category, id);
          // if (cancelled) return;
          // setRelatedProducts(related);
        }
      } catch (err) {
        console.error('Failed to fetch product details:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    window.scrollTo(0, 0);
    return () => { cancelled = true; };
  }, [id]); // ✅ sirf id — bas


  const handleAddToCart = async () => {
    if (!user) {
      alert('Please login to add items to your pulse bag.');
      navigate('/login');
      return;
    }

    try {
      await addToCart(product, quantity, selectedColor);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error('Add to cart failed:', err);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={48} />
    </div>
  );

  if (!product) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <p className="font-black uppercase tracking-widest text-muted text-lg">Product Not Found</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-16 md:gap-24 pb-16 md:pb-32">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12 w-full flex flex-col gap-8 md:gap-12">

        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-muted overflow-x-auto scrollbar-hide">
          <Link to="/" className="hover:text-primary transition-colors whitespace-nowrap">Home</Link>
          <ChevronRight size={12} className="shrink-0" />
          <Link to="/categories" className="hover:text-primary transition-colors whitespace-nowrap">Collections</Link>
          <ChevronRight size={12} className="shrink-0" />
          <span className="text-dark truncate">{product.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-start">

          {/* ── Gallery ─────────────────────────────────────── */}
          <div className="flex flex-col-reverse md:flex-row gap-4 md:gap-8 items-start">
            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-hide w-full md:w-auto">
                {product.images.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setMainImage(img)}
                    className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 cursor-pointer transition-all shrink-0 p-1 bg-white ${mainImage === img
                      ? 'border-primary ring-4 ring-primary/10'
                      : 'border-gray-100 opacity-60 hover:opacity-100 hover:border-gray-300'
                      }`}
                  >
                    <img src={img} alt={`view ${i}`} className="w-full h-full object-contain" />
                  </div>
                ))}
              </div>
            )}

            {/* ✅ Main image — responsive height */}
            <div className="flex-1 rounded-[28px] md:rounded-[40px] overflow-hidden bg-gradient-to-br from-white to-gray-50 border border-gray-100 shadow-2xl relative group h-[300px] sm:h-[380px] md:h-[500px] lg:h-[580px] flex items-center justify-center p-4 md:p-6 w-full">
              <img
                key={mainImage}
                src={mainImage}
                alt={product.title}
                className="w-full h-full object-contain group-hover:scale-105 transition-all duration-700"
              />
              <div className="absolute top-4 left-4 md:top-6 md:left-6">
                <Badge variant="primary">{product.category}</Badge>
              </div>
            </div>
          </div>

          {/* ── Product Info ─────────────────────────────────── */}
          <div className="flex flex-col gap-6 md:gap-8">
            <div className="flex flex-col gap-4">

              {/* ✅ Title row — flex-wrap to prevent overflow */}
              <div className="flex flex-wrap justify-between items-start gap-4">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tighter leading-none flex-1 min-w-[200px]">
                  {product.title}
                </h1>
                <div className="flex items-center gap-2 md:gap-3 shrink-0">
                  {/* Share */}
                  <button
                    onClick={handleShare}
                    title="Copy link"
                    className={`p-2.5 md:p-3 rounded-xl border transition-all duration-300 ${copied ? 'border-primary bg-primary text-white' : 'border-gray-200 hover:border-primary hover:text-primary'
                      }`}
                  >
                    {copied ? <Check size={16} /> : <Share2 size={16} />}
                  </button>
                  {/* Wishlist */}
                  <button
                    onClick={() => setWishlisted(w => !w)}
                    className={`p-2.5 md:p-3 rounded-xl border transition-all duration-300 ${wishlisted ? 'border-red-200 bg-red-50 text-red-500' : 'border-gray-200 hover:border-red-200 hover:text-red-400'
                      }`}
                  >
                    <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
                  </button>
                  {/* Rating */}
                  <div className="flex items-center gap-1 bg-primary text-white px-2.5 py-2 rounded-xl text-sm font-bold shrink-0">
                    {product.rating} <Star size={13} fill="currentColor" />
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 flex-wrap">
                <p className="text-3xl md:text-4xl font-black text-primary">₹{product.price}</p>
                <p className="text-base md:text-lg font-bold text-gray-400 line-through">₹{Math.floor(product.price * 1.4)}</p>
                <Badge variant="success">Save {Math.round((1 - 1 / 1.4) * 100)}%</Badge>
              </div>
            </div>

            <p className="text-muted leading-relaxed font-medium text-base md:text-lg">{product.description}</p>

            {/* Color Selection */}
            {product.colors && (
              <div className="flex flex-col gap-3">
                <h3 className="text-[10px] uppercase font-black tracking-widest text-muted">
                  Color: <span className="text-dark">{selectedColor?.name}</span>
                </h3>
                <div className="flex gap-3 flex-wrap">
                  {product.colors.map((color, i) => (
                    <button
                      key={i}
                      onClick={() => { setSelectedColor(color); if (color.image) setMainImage(color.image); }}
                      className={`flex items-center gap-2 p-1 pr-4 border-2 rounded-2xl transition-all duration-200 ${selectedColor?.name === color.name
                        ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                        : 'border-gray-100 hover:border-gray-300'
                        }`}
                    >
                      <div className="w-7 h-7 rounded-xl border border-black/10" style={{ backgroundColor: color.hex }} />
                      <span className="text-[10px] font-black uppercase tracking-tight">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ✅ Quantity + CTA — flex-wrap on mobile */}
            <div className="flex flex-wrap gap-4 items-center pt-2">
              <div className="flex items-center bg-gray-100 rounded-2xl p-1 border-2 border-gray-100 shrink-0">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2.5 md:p-3 hover:text-primary transition-colors rounded-xl"
                >
                  <Minus size={17} />
                </button>
                <span className="w-10 text-center font-black text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2.5 md:p-3 hover:text-primary transition-colors rounded-xl"
                >
                  <Plus size={17} />
                </button>
              </div>
              <Button
                onClick={handleAddToCart}
                className={`flex-1 min-w-[160px] py-3 md:py-4 uppercase font-black tracking-widest text-sm shadow-xl flex items-center justify-center gap-3 transition-all duration-300 ${added ? 'bg-green-500 hover:opacity-100 shadow-green-500/30' : 'shadow-primary/20'
                  }`}
              >
                {added ? <><Check size={18} /> Added to Bag!</> : <><ShoppingBag size={18} /> Add To Bag</>}
              </Button>
            </div>

            <hr className="border-gray-100" />

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 md:gap-4">
              {[
                { icon: Truck, title: 'Fast Delivery', sub: '24-48 Hours' },
                { icon: RefreshCw, title: 'Easy Returns', sub: '7 Day Period' },
                { icon: ShieldCheck, title: '100% Genuine', sub: 'Quality Assured' },
              ].map(({ icon: FeatureIcon, title, sub }) => (
                <div
                  key={title}
                  className="flex flex-col items-center gap-2 p-3 md:p-4 bg-gray-50 rounded-2xl text-center border border-gray-100 hover:border-primary/20 transition-colors"
                >
                  <FeatureIcon className="text-primary" size={18} />
                  {/* ✅ Slightly larger text on mobile */}
                  <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-tighter leading-tight">{title}</h4>
                  <p className="text-[8px] md:text-[9px] font-medium text-muted">{sub}</p>
                </div>
              ))}
            </div>

            {/* Features */}
            {product.features?.length > 0 && (
              <Card className="flex flex-col gap-4 p-6 md:p-8 bg-gray-50/50 border border-gray-100">
                <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <Award size={14} className="text-primary" /> Key Features
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                  {product.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs font-medium text-muted">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* ── Related Products ──────────────────────────────────── */}
      {relatedProducts.length > 0 && (
        <section className="bg-bg py-10 md:py-24">
          <div className="max-w-6xl mx-auto px-4 md:px-6 flex flex-col gap-10 md:gap-16">
            <div className="flex items-end justify-between gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-black uppercase text-primary tracking-[5px]">More Like This</span>
                <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter italic">You May Also Like</h2>
              </div>
              <Link to="/categories">
                <Button variant="outline" className="flex items-center gap-2 px-5 md:px-8 py-3 md:py-4 text-xs font-black uppercase tracking-widest hover:bg-dark hover:text-white transition-all whitespace-nowrap">
                  View All <ChevronRight size={16} />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-10">
              {relatedProducts.map(p => <ProductCard key={p._id || p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
