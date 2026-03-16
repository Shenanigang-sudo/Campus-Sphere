import { useState, useRef } from 'react';
import { FiUploadCloud, FiX, FiImage } from 'react-icons/fi';
import api from '../services/api';

/**
 * ImageUpload — a drag-and-drop / click-to-upload image picker.
 *
 * Props:
 *   value      {string}   — current image URL (controlled)
 *   onChange   {fn}       — called with the uploaded image URL string
 *   label      {string}   — field label text
 *   required   {bool}
 */
const ImageUpload = ({ value, onChange, label = 'Image', required = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const uploadFile = async (file) => {
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (!['jpg', 'jpeg', 'png'].includes(ext)) {
      setError('Only jpg, jpeg, and png files are allowed.');
      return;
    }

    setError('');
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      onChange(response.data.url);
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) uploadFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  const handleClear = () => {
    onChange('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-1 pl-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {value ? (
        /* Preview */
        <div className="relative group rounded-xl overflow-hidden border-2 border-primary/30 bg-gray-50 dark:bg-dark-800">
          <img
            src={value}
            alt="Preview"
            className="w-full h-48 object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="bg-white text-gray-800 rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-gray-100 transition"
            >
              Change
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="bg-red-500 text-white rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-red-600 transition flex items-center gap-1"
            >
              <FiX /> Remove
            </button>
          </div>
        </div>
      ) : (
        /* Drop Zone */
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-2 w-full h-40 rounded-xl border-2 border-dashed cursor-pointer transition-all
            ${isDragging
              ? 'border-primary bg-primary/5 scale-[1.01]'
              : 'border-border hover:border-primary/50 hover:bg-gray-50/50 dark:hover:bg-dark-800/50'
            }`}
        >
          {isUploading ? (
            <>
              <div className="w-7 h-7 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-sm text-gray-500">Uploading…</p>
            </>
          ) : (
            <>
              <FiUploadCloud className="text-3xl text-gray-400" />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Click to upload or drag & drop
              </p>
              <p className="text-xs text-gray-400">JPG, JPEG, PNG supported</p>
            </>
          )}
        </div>
      )}

      {/* Hidden native file input */}
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png"
        className="hidden"
        onChange={handleFileSelect}
      />

      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
};

export default ImageUpload;
