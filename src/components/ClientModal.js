import { useState } from "react";

export default function ClientModal({ clientDetails, onSave, onClose }) {
  const [form, setForm] = useState({ ...clientDetails });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(23, 28, 56, 0.6)" }}>
      <div
        className="bg-white w-full max-w-lg mx-4 p-8"
        style={{ borderRadius: 20 }}
      >
        <h2
          className="text-xl font-bold mb-1"
          style={{ color: "#25B1A2", fontFamily: "Lato, sans-serif" }}
        >
          Client Project Details
        </h2>
        <hr className="mb-6" style={{ borderColor: "#25B1A2" }} />

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#171C38" }}>
              Client Name:
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-3 text-sm outline-none"
              style={{
                border: "1px solid #DFDFDF",
                borderRadius: 10,
                color: "#494949",
              }}
              placeholder="e.g. Acme Corp"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#171C38" }}>
              Website URL:
            </label>
            <input
              type="text"
              name="website"
              value={form.website}
              onChange={handleChange}
              className="w-full px-4 py-3 text-sm outline-none"
              style={{
                border: "1px solid #DFDFDF",
                borderRadius: 10,
                color: "#494949",
              }}
              placeholder="e.g. https://acme.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#171C38" }}>
              Project Brief:
            </label>
            <textarea
              name="brief"
              value={form.brief}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 text-sm outline-none resize-y"
              style={{
                border: "1px solid #DFDFDF",
                borderRadius: 10,
                color: "#494949",
              }}
              placeholder="Brief description of the project scope and goals..."
            />
          </div>

          <div className="flex justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 text-sm font-semibold cursor-pointer transition-colors hover:bg-gray-50"
              style={{
                borderRadius: 28,
                border: "1.5px solid #25B1A2",
                color: "#25B1A2",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 text-sm font-semibold text-white cursor-pointer transition-all hover:shadow-lg"
              style={{
                borderRadius: 28,
                backgroundColor: "#25B1A2",
              }}
            >
              Save Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
