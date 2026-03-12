export default function Header() {
  return (
    <header className="text-left pt-10 pb-8">
      <div className="mb-6">
        <img
          src="/icons/Logo.png"
          alt="Conversion Kings"
          className="h-8 object-contain"
        />
      </div>
      <h1
        className="font-black text-tertiary-text mb-4 leading-tight"
        style={{ fontFamily: 'Lato, sans-serif', fontSize: 40 }}
      >
        Service Cost Calculator
      </h1>
      <p className="text-gray-500 text-base max-w-2xl">
        Create a customised program tailored to your goals, or fast-track results
        with one of our high-performing, ready-to-go programs.
      </p>
    </header>
  );
}
