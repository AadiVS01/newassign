import React, { useState } from 'react';
import { getOptimizedImageUrl } from '../utils/imageUtils';

function ImageUploader({ 
  currentImage, 
  onImageChange, 
  label = "Product Image",
  accept = "image/*",
  maxSize = 5 * 1024 * 1024 // 5MB
}) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImage);

  const handleFileSelect = async (file) => {
    if (!file) return;

    // Validate file size
    if (file.size > maxSize) {
      alert(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);

      // Upload to server
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('http://localhost:3001/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      // Call parent component's callback with the new image URL
      onImageChange(`http://localhost:3001${result.imageUrl}`);
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
      setPreviewUrl(currentImage); // Reset preview on error
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (event) => {
    const file = event.target.files[0];
    handleFileSelect(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    
    const file = event.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragOver(false);
  };

  const removeImage = () => {
    setPreviewUrl('');
    onImageChange('');
  };

  return (
    <div className="space-y-4">
      <label className="form-label">
        {label}
      </label>
      
      {/* Image Preview */}
      {previewUrl && (
        <div className="relative inline-block">
          <img
            src={getOptimizedImageUrl(previewUrl, 300, 200)}
            alt="Preview"
            className="w-48 h-32 object-cover border border-gray-200 rounded"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
          >
            ×
          </button>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {uploading ? (
          <div className="space-y-2">
            <div className="spinner mx-auto"></div>
            <p className="text-gray-600">Uploading image...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            
            <div>
              <p className="text-gray-600 mb-2">Drag and drop an image here, or</p>
              <label className="cursor-pointer">
                <span className="bg-black text-white px-6 py-2 rounded-none hover:bg-gray-900 transition-colors font-light tracking-wide">
                  Choose File
                </span>
                <input
                  type="file"
                  accept={accept}
                  onChange={handleFileInput}
                  className="hidden"
                />
              </label>
            </div>
            
            <p className="text-sm text-gray-500">
              Maximum file size: {maxSize / (1024 * 1024)}MB
              <br />
              Supported formats: JPEG, PNG, GIF, WebP
            </p>
          </div>
        )}
      </div>

      {/* URL Input Alternative */}
      <div className="border-t border-gray-100 pt-4">
        <p className="text-sm text-gray-600 mb-3">Or enter image URL:</p>
        <input
          type="url"
          placeholder="https://example.com/image.jpg"
          value={currentImage && !currentImage.startsWith('http://localhost:3001') ? currentImage : ''}
          onChange={(e) => {
            const url = e.target.value;
            setPreviewUrl(url);
            onImageChange(url);
          }}
          className="form-input"
        />
      </div>
    </div>
  );
}

export default ImageUploader;