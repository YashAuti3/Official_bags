import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-container text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-16">

          {/* About */}
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter ">
              WEB<span className="text-primary">BAGS</span>
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Premium quality handcrafted bags for the modern lifestyle. Experience the perfect blend of durability and elegance.
            </p>
            <div className="flex gap-4">




<div className="flex items-center gap-3">
  
  {/* Instagram */}
  <a 
    href="https://www.instagram.com/vaibhav_bags_?igsh=dHZsaW93Mm51NHFh&utm_source=qr" 
    target="_blank" 
    rel="noopener noreferrer"
  >
    <Instagram 
      size={20} 
      className="hover:text-pink-500 cursor-pointer transition-colors" 
    />
  </a>

  {/* WhatsApp */}
  <a 
    href="https://wa.me/919604587730" 
    target="_blank" 
    rel="noopener noreferrer"
  >
    <FaWhatsapp 
      size={20} 
      className="text-green-500 hover:text-green-600 cursor-pointer transition-colors" 
    />
  </a>

</div>
</div>
          </div>

          {/* Explore */}
          <div className="flex flex-col gap-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-primary">Explore</h4>
            <ul className="flex flex-col gap-3 text-sm text-gray-400">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/categories" className="hover:text-white transition-colors">Categories</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="flex flex-col gap-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-primary">Support</h4>
            <ul className="flex flex-col gap-3 text-sm text-gray-400">
              <li><Link to="/faq" className="hover:text-white transition-colors">FAQs</Link></li>
              <li><Link to="/shipping" className="hover:text-white transition-colors">Shipping & Returns</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-primary">Contact Us</h4>
            <div className="text-sm text-gray-400 flex flex-col gap-3">
              <p>Email: <span className="text-white">vkbagofficial@gmail.com</span></p>
              <p>Phone: <span className="text-white">9604587730</span></p>
              <p>Address: <span className="text-white">Sun Pharma Collage Near Shivalay Park, MIDC AHILYANAGAR</span></p>
            </div>
          </div>
        </div>

        {/* ✅ Fixed copyright — added px-0, proper border margin */}
        <div className="mt-12 md:mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
         <p className="text-[10px] uppercase tracking-wide text-gray-500 text-center">
  © 2026 WEBBAGS. All Rights Reserved. |{" "}
  <a
    href="https://www.linkedin.com/in/thinkpositive3/"
    target="_blank"
    rel="noopener noreferrer"
    className="hover:underline hover:text-white transition"
  >
    Developed by Yash Auti
  </a>
</p>
          <p className="text-[10px] uppercase tracking-[3px] text-gray-600">
            Made with ❤️ in India
          </p>
        </div>
      </div>
    </footer>
  );
}