import React from 'react';
import { Card, Button } from '../components/common/UI';
import { Award, ShieldCheck, Heart, Users, ArrowRight, Target, Clock, Zap, Shield, Sparkles, HandMetal, Globe } from 'lucide-react';

const values = [
  { title: "Quality First", description: "Every bag is crafted with the finest leather and hand-finished precision.", icon: Award },
  { title: "True Craft", description: "Hand-stitched by artisans with decades of experience in the heart of the city.", icon: Heart },
  { title: "Customer Care", description: "We believe in building lasting relationships with our community of users.", icon: Users },
  { title: "Durability", description: "Designed to witness every chapter of your journey, from office to travel.", icon: ShieldCheck },
];

const timeline = [
  { year: "2020", title: "The Spark", desc: "Started as a small workshop with just 2 artisans and a single vision." },
  { year: "2022", title: "National Reach", desc: "Expanded across India, reaching 5,000 satisfied luxury enthusiasts." },
  { year: "2024", title: "The Signature", desc: "Launched our first signature collection that defined the brand's aesthetic." },
  { year: "2026", title: "Going Global", desc: "Opening our first international boutiques in London and Dubai." },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-0 overflow-hidden">
      {/* ── Dark Hero Section ────────────────────────────────── */}
      <section className="relative bg-dark text-white py-16 md:py-32 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-3">
              <span className="w-12 h-1.5 bg-primary rounded-full" />
              <span className="text-xs font-black uppercase tracking-[5px] text-gray-500">About Webbags</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] ">
              Legacy of <br />
              <span style={{ WebkitTextStroke: '1.5px white', color: 'transparent' }}>Modern</span> <br />
              Excellence
            </h1>
            <p className="text-xl text-gray-400 font-medium max-w-lg leading-relaxed">
              Founded in 2026, Webbags is more than just a brand; it's a testament to the enduring power of traditional craftsmanship meeting cutting-edge design.
            </p>
            <div className="flex gap-4 pt-4">
              <Button className="px-10 py-5 text-sm font-black uppercase tracking-widest shadow-2xl shadow-primary/30">View Journey</Button>
              <Button variant="outline" className="px-10 py-5 text-sm font-black uppercase tracking-widest border-white/20 text-white hover:bg-white hover:text-dark">Our Process</Button>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[60px] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-8 border-white/5 relative group">
              <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <img
                src="/images/about.png"
                alt="Our Workshop"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
              />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-[40px] shadow-2xl flex items-center gap-6">
               <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl">
                 <Target size={32} />
               </div>
               <div className="flex flex-col">
                 <span className="text-xs font-black uppercase text-primary tracking-widest">Premium Quality</span>
                 <span className="text-lg font-black uppercase  text-dark">Guaranteed</span>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Strip ───────────────────────────────────────── */}
      <section className="bg-primary py-12 overflow-hidden flex">
        <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-2 md:grid-cols-4 gap-12">
          {[
            { label: 'Happy Clients', val: '10K+' },
            { label: 'Craft Artisans', val: '50+' },
            { label: 'Global Hubs', val: '12' },
            { label: 'Unique Designs', val: '200+' },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center md:items-start border-l-2 border-white/20 pl-8 gap-1">
              <h4 className="text-4xl font-black text-white  tracking-tighter">{s.val}</h4>
              <p className="text-[10px] font-black uppercase tracking-[3px] text-white/60">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Values Section ───────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-32 flex flex-col gap-20">
        <div className="flex flex-col gap-4 items-center text-center">
          <span className="text-xs font-black uppercase text-primary tracking-[5px]">The Foundation</span>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter  text-dark">Our Core Values</h2>
          <div className="w-32 h-1.5 bg-primary rounded-full mt-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((v, i) => (
            <Card key={i} className="group p-10 flex flex-col gap-8 bg-white border-none shadow-xl hover:shadow-2xl transition-all hover:-translate-y-3 relative overflow-hidden">
              <div className="absolute -top-4 -right-4 text-8xl font-black text-gray-50 group-hover:text-primary/5 transition-colors leading-none select-none">0{i+1}</div>
              <div className="p-4 bg-primary/10 rounded-2xl text-primary w-max group-hover:bg-primary group-hover:text-white transition-all duration-500 relative z-10">
                <v.icon size={28} />
              </div>
              <div className="flex flex-col gap-3 relative z-10">
                <h3 className="text-xl font-black uppercase tracking-tight  group-hover:text-primary transition-colors">{v.title}</h3>
                <p className="text-muted font-medium leading-relaxed uppercase text-[10px] tracking-widest">{v.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Brand Timeline ────────────────────────────────────── */}
      <section className="bg-gray-50 py-32">
        <div className="max-w-7xl mx-auto px-6 flex flex-col gap-20">
          <div className="flex flex-col gap-4 text-left">
            <span className="text-xs font-black uppercase text-primary tracking-[5px]">History</span>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter  text-dark">Evolution of Craft</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative">
             {/* Line */}
             <div className="hidden md:block absolute top-[60px] left-0 right-0 h-1 bg-gray-200" />

             {timeline.map((item, i) => (
               <div key={i} className="flex flex-col gap-6 relative z-10 group">
                  <div className="flex flex-col gap-4">
                    <div className="w-14 h-14 rounded-full bg-white border-4 border-primary shadow-xl flex items-center justify-center text-primary font-black group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      <Clock size={24} />
                    </div>
                    <span className="text-3xl font-black  text-primary">{item.year}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h4 className="text-lg font-black uppercase tracking-tight ">{item.title}</h4>
                    <p className="text-xs font-medium text-muted leading-relaxed uppercase tracking-widest">{item.desc}</p>
                  </div>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* ── Mission Dark Section ──────────────────────────────── */}
      <section className="py-24 px-6">
         <Card className="max-w-7xl mx-auto bg-dark p-0 overflow-hidden shadow-2xl relative border-none">
            <div className="absolute top-0 right-0 w-[400px] h-full bg-primary/10 blur-[100px] rounded-full translate-x-1/2" />
            <div className="flex flex-col md:flex-row items-stretch">
               <div className="md:w-1/2 p-16 flex flex-col gap-10 relative z-10">
                  <div className="flex flex-col gap-4">
                    <span className="text-xs font-black uppercase text-primary tracking-[5px]">Our Mission</span>
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter  text-white">Empowering <br /> Everyday <br /> Excellence</h2>
                  </div>
                  <p className="text-xl text-gray-400 font-medium leading-relaxed">
                    To create accessories that empower individuals to express their unique identity while maintaining the highest standards of ethics and quality. We aim to be a global leader in sustainable luxury leather goods.
                  </p>
                  <Button className="w-max px-12 py-5 text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/30 mt-4 group">
                    Join Our Journey <ArrowRight size={20} className="ml-2 group-hover:translate-x-2 transition-transform" />
                  </Button>
               </div>
               <div className="hidden md:block md:w-1/2 bg-primary/5 p-12 relative overflow-hidden">
                  <div className="grid grid-cols-2 gap-8 h-full">
                     <div className="bg-white/5 rounded-[40px] border border-white/5 p-8 flex flex-col justify-end gap-3 group hover:bg-white/10 transition-all">
                        <Zap size={32} className="text-primary" />
                        <h4 className="text-white font-black ">Innovative Spirit</h4>
                        <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Always Pushing Limits</p>
                     </div>
                     <div className="bg-white/5 rounded-[40px] border border-white/10 p-8 flex flex-col justify-end gap-3 translate-y-8 group hover:bg-white/10 transition-all">
                        <Award size={32} className="text-primary" />
                        <h4 className="text-white font-black ">Artisan Focus</h4>
                        <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Craft Over Commerce</p>
                     </div>
                  </div>
               </div>
            </div>
         </Card>
      </section>

    </div>
  );
}
