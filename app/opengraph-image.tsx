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
          background: '#0B0F14',
          position: 'relative',
          fontFamily: 'serif',
        }}
      >
        {/* Subtle radial glow behind logo */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(199,158,61,0.08) 0%, transparent 65%)',
          }}
        />

        {/* Logo icon mark — larger, bolder */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            width: 160,
            height: 160,
            marginBottom: 36,
          }}
        >
          {/* Vertical gold line */}
          <div
            style={{
              width: 4,
              height: 130,
              background: '#C79E3D',
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          />
          {/* Left leg of A */}
          <div
            style={{
              width: 4,
              height: 100,
              background: '#F5F4F2',
              position: 'absolute',
              bottom: 0,
              left: 24,
              transform: 'rotate(18deg)',
              transformOrigin: 'bottom center',
            }}
          />
          {/* Right leg of A */}
          <div
            style={{
              width: 4,
              height: 100,
              background: '#F5F4F2',
              position: 'absolute',
              bottom: 0,
              right: 24,
              transform: 'rotate(-18deg)',
              transformOrigin: 'bottom center',
            }}
          />
          {/* Crossbar left */}
          <div
            style={{
              width: 28,
              height: 4,
              background: '#F5F4F2',
              position: 'absolute',
              top: 84,
              left: 32,
            }}
          />
          {/* Crossbar right */}
          <div
            style={{
              width: 28,
              height: 4,
              background: '#F5F4F2',
              position: 'absolute',
              top: 84,
              right: 32,
            }}
          />
        </div>

        {/* Brand Name: AXIS */}
        <div
          style={{
            display: 'flex',
            fontSize: 110,
            fontWeight: 700,
            color: '#F5F4F2',
            letterSpacing: '0.22em',
            lineHeight: 1,
          }}
        >
          AXIS
        </div>

        {/* Sub-brand: REALTY MARKETING */}
        <div
          style={{
            display: 'flex',
            fontSize: 26,
            fontWeight: 400,
            color: '#C79E3D',
            letterSpacing: '0.45em',
            marginTop: 18,
            textTransform: 'uppercase',
          }}
        >
          REALTY MARKETING
        </div>

        {/* Bottom gold accent */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            width: 60,
            height: 2,
            background: '#C79E3D',
          }}
        />

        {/* Vignette */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'radial-gradient(ellipse at center, transparent 40%, rgba(11,15,20,0.6) 100%)',
          }}
        />
      </div>
    ),
    { ...size }
  );
}
