'use client';

import Image from 'next/image';
import Link from 'next/link';

interface Props {
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  external?: boolean;
}

export default function ServiceCard({
  title,
  description,
  imageUrl,
  linkUrl,
  external = false,
}: Props) {
  const Wrapper = external ? 'a' : Link;

  return (
    <Wrapper
      href={linkUrl}
      {...(external && {
        target: '_blank',
        rel: 'noopener noreferrer',
      })}
      className="group block"
    >
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">

        {/* IMAGE */}
        <div className="relative h-48 overflow-hidden">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* CONTENT */}
        <div className="p-5 space-y-3">

          <h3 className="text-lg font-semibold text-[var(--invent-blue-700)] group-hover:text-[var(--invent-blue)] transition-colors">
            {title}
          </h3>

          <p className="text-sm text-gray-600 leading-relaxed">
            {description}
          </p>

          {/* CTA */}
          <span className="inline-block text-sm font-semibold text-[var(--invent-blue)] group-hover:underline">
            Learn more →
          </span>

        </div>
      </div>
    </Wrapper>
  );
}