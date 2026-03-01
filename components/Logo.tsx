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

  const title = isRTL ? '\u0623\u0643\u0633\u064A\u0633' : 'AXIS';
  const subtitle = isRTL ? '\u062A\u0633\u0648\u064A\u0642 \u0639\u0642\u0627\u0631\u064A' : 'REALTY MARKETING';
  const titleFont = isRTL ? "'Cairo', sans-serif" : "'Cinzel', serif";
  const titleSpacing = isRTL ? undefined : '0.4em';
  const subtitleSpacing = isRTL ? undefined : '0.2em';
  const subtitleSize = isRTL ? '24px' : '16px';
  const ariaLabel = isRTL ? '\u0623\u0643\u0633\u064A\u0633 \u062A\u0633\u0648\u064A\u0642 \u0639\u0642\u0627\u0631\u064A' : 'Axis Realty Marketing';

  if (variant === 'stacked') {
    return (
      <svg viewBox="0 0 400 300" className={className} xmlns="http://www.w3.org/2000/svg" aria-label={ariaLabel}>
        <svg x="140" y="30" width="120" height="120" viewBox="0 0 100 100">
          <AxisIconPaths mainColor={mainColor} axisColor={axisColor} />
        </svg>
        <text x="200" y="200" textAnchor="middle" fill={textColor1} style={{ fontFamily: titleFont, fontWeight: isRTL ? 700 : 600, fontSize: isRTL ? '56px' : '60px', letterSpacing: titleSpacing }}>
          {title}
        </text>
        <text x="200" y="235" textAnchor="middle" fill={textColor2} style={{ fontFamily: titleFont, fontWeight: 400, fontSize: subtitleSize, letterSpacing: subtitleSpacing }}>
          {subtitle}
        </text>
      </svg>
    );
  }

  // Horizontal: RTL = icon right + Arabic text left; LTR = icon left + English text right
  const iconX = isRTL ? 320 : 30;
  const textAnchor = isRTL ? 'end' : 'start';

  return (
    <svg viewBox="0 0 500 140" className={className} xmlns="http://www.w3.org/2000/svg" aria-label={ariaLabel}>
      <svg x={iconX} y="20" width="100" height="100" viewBox="0 0 100 100">
        <AxisIconPaths mainColor={mainColor} axisColor={axisColor} />
      </svg>
      <text x="160" y="78" textAnchor={textAnchor} fill={textColor1} style={{ fontFamily: "'Cinzel', serif", fontWeight: 600, fontSize: '60px', letterSpacing: '0.4em' }}>
        {title}
      </text>
      <text x="163" y="112" textAnchor={textAnchor} fill={textColor2} style={{ fontFamily: "'Cinzel', serif", fontWeight: 400, fontSize: subtitleSize, letterSpacing: '0.2em' }}>
        {subtitle}
      </text>
    </svg>
  );
}
