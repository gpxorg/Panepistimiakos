import React, { useState, useRef } from 'react';
import { Upload, X, File, Image, FileText, Loader2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadFile } from '@/api/supabaseClient';
import { Button } from '@/components/ui/button';

// CUSTOM COMPONENT 3: FileUploader - Drag & drop file upload component with preview
export default function FileUploader({ 
  onFileUpload, 
  accept = '*',
  maxSize = 10, // MB
  currentFile = null,
  label = 'Upload File',
  description = 'Drag and drop or click to upload'
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(currentFile);
  const fileInputRef = useRef(null);

  const getFileIcon = (fileName) => {
    if (!fileName) return File;
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return Image;
    if (['pdf', 'doc', 'docx', 'txt'].includes(ext)) return FileText;
    return File;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file) => {
    setError(null);
    
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90));
    }, 100);

    try {
      const result = await uploadFile( file );
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      const fileData = {
        url: result.file_url,
        name: file.name,
        size: file.size,
        type: file.type
      };
      
      setUploadedFile(fileData);
      
      if (onFileUpload) {
        onFileUpload(fileData);
      }
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
      
    } catch (err) {
      clearInterval(progressInterval);
      setError('Failed to upload file. Please try again.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemove = () => {
    setUploadedFile(null);
    setError(null);
    if (onFileUpload) {
      onFileUpload(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const FileIcon = getFileIcon(uploadedFile?.name);

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
      
      <AnimatePresence mode="wait">
        {uploadedFile && !isUploading ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative p-4 bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl border border-violet-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-lg shadow-sm">
                <FileIcon className="w-6 h-6 text-violet-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{uploadedFile.name}</p>
                <p className="text-xs text-slate-500">{formatFileSize(uploadedFile.size)}</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <button
                  onClick={handleRemove}
                  className="p-1.5 hover:bg-white rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-slate-400 hover:text-red-500" />
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`
              relative overflow-hidden rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer
              ${isDragging 
                ? 'border-violet-500 bg-violet-50' 
                : 'border-slate-200 hover:border-violet-300 hover:bg-slate-50'
              }
              ${isUploading ? 'pointer-events-none' : ''}
            `}
          >
            <div className="p-8 text-center">
              {isUploading ? (
                <div className="space-y-3">
                  <Loader2 className="w-10 h-10 text-violet-500 mx-auto animate-spin" />
                  <p className="text-sm font-medium text-slate-600">Uploading...</p>
                  <div className="w-48 h-2 bg-slate-100 rounded-full mx-auto overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className={`
                    w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center transition-colors
                    ${isDragging ? 'bg-violet-100' : 'bg-slate-100'}
                  `}>
                    <Upload className={`w-6 h-6 ${isDragging ? 'text-violet-600' : 'text-slate-400'}`} />
                  </div>
                  <p className="text-sm font-medium text-slate-700 mb-1">{description}</p>
                  <p className="text-xs text-slate-400">Max file size: {maxSize}MB</p>
                </>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleFileSelect}
              className="hidden"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-red-500"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
