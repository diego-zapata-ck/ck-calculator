import { packages } from "../constants";

const PackageSelector = ({ onSelectPackage }) => (
  <div className="mb-6 pb-4 border-b border-gray-200">
    <h3 className="text-xl font-semibold text-tertiary-text mb-4">
      Select a Predefined Package:
    </h3>
    <div className="flex flex-wrap gap-4">
      {Object.keys(packages).map((pkgName) => (
        <button
          key={pkgName}
          onClick={() => onSelectPackage(pkgName)}
          className="px-6 py-3 rounded-lg font-semibold shadow-md btn-primary"
        >
          {packages[pkgName].name}
        </button>
      ))}
    </div>
  </div>
);

export default PackageSelector;
