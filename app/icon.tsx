import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0B0F14',
          borderRadius: 4,
        }}
      >
        <svg
          viewBox="0 0 100 100"
          width="26"
          height="26"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line x1="50" y1="10" x2="50" y2="90" stroke="#C79E3D" strokeWidth="6" />
          <line x1="16" y1="88" x2="45" y2="30" stroke="#F5F4F2" strokeWidth="6" />
          <line x1="84" y1="88" x2="55" y2="30" stroke="#F5F4F2" strokeWidth="6" />
          <line x1="28" y1="64" x2="45" y2="64" stroke="#F5F4F2" strokeWidth="6" />
          <line x1="55" y1="64" x2="72" y2="64" stroke="#F5F4F2" strokeWidth="6" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
