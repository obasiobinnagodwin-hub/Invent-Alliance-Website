'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

const slides = [
  {
    title: 'Technology & Digital Solutions',
    desc: 'Modern IT infrastructure, cybersecurity, and scalable digital systems.',
    image: '/images/hero/tech.jpg',
    link: '/products-services',
  },
  {
    title: 'Property Development',
    desc: 'Premium residential and commercial property solutions.',
    image: '/images/hero/real-estate.jpg',
    link: 'https://properties.inventallianceco.com/',
  },
  {
    title: 'High Tech Warehousing & Logistics',
    desc: 'Smart warehousing, storage, and distribution systems.',
    image: '/images/hero/logistics.jpg',
    link: 'https://logistics.inventallianceco.com/',
  },
  {
    title: 'Power & Energy Solutions',
    desc: 'Reliable and efficient power systems for modern needs.',
    image: '/images/hero/power.jpg',
    link: 'https://power.inventallianceco.com/',
  },
  {
    title: 'Business Process Outsourcing',
    desc: 'Telemarketing, lead generation, and customer engagement.',
    image: '/images/hero/bpo.jpg',
    link: 'https://bpo.inventallianceco.com/',
  },
  {
    title: 'Bakery Consultancy',
    desc: 'From recipes to full bakery business development.',
    image: '/images/hero/bakery.jpg',
    link: 'https://ovenfreshng.com/',
  },
  {
    title: 'iWorkZone Workspace',
    desc: 'Fully equipped modern workspaces with 24/7 access.',
    image: '/images/hero/workspace.jpg',
    link: 'https://iworkzone.ng/',
  },
  {
    title: 'Shortlet Apartments',
    desc: 'Luxury short stays with global hospitality standards.',
    image: '/images/hero/shortlet.jpg',
    link: 'https://shortlet.inventallianceco.com/',
  },
  {
    title: 'Business Consulting',
    desc: 'Strategy, operations, and business optimization.',
    image: '/images/hero/consulting.jpg',
    link: '/products-services',
  },
  {
    title: 'Enterprise Solutions',
    desc: 'Integrated systems powering multi-sector businesses.',
    image: '/images/hero/solutions.jpg',
    link: '/products-services',
  },
];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // AUTO PLAY
  useEffect(() => {
    if (paused) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [paused, index]);

  const nextSlide = () => {
    setIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // TOUCH HANDLERS (Typed)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;

    if (diff > 50) nextSlide();
    if (diff < -50) prevSlide();
  };

  const current = slides[index];

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* BACKGROUND IMAGES */}
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === index ? 'opacity-100 z-10' : 'opacity-0'
          }`}
        >
          <div className="relative w-full h-full">
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority={i === 0} // only first loads immediately
              sizes="100vw"
              className="object-cover scale-105 animate-slowZoom"
            />
          </div>
        </div>
      ))}

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-black/55"></div>

      {/* CONTENT */}
      <div className="relative z-20 h-full flex items-center justify-center text-center px-6">
        <div className="max-w-4xl text-white">
          <h1 className="text-4xl md:text-6xl font-bold">
            {current.title}
          </h1>

          <p className="mt-6 text-lg text-gray-200">
            {current.desc}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={current.link}
              target={current.link.startsWith('http') ? '_blank' : '_self'}
              rel="noopener noreferrer"
              className="bg-[var(--invent-blue)] px-8 py-3 rounded-xl font-semibold hover:bg-blue-800 transition"
            >
              Learn More
            </a>

            <a
              href="/contacts"
              className="border border-white px-8 py-3 rounded-xl font-semibold hover:bg-[var(--invent-yellow)] hover:text-black transition"
            >
              Talk to Us
            </a>
          </div>
        </div>
      </div>

      {/* ARROWS */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full"
      >
        ‹
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full"
      >
        ›
      </button>

      {/* DOTS */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all ${
              i === index
                ? 'bg-[var(--invent-yellow)] w-6'
                : 'bg-white/50 w-2'
            }`}
          />
        ))}
      </div>
    </div>
  );
}