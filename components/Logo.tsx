import Image from 'next/image';

export default function Logo({ className = "", size = 56 }: { className?: string; size?: number }) {
  return (
    <Image
      src="/logo.png"
      alt="Imperium Developments"
      width={size}
      height={size}
      className={className}
      quality={100}
    />
  );
}
