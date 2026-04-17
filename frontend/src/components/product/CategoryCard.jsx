import React from 'react';
import { cn } from '../../utils/cn';
import { Link } from 'react-router-dom';

/**
 * CategoryCard
 * - Default: wraps in Link to navigate to the category page
 * - isFilter: renders as a plain div (parent handles click/filter logic)
 */
export default function CategoryCard({ category, className, isFilter = false }) {
  const inner = (
    <div className={cn('group relative h-48 rounded-2xl overflow-hidden shadow-xl transition-all duration-300', className)}>
      <img
        src={category.image}
        alt={category.name}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/40 to-transparent p-6 flex flex-col justify-end gap-1">
        <h3 className="text-xl font-black text-white uppercase tracking-tighter leading-none">
          {category.name}
        </h3>
        <p className="text-[10px] font-bold text-primary tracking-widest uppercase">
          {category.count} Items
        </p>
      </div>
    </div>
  );

  if (isFilter) return inner;

  return (
    <Link to={`/categories/${category.slug}`} className="block cursor-pointer">
      {inner}
    </Link>
  );
}
