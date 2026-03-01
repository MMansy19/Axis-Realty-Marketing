import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0B0F14, #1A1D21)',
          borderRadius: 36,
        }}
      >
        <svg
          viewBox="0 0 100 100"
          width="120"
          height="120"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line x1="50" y1="10" x2="50" y2="90" stroke="#C79E3D" strokeWidth="4" />
          <line x1="16" y1="88" x2="45" y2="30" stroke="#F5F4F2" strokeWidth="4" />
          <line x1="84" y1="88" x2="55" y2="30" stroke="#F5F4F2" strokeWidth="4" />
          <line x1="28" y1="64" x2="45" y2="64" stroke="#F5F4F2" strokeWidth="4" />
          <line x1="55" y1="64" x2="72" y2="64" stroke="#F5F4F2" strokeWidth="4" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
