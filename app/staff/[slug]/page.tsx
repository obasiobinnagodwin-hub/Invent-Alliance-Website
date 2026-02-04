import Image from 'next/image';
import { notFound } from 'next/navigation';
import { staffMembers } from '@/data/staff';

export default function StaffProfile({
  params,
}: {
  params: { slug: string };
}) {
  const staff = staffMembers.find(
    (member) => member.slug === params.slug
  );

  if (!staff) {
    notFound();
  }

  return (
    <section className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        <Image
          src={staff.image}
          alt={staff.name}
          width={300}
          height={300}
          className="rounded-lg object-cover"
        />

        <div>
          <h1 className="text-3xl font-bold">{staff.name}</h1>
          <p className="text-lg text-gray-600 mt-1">{staff.title}</p>

          <div className="mt-6 space-y-4 text-gray-800 leading-relaxed whitespace-pre-line">
            {staff.bio}
          </div>
        </div>
      </div>
    </section>
  );
}

