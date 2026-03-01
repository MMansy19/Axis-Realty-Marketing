import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'AXIS REALTY MARKETING – Strategic Real Estate Marketing & Sales Management';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0B0F14 0%, #1A1D21 50%, #0B0F14 100%)',
          position: 'relative',
        }}
      >
        {/* Gold accent line */}
        <div
          style={{
            width: 2,
            height: 80,
            background: '#C79E3D',
            marginBottom: 40,
          }}
        />

        {/* Brand Name */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: '#F5F4F2',
              letterSpacing: '0.15em',
            }}
          >
            AXIS
          </span>
          <span
            style={{
              fontSize: 18,
              fontWeight: 400,
              color: '#C79E3D',
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
            }}
          >
            Realty Marketing
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            marginTop: 48,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span
            style={{
              fontSize: 28,
              color: '#F5F4F2',
              fontWeight: 600,
            }}
          >
            We Build Demand. We Drive Sales.
          </span>
          <span
            style={{
              fontSize: 16,
              color: '#9AA0A6',
              marginTop: 12,
            }}
          >
            Strategic Real Estate Marketing &amp; Sales Management
          </span>
        </div>

        {/* Bottom gold line */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            width: 60,
            height: 2,
            background: '#C79E3D',
          }}
        />

        {/* Vignette overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at center, transparent 50%, rgba(11,15,20,0.5) 100%)',
          }}
        />
      </div>
    ),
    { ...size }
  );
}
