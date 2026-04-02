type PageHeroProps = {
  title: string;
  subtitle?: string;
  variant?: "default" | "dark";
};

export default function PageHero({ title, subtitle }: any) {
  return (
    <div className="bg-invent-hero text-white text-center py-16 px-4">
      <h1 className="text-4xl font-bold mb-2">{title}</h1>
      <p className="opacity-90">{subtitle}</p>
    </div>
  );
}