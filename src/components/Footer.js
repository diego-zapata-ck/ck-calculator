import { Calendar } from "lucide-react";

export default function Footer({ kickoffDate, onDateChange }) {
  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Service Cost Calculator Quote",
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <footer className="mt-10 pt-6 pb-10 space-y-8">
      <div
        className="flex items-center justify-between bg-white px-6"
        style={{ borderRadius: 20, border: '0.5px solid #DFDFDF', height: 72 }}
      >
        <span className="text-sm font-medium" style={{ color: '#171C38' }}>
          Preferred kickoff date
        </span>
        <div
          className="relative"
          style={{ borderRadius: 12, background: 'rgba(183, 183, 183, 0.11)' }}
        >
          <input
            type="date"
            value={kickoffDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => onDateChange(e.target.value)}
            className="text-sm pr-10 pl-3 py-2 bg-transparent outline-none"
            style={{ color: '#494949', width: 249, height: 48 }}
            placeholder="DD / MM / YY"
          />
          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#494949' }} />
        </div>
      </div>

      <div className="flex gap-4 print-hide">
        <button
          onClick={handlePrint}
          className="font-semibold text-base text-white cursor-pointer transition-all duration-200 hover:shadow-lg"
          style={{
            width: 166,
            height: 56,
            borderRadius: 28,
            backgroundColor: '#25B1A2',
          }}
        >
          Print quote
        </button>
        <button
          onClick={handleShare}
          className="font-semibold text-base cursor-pointer transition-colors duration-200 hover:bg-gray-50"
          style={{
            width: 173,
            height: 55,
            borderRadius: 27.5,
            border: '1.5px solid #171C38',
            color: '#171C38',
          }}
        >
          Share quote
        </button>
      </div>
    </footer>
  );
}
