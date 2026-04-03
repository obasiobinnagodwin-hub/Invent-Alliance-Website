import { notFound } from 'next/navigation';
import Image from 'next/image';
import PageLayout from '@/components/layout/PageLayout';
import PageHero from '@/components/ui/PageHero';
import Section from '@/components/ui/Section';
import Card from '@/components/ui/Card';
import { blogPosts, BlogPost } from '@/data/blogPosts';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// ✅ Static generation
export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

// ✅ Metadata (Next 16 fix)
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;

  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) return {};

  return {
    title: `${post.title} - Invent Alliance`,
    description: post.excerpt,
  };
}

// ✅ Page
export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;

  const post: BlogPost | undefined = blogPosts.find(
    (p) => p.slug === slug
  );

  if (!post) return notFound();

  return (
    <PageLayout>
      <PageHero title={post.title} subtitle={post.date} />

      <Section className="max-w-3xl mx-auto">
        <Card className="space-y-6">

          {post.content.map((block, index) => {
            
            // ✅ Paragraph
            if (block.type === 'paragraph') {
              return (
                <p
                  key={index}
                  className="text-slate-700 leading-relaxed text-base"
                >
                  {block.text}
                </p>
              );
            }

            // ✅ Image (safe)
            if (block.type === 'image' && block.src) {
              return (
                <div
                  key={index}
                  className="relative w-full h-64 md:h-80"
                >
                  <Image
                    src={block.src}
                    alt={block.alt || 'Blog image'}
                    fill
                    className="object-cover rounded-xl"
                    sizes="(max-width: 768px) 100vw, 768px"
                    priority={index === 0}
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