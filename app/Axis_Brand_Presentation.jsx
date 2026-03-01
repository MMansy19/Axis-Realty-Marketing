import React, { useState } from 'react';
import { Download, LayoutTemplate, Layers, Square, Palette, Contrast } from 'lucide-react';

const COLORS = {
  charcoal: '#0B0F14',
  gold: '#C79E3D',
  light: '#F5F4F2',
  white: '#FFFFFF',
  black: '#000000'
};

const SvgDefs = () => (
  <defs>
    <style>
      {`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600&family=Montserrat:wght@300&display=swap');
      `}
    </style>
  </defs>
);

const AxisIconPaths = ({ mainColor, axisColor }) => (
  <>
    {/* Center Vertical Axis */}
    <line x1="50" y1="10" x2="50" y2="90" stroke={axisColor} strokeWidth="3" strokeLinecap="butt" />
    {/* Left diagonal chevron */}
    <line x1="16" y1="88" x2="45" y2="30" stroke={mainColor} strokeWidth="3" strokeLinecap="butt" />
    {/* Right diagonal chevron */}
    <line x1="84" y1="88" x2="55" y2="30" stroke={mainColor} strokeWidth="3" strokeLinecap="butt" />
    {/* Left crossbar */}
    <line x1="28" y1="64" x2="45" y2="64" stroke={mainColor} strokeWidth="3" strokeLinecap="butt" />
    {/* Right crossbar */}
    <line x1="55" y1="64" x2="72" y2="64" stroke={mainColor} strokeWidth="3" strokeLinecap="butt" />
  </>
);

const LogoStacked = ({ id, mainColor, axisColor, textColor1, textColor2 }) => (
  <svg id={id} viewBox="0 0 400 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <SvgDefs />
    <svg x="140" y="30" width="120" height="120" viewBox="0 0 100 100">
      <AxisIconPaths mainColor={mainColor} axisColor={axisColor} />
    </svg>
    <text x="200" y="200" textAnchor="middle" fill={textColor1} style={{ fontFamily: "'Cinzel', serif", fontWeight: 600, fontSize: "56px", letterSpacing: "0.1em" }}>
      AXIS
    </text>
    <text x="200" y="235" textAnchor="middle" fill={textColor2} style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: "15px", letterSpacing: "0.35em" }}>
      REALTY MARKETING
    </text>
  </svg>
);

const LogoHorizontal = ({ id, mainColor, axisColor, textColor1, textColor2 }) => (
  <svg id={id} viewBox="0 0 500 140" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <SvgDefs />
    <svg x="30" y="20" width="100" height="100" viewBox="0 0 100 100">
      <AxisIconPaths mainColor={mainColor} axisColor={axisColor} />
    </svg>
    <text x="160" y="78" textAnchor="start" fill={textColor1} style={{ fontFamily: "'Cinzel', serif", fontWeight: 600, fontSize: "52px", letterSpacing: "0.1em" }}>
      AXIS
    </text>
    <text x="163" y="112" textAnchor="start" fill={textColor2} style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: "14px", letterSpacing: "0.35em" }}>
      REALTY MARKETING
    </text>
  </svg>
);

const LogoIconOnly = ({ id, mainColor, axisColor }) => (
  <svg id={id} viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <SvgDefs />
    <AxisIconPaths mainColor={mainColor} axisColor={axisColor} />
  </svg>
);

export default function App() {
  const [copiedHex, setCopiedHex] = useState('');

  const downloadSvg = (id, filename) => {
    const svg = document.getElementById(id);
    if (!svg) return;
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svg);
    if(!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)){
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    const blob = new Blob([source], {type: "image/svg+xml;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename + ".svg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = (hex) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(''), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F5F4F2] text-[#0B0F14] font-sans selection:bg-[#C79E3D] selection:text-white pb-20">
      {/* Hero Header */}
      <header className="bg-[#0B0F14] text-[#F5F4F2] pt-24 pb-16 px-8 text-center border-b-4 border-[#C79E3D]">
        <h1 className="text-sm tracking-[0.3em] font-light text-[#C79E3D] mb-4 uppercase">Brand Identity Guidelines</h1>
        <h2 className="text-4xl md:text-5xl font-serif tracking-widest mb-6" style={{ fontFamily: "'Cinzel', serif" }}>AXIS REALTY MARKETING</h2>
        <p className="max-w-2xl mx-auto text-gray-400 font-light leading-relaxed">
          Authoritative. Modern. Investment-Grade. A minimalist geometric identity representing connection, alignment, and strategic growth in real estate.
        </p>
      </header>

      <main className="max-w-6xl mx-auto px-6 mt-16 space-y-24">
        
        {/* Color Palette */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <Palette className="w-6 h-6 text-[#C79E3D]" />
            <h3 className="text-2xl font-serif tracking-wider">Brand Color Palette</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Deep Charcoal', hex: COLORS.charcoal, text: 'text-white' },
              { name: 'Warm Gold Accent', hex: COLORS.gold, text: 'text-white' },
              { name: 'Neutral Light', hex: COLORS.light, text: 'text-gray-900', border: 'border border-gray-200' }
            ].map((color) => (
              <div 
                key={color.hex} 
                onClick={() => copyToClipboard(color.hex)}
                className={`p-6 rounded-lg flex flex-col justify-end h-32 cursor-pointer transition-transform hover:scale-105 ${color.border || ''}`}
                style={{ backgroundColor: color.hex }}
              >
                <div className={`flex justify-between items-end ${color.text}`}>
                  <span className="font-semibold tracking-wide">{color.name}</span>
                  <span className="font-mono text-sm opacity-80">{copiedHex === color.hex ? 'COPIED!' : color.hex}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Primary Stacked Logo */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Layers className="w-6 h-6 text-[#C79E3D]" />
              <h3 className="text-2xl font-serif tracking-wider">Primary Logo (Stacked)</h3>
            </div>
            <button 
              onClick={() => downloadSvg('logo-stacked', 'Axis_Logo_Stacked')}
              className="flex items-center gap-2 px-4 py-2 bg-[#0B0F14] text-white text-sm tracking-widest hover:bg-[#C79E3D] transition-colors"
            >
              <Download className="w-4 h-4" /> EXPORT SVG
            </button>
          </div>
          <div className="bg-white p-12 md:p-24 flex justify-center items-center shadow-sm border border-gray-100 rounded-xl relative group">
            <div className="w-full max-w-lg">
              <LogoStacked 
                id="logo-stacked"
                mainColor={COLORS.charcoal} 
                axisColor={COLORS.gold} 
                textColor1={COLORS.charcoal} 
                textColor2={COLORS.gold} 
              />
            </div>
          </div>
        </section>

        {/* Horizontal Logo */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <LayoutTemplate className="w-6 h-6 text-[#C79E3D]" />
              <h3 className="text-2xl font-serif tracking-wider">Horizontal Lockup</h3>
            </div>
            <button 
              onClick={() => downloadSvg('logo-horizontal', 'Axis_Logo_Horizontal')}
              className="flex items-center gap-2 px-4 py-2 bg-[#0B0F14] text-white text-sm tracking-widest hover:bg-[#C79E3D] transition-colors"
            >
              <Download className="w-4 h-4" /> EXPORT SVG
            </button>
          </div>
          <div className="bg-white p-12 md:p-20 flex justify-center items-center shadow-sm border border-gray-100 rounded-xl">
            <div className="w-full max-w-2xl">
              <LogoHorizontal 
                id="logo-horizontal"
                mainColor={COLORS.charcoal} 
                axisColor={COLORS.gold} 
                textColor1={COLORS.charcoal} 
                textColor2={COLORS.gold} 
              />
            </div>
          </div>
        </section>

        {/* Logo Grid: Dark, B&W, Icon */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Reversed Version */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-serif tracking-wider">Reversed (Dark)</h3>
              <button onClick={() => downloadSvg('logo-reversed', 'Axis_Logo_Reversed')} className="text-gray-500 hover:text-[#C79E3D]" title="Download SVG"><Download className="w-5 h-5" /></button>
            </div>
            <div className="bg-[#0B0F14] p-12 flex-grow flex justify-center items-center rounded-xl shadow-lg">
              <div className="w-full max-w-xs">
                <LogoStacked 
                  id="logo-reversed"
                  mainColor={COLORS.light} 
                  axisColor={COLORS.gold} 
                  textColor1={COLORS.light} 
                  textColor2={COLORS.gold} 
                />
              </div>
            </div>
          </div>

          {/* Black & White */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-serif tracking-wider flex items-center gap-2"><Contrast className="w-5 h-5 text-gray-500"/> Monochrome (B&W)</h3>
              <button onClick={() => downloadSvg('logo-bw', 'Axis_Logo_BW')} className="text-gray-500 hover:text-black" title="Download SVG"><Download className="w-5 h-5" /></button>
            </div>
            <div className="bg-white border border-gray-300 p-12 flex-grow flex justify-center items-center rounded-xl">
              <div className="w-full max-w-xs">
                <LogoStacked 
                  id="logo-bw"
                  mainColor={COLORS.black} 
                  axisColor={COLORS.black} 
                  textColor1={COLORS.black} 
                  textColor2={COLORS.black} 
                />
              </div>
            </div>
          </div>

          {/* Icon Only */}
          <div className="flex flex-col md:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-serif tracking-wider flex items-center gap-2"><Square className="w-5 h-5 text-[#C79E3D]"/> Icon Mark Only</h3>
              <button 
                onClick={() => downloadSvg('logo-icon', 'Axis_Icon_Mark')}
                className="flex items-center gap-2 px-4 py-2 bg-[#0B0F14] text-white text-sm tracking-widest hover:bg-[#C79E3D] transition-colors"
              >
                <Download className="w-4 h-4" /> EXPORT ICON SVG
              </button>
            </div>
            <div className="bg-white p-12 flex justify-center items-center border border-gray-100 rounded-xl shadow-sm">
              <div className="w-48 h-48">
                <LogoIconOnly 
                  id="logo-icon"
                  mainColor={COLORS.charcoal} 
                  axisColor={COLORS.gold} 
                />
              </div>
            </div>
          </div>

        </section>

      </main>
      
      <footer className="mt-24 py-8 text-center text-sm text-gray-500 font-light tracking-widest border-t border-gray-200">
        AXIS REALTY MARKETING &copy; BRAND IDENTITY
      </footer>
    </div>
  );
}