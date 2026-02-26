import { Check } from "lucide-react";
import { packages } from "../constants";

export default function PackageSelector({ activePackage, onSelectPackage }) {
  return (
    <section className="mb-4">
      <h2 className="text-xl font-bold text-tertiary-text mb-5">
        Our proven programs
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(packages).map(([key, pkg]) => (
          <button
            key={key}
            onClick={() => onSelectPackage(key)}
            className={`relative text-left p-5 rounded-2xl border transition-all duration-200 cursor-pointer bg-white hover:shadow-md ${
              activePackage === key
                ? "border-primary-main shadow-md"
                : "border-gray-200"
            }`}
          >
            {activePackage === key && (
              <span className="absolute top-4 right-4 w-7 h-7 rounded-full bg-primary-main flex items-center justify-center">
                <Check className="w-4 h-4 text-white" strokeWidth={3} />
              </span>
            )}
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`text-lg font-bold ${
                pkg.popular ? "text-primary-main" : "text-tertiary-text"
              }`}>
                {pkg.name}
              </h3>
              {pkg.popular && (
                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-gray-600 text-gray-600">
                  Popular
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">{pkg.description}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
