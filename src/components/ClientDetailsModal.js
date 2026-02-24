import { useState, useEffect } from "react";

function ClientDetailsModal({ isOpen, onClose, onSave, initialData }) {
  const [clientName, setClientName] = useState(initialData.clientName || "");
  const [websiteUrl, setWebsiteUrl] = useState(initialData.websiteUrl || "");
  const [brief, setBrief] = useState(initialData.brief || "");

  useEffect(() => {
    setClientName(initialData.clientName || "");
    setWebsiteUrl(initialData.websiteUrl || "");
    setBrief(initialData.brief || "");
  }, [initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ clientName, websiteUrl, brief });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-primary-main mb-4 border-b pb-2">
          Client Project Details
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="clientName"
              className="block text-sm font-medium text-gray-700"
            >
              Client Name:
            </label>
            <input
              type="text"
              id="clientName"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="input-field mt-1 block w-full"
            />
          </div>
          <div>
            <label
              htmlFor="websiteUrl"
              className="block text-sm font-medium text-gray-700"
            >
              Website URL:
            </label>
            <input
              type="url"
              id="websiteUrl"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="input-field mt-1 block w-full"
            />
          </div>
          <div>
            <label
              htmlFor="brief"
              className="block text-sm font-medium text-gray-700"
            >
              Project Brief:
            </label>
            <textarea
              id="brief"
              rows="4"
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              className="input-field mt-1 block w-full"
            ></textarea>
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-sm font-medium btn-secondary cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md text-sm font-medium btn-primary cursor-pointer"
            >
              Save Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ClientDetailsModal;
