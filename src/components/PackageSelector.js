import { packages } from "../constants";

export default function PackageSelector({ activePackage, onSelectPackage }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-tertiary-text mb-5">
        Our proven programs
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(packages).map(([key, pkg]) => (
          <button
            key={key}
            onClick={() => onSelectPackage(key)}
            className={`relative text-left p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer bg-white hover:shadow-md ${
              activePackage === key
                ? "border-primary-main shadow-md"
                : "border-gray-200"
            }`}
          >
            {pkg.popular && (
              <span className="absolute -top-3 right-4 bg-tertiary-text text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
                Popular
              </span>
            )}
            <h3 className="text-lg font-bold text-tertiary-text mb-1">
              {pkg.name}
            </h3>
            <p className="text-sm text-gray-500">{pkg.description}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
