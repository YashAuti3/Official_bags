import React from 'react';
import { Card, Button } from '../common/UI';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ProductCard({ product }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -10 }}
    >
      <Link to={`/product/${product._id || product.id}`} className="group flex flex-col gap-4 md:gap-6">
        <div className="relative aspect-[4/5] bg-gradient-to-br from-white to-gray-100 rounded-[24px] md:rounded-[40px] overflow-hidden border border-gray-100/50 shadow-sm group-hover:shadow-2xl transition-all duration-700 p-2 md:p-4">
          <img 
            src={product.image} 
            alt={product.title} 
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-1000" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          
          <div className="absolute top-4 left-4 md:top-8 md:left-8">
            <span className="inline-block px-4 py-1.5 bg-white/95 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-dark shadow-xl hover:bg-primary hover:text-white transition-colors cursor-default">
              ★ {product.rating}
            </span>
          </div>
          
          <button className="absolute bottom-4 right-4 md:bottom-8 md:right-8 w-10 h-10 md:w-14 md:h-14 bg-primary text-white rounded-full flex items-center justify-center translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 shadow-xl shadow-primary/30 active:scale-90">
             <span className="text-2xl font-black">+</span>
          </button>
        </div>
        
        <div className="flex flex-col gap-1 px-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[3px] text-primary">{product.category}</span>
            <div className="w-1 h-1 rounded-full bg-gray-300" />
            <span className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400">Premium</span>
          </div>
          <h3 className="text-lg md:text-2xl font-black uppercase tracking-tighter leading-tight group-hover:text-primary transition-colors">
            {product.title}
          </h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl md:text-3xl font-black text-dark tracking-tighter italic">₹{product.price}</span>
            <span className="text-xs md:text-sm font-bold text-gray-400 line-through">₹{Math.floor(product.price * 1.5)}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
