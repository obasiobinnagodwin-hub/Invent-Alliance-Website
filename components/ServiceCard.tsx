import Image from 'next/image';
import Link from 'next/link';

interface ServiceCardProps {
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  linkUrl?: string;
  external?: boolean;
}

export default function ServiceCard({
  title,
  description,
  imageUrl,
  imageAlt,
  linkUrl,
  external = false,
}: ServiceCardProps) {
  const content = (
    <div className="glass-dark rounded-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-slate-700/50 hover:border-slate-500/70 group relative shadow-lg">
      <div className="relative h-64 w-full bg-slate-800/50 overflow-hidden flex items-center justify-center">
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          className="object-contain transition-transform duration-500 group-hover:scale-105 brightness-110 contrast-110 p-2"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          loading="lazy"
          quality={90}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        />
        <div className="absolute inset-0 ring-2 ring-white/10 group-hover:ring-white/20 transition-all duration-300"></div>
      </div>
      <div className="p-6 relative z-10">
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-neon-cyan transition-colors duration-300 text-elevated">{title}</h3>
        <p className="text-white text-sm mb-4 font-medium">{description}</p>
        {linkUrl && (
          <span className="text-neon-cyan hover:text-neon-blue font-medium text-sm inline-flex items-center group-hover:gap-2 transition-all duration-300">
            {external ? 'Visit Site →' : 'Learn More →'}
          </span>
        )}
      </div>
    </div>
  );

  if (linkUrl) {
    if (external) {
      return (
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          {content}
        </a>
      );
    }
    return (
      <Link href={linkUrl} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

