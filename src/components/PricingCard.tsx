import React from "react";

interface PricingCardProps {
  planType?: string;
  price?: string;
  buttonLabel?: string;
  onClick?: () => void;
  highlight?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({
  planType = "Free",
  price = "Kostenlos",
  buttonLabel = "Jetzt starten",
  onClick,
  highlight = false,
}) => (
  <div
    className={`bg-white border rounded-2xl shadow-md p-16 flex flex-col items-start w-full max-w-2xl ${
      highlight ? "border-blue-500" : "border-gray-200"
    } font-satoshi`}
    style={{ fontFamily: 'Satoshi, sans-serif', background: '#fff' }}
  >
    <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-sky-700 to-cyan-500 bg-clip-text text-transparent font-satoshi mb-2" style={{ fontFamily: 'Satoshi, sans-serif' }}>
              rudolpho-chat
      {highlight && (
        <span className="ml-2 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded align-middle">PRO</span>
      )}
    </span>
    <span className="text-4xl font-light text-gray-800 font-satoshi mb-4" style={{ fontFamily: 'Satoshi, sans-serif' }}>
      {planType}
    </span>
    <div className="mt-2 text-2xl text-gray-500 font-satoshi mb-8" style={{ fontFamily: 'Satoshi, sans-serif' }}>
      {price}
    </div>
    <button
      className="mt-4 w-full min-w-[320px] max-w-full bg-white border-4 border-cyan-400 rounded-full px-16 py-4 font-semibold text-cyan-700 text-xl hover:bg-cyan-50 transition font-satoshi whitespace-nowrap"
      onClick={onClick}
      style={{ fontFamily: 'Satoshi, sans-serif' }}
    >
      {buttonLabel}
    </button>
  </div>
);

export default PricingCard; 