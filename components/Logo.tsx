'use client';

interface LogoProps {
  variant?: 'stacked' | 'horizontal' | 'icon';
  scheme?: 'light' | 'dark';
  locale?: string;
  className?: string;
}

const AxisIconPaths = ({ mainColor, axisColor }: { mainColor: string; axisColor: string }) => (
  <>
    <line x1="50" y1="10" x2="50" y2="90" stroke={axisColor} strokeWidth="4" strokeLinecap="butt" />
    <line x1="16" y1="88" x2="45" y2="30" stroke={mainColor} strokeWidth="4" strokeLinecap="butt" />
    <line x1="84" y1="88" x2="55" y2="30" stroke={mainColor} strokeWidth="4" strokeLinecap="butt" />
    <line x1="28" y1="64" x2="45" y2="64" stroke={mainColor} strokeWidth="4" strokeLinecap="butt" />
    <line x1="55" y1="64" x2="72" y2="64" stroke={mainColor} strokeWidth="4" strokeLinecap="butt" />
  </>
);

export default function Logo({ variant = 'horizontal', scheme = 'light', locale = 'en', className = '' }: LogoProps) {
  const mainColor = scheme === 'light' ? '#F5F4F2' : '#0B0F14';
  const axisColor = '#C79E3D';
  const textColor1 = scheme === 'light' ? '#F5F4F2' : '#0B0F14';
  const textColor2 = '#C79E3D';
  const isRTL = locale === 'ar';

  if (variant === 'icon') {
    return (
      <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg" aria-label="Axis Realty Marketing">
        <AxisIconPaths mainColor={mainColor} axisColor={axisColor} />
      </svg>
    );
  }

  if (variant === 'stacked') {
    return (
      <svg viewBox="0 0 400 300" className={className} xmlns="http://www.w3.org/2000/svg" aria-label="Axis Realty Marketing">
        <svg x="140" y="30" width="120" height="120" viewBox="0 0 100 100">
          <AxisIconPaths mainColor={mainColor} axisColor={axisColor} />
        </svg>
        <text x="200" y="200" textAnchor="middle" fill={textColor1} style={{ fontFamily: "'Cinzel', serif", fontWeight: 600, fontSize: '60px', letterSpacing: '0.4em' }}>
          AXIS
        </text>
        <text x="200" y="235" textAnchor="middle" fill={textColor2} style={{ fontFamily: "'Cinzel', serif", fontWeight: 400, fontSize: '16px', letterSpacing: '0.2em' }}>
          REALTY MARKETING
        </text>
      </svg>
    );
  }

  // RTL: icon on right, text on left — mirror the LTR layout
  const iconX = isRTL ? 380 : 30;
  const textAnchor = isRTL ? 'end' : 'start';

  return (
    <svg viewBox="0 0 500 140" className={className} xmlns="http://www.w3.org/2000/svg" aria-label="Axis Realty Marketing">
      <svg x={iconX} y="20" width="100" height="100" viewBox="0 0 100 100">
        <AxisIconPaths mainColor={mainColor} axisColor={axisColor} />
      </svg>
      <text x="160" y="78" textAnchor={textAnchor} fill={textColor1} style={{ fontFamily: "'Cinzel', serif", fontWeight: 600, fontSize: '60px', letterSpacing: '0.4em' }}>
        AXIS
      </text>
      <text x="163" y="112" textAnchor={textAnchor} fill={textColor2} style={{ fontFamily: "'Cinzel', serif", fontWeight: 400, fontSize: '16px', letterSpacing: '0.2em' }}>
        REALTY MARKETING
      </text>
    </svg>
  );
}
