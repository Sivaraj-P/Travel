import { useState } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";

const UploadModal = ({ isOpen, onClose, refreshData }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errorData, setErrorData] = useState([]);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const handleFileChange = (event) => {
    setFiles(Array.from(event.target.files));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange({ target: { files: e.dataTransfer.files } });
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast("Please select files to upload.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    files.forEach((file) => formData.append("file", file));

    try {
      const response = await axios.post("http://10.10.192.179:5001/upload", formData, {
        withCredentials: true,
      });

      toast(response.data.message);
      setFiles([]);
      onClose();
      refreshData();

      if (response.data.invalidRows && response.data.invalidRows.length > 0) {
        setErrorData(response.data.invalidRows.map((row) => row.error));
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error("File upload failed:", error);
      toast(error.response?.data?.message || "File upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-2xl w-96">
            <h3 className="text-xl font-bold mb-4 text-fuchsia-800">Upload File</h3>

            {files.length === 0 ? (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-dashed border-4 rounded-lg p-6 transition-colors duration-300 ${
                  dragActive ? "border-fuchsia-600 bg-fuchsia-50" : "border-fuchsia-300 bg-gray-50"
                }`}
              >
                <div className="text-center">
                  <FaCloudUploadAlt className="mx-auto text-4xl text-fuchsia-800 mb-4" />
                  <p className="text-gray-600">Drag & Drop files here or</p>
                  <input type="file" multiple onChange={handleFileChange} className="hidden" id="file-upload" disabled={uploading} />
                  <label htmlFor="file-upload" className="cursor-pointer text-fuchsia-800 font-bold hover:underline">
                    Browse Files
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
                    <span className="text-fuchsia-800">{file.name}</span>
                    <button onClick={() => setFiles(files.filter((_, i) => i !== index))} className="text-red-500 hover:text-red-700" disabled={uploading}>
                      ✖
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex justify-between">
              <button onClick={onClose} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">
                Cancel
              </button>
              <button onClick={handleUpload} className="bg-fuchsia-800 text-white px-4 py-2 rounded hover:bg-fuchsia-700" disabled={uploading}>
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showErrorModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-xl font-bold mb-4 text-red-500">Upload Errors</h3>
            <ul className="list-disc pl-5 space-y-2">
              {errorData.map((error, index) => (
                <li key={index} className="text-sm text-red-700">
                  {error}
                </li>
              ))}
            </ul>
            <div className="flex justify-end mt-4">
              <button onClick={() => setShowErrorModal(false)} className="bg-gray-400 text-white px-4 py-2 rounded-full hover:bg-gray-500">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UploadModal;
