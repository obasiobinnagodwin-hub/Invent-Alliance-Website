import Image from 'next/image';
import Link from 'next/link';
import PageLayout from "@/components/layout/PageLayout";
import PageHero from "@/components/ui/PageHero";
import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import { staffMembers } from '@/data/staff';

export default function OurTeam() {
  return (
    <PageLayout>

      <PageHero
        title="Our Team"
        subtitle="Meet the professionals driving innovation and excellence at Invent Alliance."
      />

      <Section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {staffMembers.map((member) => (
            <div key={member.slug} className="overflow-hidden">
              <Card>

              {/* IMAGE */}
              <div className="relative h-64 w-full bg-gray-100">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* CONTENT */}
              <div className="p-5 text-justify">
                <h3 className="text-lg font-semibold text-gray-900">
                  {member.name}
                </h3>

                <p className="text-sm text-[var(--invent-yellow)] mb-2">
                  {member.title}
                </p>

                <p className="text-sm text-gray-600 mb-4">
                  {member.shortBio}
                </p>

                <Link
                  href={`/staff/${member.slug}`}
                  className="text-[var(--invent-blue)] hover:underline font-medium"
                >
                  View profile →
                </Link>
              </div>

            </Card>
            </div>
          ))}
        </div>
      </Section>

    </PageLayout>
  );
}