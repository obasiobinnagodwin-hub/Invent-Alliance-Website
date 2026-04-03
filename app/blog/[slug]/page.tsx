import { notFound } from 'next/navigation';
import Image from 'next/image';
import PageLayout from '@/components/layout/PageLayout';
import PageHero from '@/components/ui/PageHero';
import Section from '@/components/ui/Section';
import Card from '@/components/ui/Card';
import { blogPosts } from '@/data/blogPosts';

interface PageProps {
  params: {
    slug: string;
  };
}

export function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export function generateMetadata({ params }: PageProps) {
  const post = blogPosts.find((p) => p.slug === params.slug);

  if (!post) return {};

  return {
    title: `${post.title} - Invent Alliance`,
    description: post.excerpt,
  };
}

export default function BlogPost({ params }: PageProps) {
  const post = blogPosts.find((p) => p.slug === params.slug);

  if (!post) return notFound();

  return (
    <PageLayout>
      <PageHero title={post.title} subtitle={post.date} />

      <Section className="max-w-3xl mx-auto">
        <Card className="space-y-6">

          {post.content.map((block, index) => {
            if (block.type === 'paragraph') {
              return (
                <p key={index} className="text-slate-700 leading-relaxed">
                  {block.text}
                </p>
              );
            }

            if (block.type === 'image') {
              return (
                <div key={index} className="relative w-full h-64">
                  <Image
                    src={block.src}
                    alt={block.alt}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              );
            }

            return null;
          })}

        </Card>
      </Section>
    </PageLayout>
  );
}
