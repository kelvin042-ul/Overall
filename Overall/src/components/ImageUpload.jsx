import { useState } from 'react';
import { FiUpload, FiX, FiImage, FiLink } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ImageUpload = ({ onImageUploaded, currentImageUrl, className = '', showUrlOption = true }) => {
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(currentImageUrl || '');
    const [showUrlInput, setShowUrlInput] = useState(false);
    const [urlInput, setUrlInput] = useState(currentImageUrl || '');

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    const uploadToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                { method: 'POST', body: formData }
            );

            const data = await response.json();

            if (data.secure_url) {
                return data.secure_url;
            } else {
                throw new Error(data.error?.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            throw new Error('Failed to upload image');
        }
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be less than 5MB');
            return;
        }

        setUploading(true);

        const localPreview = URL.createObjectURL(file);
        setPreviewUrl(localPreview);

        try {
            const imageUrl = await uploadToCloudinary(file);
            setPreviewUrl(imageUrl);
            onImageUploaded(imageUrl);
            toast.success('Image uploaded!');
        } catch (error) {
            toast.error('Upload failed. Please try again.');
            setPreviewUrl(currentImageUrl || '');
        } finally {
            setUploading(false);
            URL.revokeObjectURL(localPreview);
        }
    };

    const handleUrlSubmit = () => {
        if (urlInput && urlInput.trim()) {
            setPreviewUrl(urlInput);
            onImageUploaded(urlInput);
            setShowUrlInput(false);
            toast.success('Image URL added');
        }
    };

    const removeImage = () => {
        setPreviewUrl('');
        setUrlInput('');
        onImageUploaded('');
        toast.success('Image removed');
    };

    return (
        <div className={className}>
            <div className="flex flex-col items-center gap-3">
                {/* Preview Area */}
                {previewUrl ? (
                    <div className="relative">
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                            type="button"
                            onClick={removeImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                            title="Remove image"
                        >
                            <FiX className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="w-32 h-32 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                        <FiImage className="w-8 h-8 text-gray-400" />
                    </div>
                )}

                {/* Upload Button */}
                <div className="flex gap-2">
                    <label className="cursor-pointer">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                            disabled={uploading}
                        />
                        <div className={`flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            <FiUpload className="w-4 h-4" />
                            <span>{uploading ? 'Uploading...' : (previewUrl ? 'Change Image' : 'Upload Image')}</span>
                        </div>
                    </label>

                    {showUrlOption && (
                        <button
                            type="button"
                            onClick={() => setShowUrlInput(!showUrlInput)}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                        >
                            <FiLink className="w-4 h-4" />
                            <span>Use URL</span>
                        </button>
                    )}
                </div>

                {/* URL Input (optional) */}
                {showUrlInput && (
                    <div className="flex gap-2 w-full max-w-xs">
                        <input
                            type="url"
                            placeholder="https://example.com/image.jpg"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                        />
                        <button
                            type="button"
                            onClick={handleUrlSubmit}
                            className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                            Add
                        </button>
                    </div>
                )}

                <p className="text-xs text-gray-400">Upload JPG, PNG, or GIF. Max 5MB</p>
            </div>
        </div>
    );
};

export default ImageUpload;