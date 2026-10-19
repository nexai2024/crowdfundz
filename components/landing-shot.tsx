import Image from "next/image";

export function LandingShot({
  src,
  alt,
  priority = false,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  return (
    <figure className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/40">
      <Image
        src={src}
        alt={alt}
        width={1024}
        height={571}
        priority={priority}
        className="h-auto w-full"
        sizes="(min-width: 1024px) 960px, 100vw"
      />
    </figure>
  );
}
