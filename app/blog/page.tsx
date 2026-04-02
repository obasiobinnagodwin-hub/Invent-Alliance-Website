'use client';

import { useState } from 'react';
import { blogPosts } from '@/data/blogPosts';
import PageLayout from '@/components/layout/PageLayout';
import PageHero from '@/components/ui/PageHero';
import Section from '@/components/ui/Section';
import Card from '@/components/ui/Card';
import Link from 'next/link';
import Image from 'next/image';

export default function BlogPage() {
  const [filter, setFilter] = useState('all');

  const filteredPosts =
    filter === 'all'
      ? blogPosts
      : blogPosts.filter((p) => p.category === filter);

  return (
    <PageLayout>

      <PageHero
        title="News & Updates"
        subtitle="Latest news, events, and recognitions"
      />

      <Section className="max-w-6xl mx-auto">

        {/* FILTER */}
        <div className="flex gap-4 mb-8">
          {['all', 'news', 'appreciation'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                filter === type
                  ? 'bg-[var(--invent-blue)] text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>

        {/* POSTS */}
        <div className="grid md:grid-cols-2 gap-8">

          {filteredPosts.map((post) => (
            <Card key={post.slug} className="overflow-hidden">

              <div className="relative h-48">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-4">
                <span className="text-xs uppercase text-gray-500">
                  {post.category}
                </span>

                <h2 className="text-xl font-bold text-gray-900 mt-1">
                  {post.title}
                </h2>

                <p className="text-sm text-gray-500 mb-2">
                  {post.date}
                </p>

                <p className="text-gray-600 mb-4">
                  {post.excerpt}
                </p>

                <Link
                  href={`/blog/${post.slug}`}
                  className="text-[var(--invent-blue)] font-semibold hover:underline"
                >
                  Read more →
                </Link>
              </div>

            </Card>
          ))}

        </div>

      </Section>

    </PageLayout>
  );
}