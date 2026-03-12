import { Check } from "lucide-react";
import { packages } from "../constants";

export default function PackageSelector({ activePackage, onSelectPackage }) {
  return (
    <section>
      <h2 className="text-xl font-bold mb-5" style={{ color: '#171C38' }}>
        Our proven programs
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(packages).map(([key, pkg]) => {
          const isActive = activePackage === key;
          return (
            <button
              key={key}
              onClick={() => onSelectPackage(key)}
              className="relative text-left p-5 transition-all duration-200 cursor-pointer hover:shadow-md"
              style={{
                borderRadius: 17,
                border: isActive
                  ? '1px solid rgba(0,0,0,0.14)'
                  : '1px solid #E4E4E4',
                backgroundColor: isActive
                  ? 'rgba(255,255,255,0.95)'
                  : 'rgba(255,255,255,0.5)',
              }}
            >
              {isActive && (
                <span
                  className="absolute top-4 right-4 flex items-center justify-center"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: '#25B1A2',
                  }}
                >
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </span>
              )}
              <div className="flex items-center gap-2 mb-1">
                <h3
                  className="text-lg font-bold"
                  style={{ color: pkg.popular && isActive ? '#25B1A2' : '#212121' }}
                >
                  {pkg.name}
                </h3>
                {pkg.popular && (
                  <span
                    className="text-[10px] font-semibold px-2.5 py-0.5 uppercase tracking-wider"
                    style={{
                      borderRadius: 11,
                      border: '1px solid #494949',
                      color: '#494949',
                    }}
                  >
                    Popular
                  </span>
                )}
              </div>
              <p className="text-sm" style={{ color: '#494949', opacity: 0.8 }}>
                {pkg.description}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
