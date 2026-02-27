export default function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 120"
      className={className}
      fill="none"
    >
      {/* Shield Background */}
      <path
        d="M10 10 L50 0 L90 10 L90 70 C90 95 50 120 50 120 C50 120 10 95 10 70 Z"
        fill="var(--brand-bg)"
        stroke="var(--brand-accent)"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      
      {/* Crown */}
      <path
        d="M35 30 L40 20 L50 25 L60 20 L65 30 L60 35 L40 35 Z"
        fill="var(--brand-accent)"
      />
      
      {/* Pillar Top */}
      <rect x="35" y="40" width="30" height="4" fill="var(--brand-accent)" />
      <rect x="38" y="46" width="24" height="3" fill="var(--brand-accent)" />
      
      {/* Pillar Body */}
      <rect x="42" y="52" width="5" height="20" fill="var(--brand-accent)" />
      <rect x="53" y="52" width="5" height="20" fill="var(--brand-accent)" />
      
      {/* Stylized Roofline / Chevron */}
      <path
        d="M20 85 L50 70 L80 85 L80 93 L50 78 L20 93 Z"
        fill="var(--brand-accent)"
      />
      <path
        d="M30 98 L50 88 L70 98 L70 104 L50 94 L30 104 Z"
        fill="var(--brand-accent)"
      />
    </svg>
  );
}
