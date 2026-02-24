import { ChevronsLeft } from "lucide-react";

export default function Header() {
  return (
    <header className="text-left max-w-4xl mx-auto pt-10 pb-8 px-4">
      <div className="flex items-center gap-1 mb-6">
        <ChevronsLeft className="w-6 h-6 text-tertiary-text" />
        <span className="text-sm font-semibold tracking-wide text-tertiary-text uppercase">
          Conversion Kings
        </span>
      </div>
      <h1 className="text-4xl sm:text-5xl font-extrabold text-tertiary-text mb-4 leading-tight">
        Service Cost Calculator
      </h1>
      <p className="text-gray-500 text-base max-w-2xl">
        Create a customised program built for your goals, or fast-track results
        with one of our high-performing, ready-to-go programs.
      </p>
    </header>
  );
}
