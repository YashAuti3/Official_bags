import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';
import { Button, Skeleton } from '../components/common/UI';
import {
  ChevronRight,
  SlidersHorizontal,
  ChevronDown,
  X,
  Loader2
} from 'lucide-react';
import { useAppData } from '../context/DataContext';
import { useApi } from 'devil-frontend';

const SORT_OPTIONS = [
  { label: 'Default', value: '-createdAt' },
  { label: 'Price: Low → High', value: 'price' },
  { label: 'Price: High → Low', value: '-price' },
  { label: 'Top Rated', value: '-rating' }
];

export default function CategoriesPage() {
  const { products, categories, setProducts, dataInitialized, page, setPage, hasMore, setHasMore } = useAppData();
  const { get } = useApi();
  const [searchParams, setSearchParams] = useSearchParams();

  const [sortBy, setSortBy] = useState('-createdAt');
  const [sortOpen, setSortOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const selectedCategory = searchParams.get('category');

  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Track first render so we don't reset on mount
  const isFirstRender = useRef(true);

  // Reset products + page only when user actually changes filter/sort (not on mount)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // setProducts([]);
    setPage(1);
    setHasMore(true);
  }, [selectedCategory, sortBy]);

  useEffect(() => {
    if (!dataInitialized) return;

    // On initial mount with no active filter, DataContext data is enough — skip API call
    if (page === 1 && !selectedCategory && sortBy === '-createdAt' && products.length > 0) return;

    let cancelled = false;

    const fetchPage = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedCategory) params.set('category', selectedCategory);
        params.set('sort', sortBy);
        params.set('page', page.toString());
        params.set('limit', '10');

        const res = await get(`/products?${params.toString()}`);

        const newData =
          res?.data && Array.isArray(res.data)
            ? res.data
            : Array.isArray(res)
              ? res
              : [];

        const totalCount =
          res?.pagination?.total ??
          res?.total ??
          (Array.isArray(res) ? res.length : 0);

        if (cancelled) return;

        setTotal(totalCount);
        setHasMore((res.pagination.page) < (res.pagination.totalPages));
        setProducts(prev =>
          page === 1 ? newData : [...prev, ...newData]
        );
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPage();
    return () => { cancelled = true; };
  }, [page, selectedCategory, sortBy, dataInitialized]);


  const handleCategoryClick = categoryName => {
    setSearchParams({ category: categoryName });
    setIsFilterDrawerOpen(false);
  };

  const visibleCount = products.length || total;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* ── Dark Hero Banner ── */}
      <div className="bg-dark text-white py-12 md:py-16 px-6">
        <div className="max-w-6xl mx-auto flex flex-col gap-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide font-bold tracking-widest text-gray-500">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight size={12} />
            <span className="text-gray-400">Collections</span>
            {selectedCategory && (
              <>
                <ChevronRight size={12} />
                <span className="text-primary">{selectedCategory}</span>
              </>
            )}
          </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter ">
            {selectedCategory || 'Our Collections'}
          </h1>
          <p className="text-gray-500 font-medium uppercase tracking-widest text-xs">
            {visibleCount} Products Available
          </p>
        </div>
      </div>

      {/* ── Desktop Filter Bar ── */}
      <div className="sticky top-20 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm hidden md:block">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-6">
          <div className="flex-1 flex items-center gap-3 overflow-x-auto scrollbar-hide">
            {categories.map((catName, index) => {
              // const isActive = catName === 'All' ? !selectedCategory : selectedCategory === catName;
              const isActive = selectedCategory === catName;
              return (
                <button
                  key={index}
                  onClick={() => handleCategoryClick(catName)}
                  className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 border-2 ${isActive
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                    : 'border-gray-200 text-muted hover:border-primary hover:text-primary'
                    }`}
                >
                  {catName}
                </button>
              );
            })}
          </div>

          <div className="shrink-0 relative">
            <button
              onClick={() => setSortOpen(o => !o)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-gray-200 text-[10px] font-black uppercase tracking-widest text-muted hover:border-dark hover:text-dark transition-all"
            >
              Sort{' '}
              <ChevronDown size={14} className={`transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[60] min-w-[200px]">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                    className={`w-full px-6 py-3 text-left text-[10px] font-black uppercase tracking-widest transition-colors ${sortBy === opt.value
                      ? 'bg-primary text-white'
                      : 'text-muted hover:bg-gray-50 hover:text-dark'
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile Filter Drawer ── */}
      <div className={`fixed inset-0 z-[100] transition-opacity duration-300 ${isFilterDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-dark/60 backdrop-blur-sm" onClick={() => setIsFilterDrawerOpen(false)} />
        <div className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-[40px] p-8 transition-transform duration-500 transform ${isFilterDrawerOpen ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black uppercase tracking-tighter ">Refine Pulse</h3>
            <button onClick={() => setIsFilterDrawerOpen(false)} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted">Categories</span>
              <div className="flex flex-wrap gap-2">
                {categories.map((catName, index) => {
                  const isActive = selectedCategory === catName;
                  return (
                    <button
                      key={index}
                      onClick={() => handleCategoryClick(catName)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border-2 ${isActive ? 'bg-primary text-white border-primary' : 'border-gray-100 text-muted'
                        }`}
                    >
                      {catName}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-4 mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted">Sort By</span>
              <div className="grid grid-cols-2 gap-2">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setSortBy(opt.value); setIsFilterDrawerOpen(false); }}
                    className={`px-4 py-4 rounded-xl text-[10px] font-black uppercase text-left border-2 ${sortBy === opt.value ? 'bg-primary/5 text-primary border-primary' : 'border-gray-100 text-muted'
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="max-w-6xl mx-auto px-6 py-8 md:py-12 w-full">
        <div className="md:hidden flex justify-between items-center mb-8">
          <Button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="flex items-center gap-2 px-6 py-3 text-[10px] font-black"
          >
            <SlidersHorizontal size={14} /> FILTER & SORT
          </Button>
          <span className="text-[10px] font-black text-muted uppercase tracking-widest">
            {visibleCount} ITEMS
          </span>
        </div>

        {products.length === 0 && loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col gap-4">
                <Skeleton className="aspect-square w-full rounded-[40px]" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map(p => (
                <div key={p._id || p.id}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>

            {hasMore && !loading && (
              <div className="flex justify-center mt-10">
                <Button
                  onClick={() => setPage(prev => prev + 1)}
                  className="px-8 py-3 text-[10px] font-black uppercase tracking-widest"
                >
                  Load More
                </Button>
              </div>
            )}
            {loading && (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-primary" size={32} />
              </div>
            )}
          </>
        ) : (
          <div className="py-24 text-center flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
              <SlidersHorizontal size={40} />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">No products found</h2>
            <p className="text-muted font-medium uppercase tracking-widest text-xs">
              Try clearing your filters to see all designs.
            </p>
            <Button variant="outline" onClick={() => setSearchParams({})}>
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
