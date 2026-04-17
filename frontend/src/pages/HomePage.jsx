import React from 'react';
import { Button, Card } from '../components/common/UI';
import ProductCard from '../components/product/ProductCard';
import { testimonials } from '../data/mock';
import { ArrowRight, Star, Award, Zap, ShieldCheck, Mail, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Show } from 'devil-frontend';
import { useAppData } from '../context/DataContext';

const MARQUEE_SINGLE = 'NEW ARRIVALS 2026 ✦ LIMITED EDITION ✦ HANDCRAFTED LUXURY ✦ PREMIUM LEATHER ✦ ';
const MARQUEE_TEXT = Array(8).fill(MARQUEE_SINGLE).join('');


export default function HomePage() {
  const { products, loading } = useAppData();

  const recommendedProducts = React.useMemo(() => {
    // Sort by rating (proxy for popular items)
    const sorted = [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    
    // If we have products with ratings, take top 4
    if (sorted.length > 0 && (sorted[0].rating > 0)) {
       return sorted.slice(0, 4);
    }
    
    // Otherwise, return first 4 for stability
    return products.slice(0, 4);
  }, [products]);

  const filteredSellers = React.useMemo(() => products.slice(0, 6), [products]);

  return (
    <div className="flex flex-col gap-0 pb-0">

  {/* ── Hero ─────────────────────────────────────────────── */}
<section className="relative flex items-center bg-dark text-white overflow-hidden pt-24">

  {/* Blobs */}
  <div className="hidden md:block absolute top-0 right-0 w-[500px] h-[500px] bg-primary/15 blur-[160px] rounded-full -translate-y-1/3 translate-x-1/4 animate-pulse pointer-events-none" />
  <div className="hidden md:block absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/8 blur-[120px] rounded-full translate-y-1/3 -translate-x-1/4 pointer-events-none" />

  {/* Content */}
  <div className="max-w-7xl mx-auto px-6 w-full z-10 grid grid-cols-1 lg:grid-cols-2 items-center gap-6 lg:gap-16 py-16 lg:py-24 min-h-[90vh]">

    {/* ✅ LEFT TEXT */}
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      className="flex flex-col gap-5"
    >
      {/* Badge */}
      <div className="flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full w-max border border-white/10">
        <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
        <span className="text-[10px] font-black uppercase tracking-[3px] text-gray-300">
          New Collection 2026
        </span>
      </div>

      {/* Heading */}
      <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[88px] font-black leading-[0.9] tracking-tighter uppercase ">
        Timeless <br />
        <span style={{ WebkitTextStroke: '1.5px white', color: 'transparent' }}>
          Craftsmanship
        </span>
      </h1>

      {/* Description */}
      <p className="text-sm md:text-lg text-gray-400 font-medium max-w-md leading-relaxed">
        Experience the pinnacle of luxury with our handcrafted signature collection.
      </p>

      {/* Buttons */}
      <div className="flex gap-3 mt-2">
        <Link to="/categories">
          <Button className="px-6 py-3 text-sm font-semibold uppercase rounded-lg bg-primary text-white hover:scale-105 transition-all duration-300">
            Explore Now
          </Button>
        </Link>

        <Link to="/about">
          <Button className="px-6 py-3 text-sm font-semibold uppercase border border-white/30 bg-transparent text-white hover:bg-white hover:text-dark transition-all duration-300">
            Our Story
          </Button>
        </Link>
      </div>
    </motion.div>

  </div>

  {/* ✅ RIGHT IMAGE (PERFECT FIXED POSITION) */}
  <motion.div
    initial={{ opacity: 0, x: 100 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.9 }}
    className="block lg:block absolute right-0 top-28 pr-4 lg:pr-10"
  >
    <img
      src="/images/home.png"
      alt="Hero Bag"
      className="w-[680px] max-h-[520px] object-contain animate-float drop-shadow-[0_40px_60px_rgba(0,0,0,0.8)]"
    />
  </motion.div>

</section>


      {/* ── Marquee Banner ───────────────────────────────────── */}
      <div className="bg-primary py-4 overflow-hidden flex">
        <div className="animate-marquee whitespace-nowrap flex shrink-0">
          <span className="text-white text-[10px] font-black uppercase tracking-[4px]">{MARQUEE_TEXT}</span>
        </div>
      </div>

      {/* ── Highly Recommended ───────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 w-full flex flex-col gap-8 md:gap-16 py-12 md:py-28">
        <div className="flex flex-col gap-4 items-center text-center">
          <span className="text-xs font-black uppercase text-primary tracking-[5px]">Curated For You</span>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter ">Highly Recommended</h2>
          <div className="w-32 h-1.5 bg-primary rounded-full mt-2" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          <Show when={!loading} fallback={
            <div className="col-span-full flex justify-center py-20">
              <Loader2 className="animate-spin text-primary" size={40} />
            </div>
          }>
            {recommendedProducts.map((product) => (
              <Link to={`/product/${product._id || product.id}`} key={product._id || product.id} className="group relative">
                <Card className="p-0 overflow-hidden border-none shadow-none group-hover:translate-y-[-8px] md:group-hover:translate-y-[-12px] transition-all duration-500 bg-transparent">
                  <div className="relative aspect-[4/5] bg-gradient-to-br from-white to-gray-100 rounded-[20px] md:rounded-[28px] overflow-hidden mb-3 border border-gray-100/50 p-3 shadow-sm">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-contain group-hover:scale-110 transition-all duration-700"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 bg-dark/90 text-white text-[9px] font-black uppercase tracking-widest rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
                      Recommended
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 px-1">
                    <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-tighter text-primary">
                      <Award size={9} /> <span className="truncate">{product.category}</span>
                    </div>
                    <h3 className="text-xs md:text-lg font-black uppercase tracking-tight leading-tight group-hover:text-primary transition-colors line-clamp-2">
                      {product.title}
                    </h3>
                    <span className="text-sm md:text-xl font-black text-dark tracking-tighter mt-0.5">₹{product.price}</span>
                  </div>
                </Card>
              </Link>
            ))}
          </Show>
        </div>
      </section>

      {/* ── Features Bar ─────────────────────────────────────── */}
      <section className="bg-dark py-10 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-12">
          {[
            { icon: Zap, title: 'Lightning Fast Delivery', sub: 'Global shipping in under 5 days' },
            { icon: ShieldCheck, title: 'Life Time Warranty', sub: 'Our quality speaks for itself' },
            { icon: Award, title: 'Certified Luxury', sub: 'Authentic handcrafted leather' },
          ].map(({ icon: FeatureIcon, title, sub }, i) => (
            <div
              key={title}
              className={`flex items-center gap-5 group py-5 md:py-0 ${i !== 2 ? 'border-b md:border-b-0 border-white/5' : ''
                }`}
            >
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shrink-0">
                <FeatureIcon size={24} />
              </div>
              <div>
                <h4 className="text-white font-black uppercase tracking-wider text-xs md:text-sm">{title}</h4>
                <p className="text-gray-500 text-[10px] font-medium uppercase mt-1">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Best Selling (Tabbed) ─────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 w-full flex flex-col gap-8 md:gap-14 py-12 md:py-28">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-2 border-gray-100 pb-6 md:pb-10">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-black uppercase text-primary tracking-[5px]">Most Wanted</span>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter ">Best Selling</h2>
          </div>
          <Link to="/categories">
            <Button variant="outline" className="flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-widest hover:bg-dark hover:text-white transition-all">
              See All <ArrowRight size={15} />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          <Show when={!loading} fallback={
            <div className="col-span-full flex justify-center py-20">
              <Loader2 className="animate-spin text-primary" size={40} />
            </div>
          }>
            {filteredSellers.length > 0
              ? filteredSellers.map(product => <ProductCard key={product._id || product.id} product={product} />)
              : (
                <div className="col-span-full py-16 text-center text-muted font-black uppercase tracking-widest">
                  No products in this category
                </div>
              )
            }
          </Show>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────── */}
      <section className="bg-bg py-14 md:py-28">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col gap-10 md:gap-16">
          <div className="flex flex-col gap-4 items-center text-center">
            <span className="text-xs font-black uppercase text-primary tracking-[5px]">Testimonials</span>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter ">Voice Of Quality</h2>
            <div className="w-32 h-1.5 bg-primary rounded-full mt-2" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
            {testimonials.map(testimonial => (
              <Card
                key={testimonial.id}
                className="flex flex-col gap-6 p-7 md:p-10 bg-white border-none shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 relative overflow-hidden group"
              >
                <div className="absolute -top-4 -right-4 text-[100px] font-black text-gray-50 leading-none select-none group-hover:text-primary/5 transition-colors">"</div>
                <div className="flex gap-1 text-primary">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                <p className="text-dark/80  text-base leading-relaxed font-serif relative z-10">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-4 mt-auto relative z-10">
                  <div className="w-11 h-11 rounded-2xl overflow-hidden border-2 border-primary/20 p-1 group-hover:border-primary transition-colors shrink-0">
                    <img src={testimonial.image} alt={testimonial.name} className="w-full h-full object-cover rounded-xl" />
                  </div>
                  <div>
                    <h4 className="font-black text-dark uppercase tracking-tight text-sm leading-tight">{testimonial.name}</h4>
                    <p className="text-[9px] font-black text-primary uppercase tracking-[2px] mt-0.5">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Newsletter Section ────────────────────────────────── */}
      <section className="bg-dark py-16 md:py-28 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-2xl mx-auto px-4 md:px-6 flex flex-col items-center gap-7 md:gap-10 text-center relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
            <Mail size={26} />
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-xs font-black uppercase text-primary tracking-[5px]">Stay in the Loop</span>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter  text-white">
              Get Exclusive <br /> Drops First
            </h2>
            <p className="text-gray-400 font-medium text-sm md:text-base max-w-md mx-auto">
              Subscribe for early access to new collections, member-only discounts, and artisan stories.
            </p>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col sm:flex-row gap-3 w-full"
          >
            <input
              type="email"
              placeholder="Enter your email address..."
              className="flex-1 bg-white/5 border border-white/10 text-white placeholder:text-gray-500 rounded-xl px-5 py-4 focus:outline-none focus:border-primary transition-colors font-medium text-sm"
            />
            <Button className="px-8 py-4 font-black uppercase tracking-widest shadow-xl shadow-primary/30 whitespace-nowrap">
              Subscribe
            </Button>
          </form>
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </section>

    </div>
  );
}
