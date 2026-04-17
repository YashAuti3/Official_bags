import React, { useState } from 'react';
import { Card, Button, Input, Badge } from '../components/common/UI';
import { Mail, Phone, MapPin, Send, Facebook, Twitter, Instagram, Youtube, CheckCircle, ArrowRight, MessageSquare as MessageSquareIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const contactInfo = [
  { label: "Email Support", value: "vkbagofficial@gmail.com", icon: Mail, desc: "Our team responds within 2 hours" },
  { label: "Phone & WhatsApp", value: "+91 96045 87730", icon: Phone, desc: "Mon-Sat, 9AM to 7PM" },
  { label: "Corporate Office", value: "Ahmednagar, India", icon: MapPin, desc: "Boutique visits by appointment" },
];

export default function ContactPage() {
  const [formState, setFormState] = useState('idle'); // idle, loading, sent

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormState('loading');
    setTimeout(() => setFormState('sent'), 1500);
  };

  return (
    <div className="flex flex-col gap-0 overflow-hidden">
      {/* ── Dark Hero Banner ──────────────────────────────────── */}
      <div className="bg-dark text-white py-12 md:py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 pattern-grid-lg" />
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-6 text-center relative z-10">
          <Badge variant="primary" className="px-6 py-2">Contact Us</Badge>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter  leading-none text-center">
            Let's Start A <br />
            <span style={{ WebkitTextStroke: '1.5px white', color: 'transparent' }}>Conversation</span>
          </h1>
          <p className="max-w-xl text-gray-400 font-medium text-lg leading-relaxed uppercase tracking-tight">
            Whether you have a question about our craftsmanship or need a custom consultation, our team is here to help.
          </p>
          <div className="w-24 h-1.5 bg-primary rounded-full" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-24 w-full flex flex-col gap-24">
        {/* ── Info Cards ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contactInfo.map((info, i) => (
               <Card key={i} className="p-10 flex flex-col items-center text-center gap-6 group hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 bg-white border-none relative overflow-hidden">
                  <div className="absolute -bottom-4 -right-4 text-primary/5 group-hover:text-primary/10 transition-colors">
                     <info.icon size={120} />
                  </div>
                  <div className="w-20 h-20 rounded-[30px] bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/30 group-hover:scale-110 transition-transform duration-500 overflow-hidden relative">
                    <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <info.icon size={32} />
                  </div>
                  <div className="flex flex-col gap-2 relative z-10">
                    <h3 className="text-[10px] font-black uppercase tracking-[4px] text-muted">{info.label}</h3>
                    <p className="text-xl font-black uppercase tracking-tighter  text-dark">{info.value}</p>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-[2px]">{info.desc}</p>
                  </div>
               </Card>
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 items-start">
            {/* ── Contact Form ────────────────────────────────────── */}
            <Card className="lg:col-span-3 p-12 flex flex-col gap-10 shadow-2xl border-none relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-100 rounded-xl text-dark group-hover:bg-primary group-hover:text-white transition-all">
                    <MessageSquareIcon size={24} />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter  text-dark">Send A Message</h2>
                </div>

                {formState === 'sent' ? (
                  <div className="py-20 flex flex-col items-center text-center gap-6">
                     <div className="w-24 h-24 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                        <CheckCircle size={48} />
                     </div>
                     <div className="flex flex-col gap-2">
                        <h3 className="text-2xl font-black uppercase  tracking-tight">Message Received</h3>
                        <p className="text-muted font-medium uppercase text-[10px] tracking-widest">We'll get back to you within a few pulses.</p>
                     </div>
                     <Button variant="outline" onClick={() => setFormState('idle')} className="mt-4 px-8 border-gray-200">Send Another</Button>
                  </div>
                ) : (
                  <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-[3px] text-muted ml-1">Full Name</label>
                        <Input placeholder="Name" required className="bg-gray-50 border-none hover:bg-gray-100 focus:bg-white transition-all py-4" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-[3px] text-muted ml-1">Email Address</label>
                        <Input placeholder="Email" type="email" required className="bg-gray-50 border-none hover:bg-gray-100 focus:bg-white transition-all py-4" />
                    </div>
                    <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-[3px] text-muted ml-1">Topic</label>
                        <Input placeholder="How can we help you today?" required className="bg-gray-50 border-none hover:bg-gray-100 focus:bg-white transition-all py-4" />
                    </div>
                    <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-[3px] text-muted ml-1">Message</label>
                        <textarea
                            className="w-full bg-gray-50 hover:bg-gray-100 focus:bg-white border-none rounded-2xl p-6 min-h-[160px] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-dark text-sm"
                            placeholder="Type your pulse here..."
                            required
                        ></textarea>
                    </div>
                    <Button
                      type="submit"
                      disabled={formState === 'loading'}
                      className="md:w-fit px-12 py-5 flex gap-3 items-center justify-center font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                    >
                      {formState === 'loading' ? 'Sending...' : <><Send size={18} /> Send Pulse</>}
                    </Button>
                  </form>
                )}
            </Card>

            {/* ── Side Info ───────────────────────────────────────── */}
            <div className="lg:col-span-2 flex flex-col gap-8">
               <div className="bg-dark p-12 rounded-[40px] shadow-2xl flex flex-col gap-8 text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2" />
                  <h3 className="text-2xl font-black uppercase tracking-tighter  relative z-10">Social Pulse</h3>
                  <div className="flex flex-col gap-6 relative z-10">
                    {[
                      { icon: Instagram, label: 'Instagram', name: 'vaibhav_bags_' },
                      { icon: Facebook, label: 'Facebook', name: 'webbags.luxury' },
                      { icon: Twitter, label: 'Twitter', name: '@webbags' },
                    ].map(s => (
                       <div key={s.label} className="flex items-center justify-between group/icon cursor-pointer">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/5 rounded-xl text-primary group-hover/icon:bg-primary group-hover/icon:text-white transition-all">
                              <s.icon size={20} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase font-black tracking-widest text-gray-500">{s.label}</span>
                              <span className="text-sm font-bold tracking-tight">{s.name}</span>
                            </div>
                          </div>
                          <ArrowRight size={16} className="text-primary opacity-0 group-hover/icon:opacity-100 group-hover/icon:translate-x-1 transition-all" />
                       </div>
                    ))}
                  </div>
               </div>

               {/* Static Address Card */}
               <div className="bg-primary p-12 rounded-[40px] shadow-2xl flex flex-col gap-6 text-white group hover:-translate-y-2 transition-transform duration-500">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white">
                      <MapPin size={28} />
                    </div>
                    <div className="flex flex-col">
                      <h4 className="text-xl font-black uppercase tracking-tighter ">Ahmednagar Hub</h4>
                      <p className="text-[9px] font-black uppercase tracking-[3px] text-white/60">Corporate Office</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium leading-relaxed  border-l-2 border-white/20 pl-6">
                    Sun Pharma Collage Near Shivalay Park, <br />
                    Near Shivalay Park,MIDC AHILYANAGAR 414111  <br />
                    India
                  </p>
               </div>
            </div>
        </div>
      </div>
    </div>
  );
}
