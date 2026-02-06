import Image from 'next/image';
import { staffMembers } from '@/data/staff';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const staff = staffMembers.find((m) => m.slug === slug);

  if (!staff) return {};

  return {
    title: `${staff.name} | Invent Alliance`,
    description: staff.shortBio,
    openGraph: {
      title: staff.name,
      description: staff.shortBio,
      images: [staff.image],
    },
  };
}

export default async function StaffProfile({ params }: Props) {
  const { slug } = await params;
  const staff = staffMembers.find((m) => m.slug === slug);

  if (!staff) notFound();

  return (
    <div className="min-h-screen bg-slate-800 py-16">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="relative w-64 h-64 shrink-0">
            <Image
              src={staff.image}
              alt={staff.name}
              fill
              className="object-cover rounded-lg"
            />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-white">
              {staff.name}
            </h1>
            <p className="text-cyan-400 font-medium mb-4">
              {staff.title}
            </p>
            <p className="text-slate-200 whitespace-pre-line leading-relaxed">
              {staff.bio}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
