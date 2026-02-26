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
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <footer className="mt-10 pt-6 pb-10 space-y-8">
      <div className="flex items-center justify-between bg-white rounded-xl px-6 py-4 border border-gray-200">
        <span className="text-sm font-medium text-gray-700">
          Preferred kickoff date
        </span>
        <div className="relative">
          <input
            type="date"
            value={kickoffDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="input-field text-sm text-gray-500 pr-10 pl-3 py-2"
            placeholder="DD / MM / YY"
          />
          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handlePrint}
          className="px-10 py-3 rounded-full font-semibold text-base btn-primary"
        >
          Print quote
        </button>
        <button
          onClick={handleShare}
          className="px-10 py-3 rounded-full font-semibold text-base border-2 border-tertiary-text text-tertiary-text hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Share quote
        </button>
      </div>
    </footer>
  );
}
