// app/about-us/page.tsx  (or wherever your team page lives)

import Image from 'next/image';
import Link from 'next/link';
import { staffMembers } from '@/data/staff';

export default function OurTeam() {
  return (
    // PAGE WRAPPER
    <section className="min-h-screen bg-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* PAGE TITLE */}
        <h1 className="text-4xl font-bold text-[#F4C430] text-center mb-12">
          Our Team
        </h1>

        {/* TEAM GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {staffMembers.map((member) => (
            <div
              key={member.slug}
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
            >
              {/* IMAGE */}
              <div className="relative h-64">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* CONTENT */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {member.name}
                </h3>

                <p className="text-sm text-yellow-700 mb-2">
                  {member.title}
                </p>

                <p className="text-sm text-gray-600 mb-4">
                  {member.shortBio}
                </p>

                <Link
                  href={`/staff/${member.slug}`}
                  className="text-yellow-600 hover:text-yellow-700 font-medium"
                >
                  View profile →
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
