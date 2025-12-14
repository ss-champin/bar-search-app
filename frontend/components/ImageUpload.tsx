'use client';

/**
 * 画像アップロードコンポーネント
 */

import { useState, useRef } from 'react';

interface ImageUploadProps {
  onUpload: (file: File) => Promise<void>;
  maxSizeMB?: number;
  accept?: string;
  multiple?: boolean;
  preview?: boolean;
}

export default function ImageUpload({
  onUpload,
  maxSizeMB = 10,
  accept = 'image/jpeg,image/png,image/webp',
  multiple = false,
  preview = true,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // ファイルサイズチェック
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`ファイルサイズは${maxSizeMB}MB以下にしてください`);
      return;
    }

    // ファイルタイプチェック
    const allowedTypes = accept.split(',').map((t) => t.trim());
    if (!allowedTypes.includes(file.type)) {
      setError('サポートされていないファイル形式です');
      return;
    }

    // プレビュー表示
    if (preview) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }

    // アップロード
    setUploading(true);
    try {
      await onUpload(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'アップロードに失敗しました');
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* アップロードボタン */}
      <button
        type="button"
        onClick={handleClick}
        disabled={uploading}
        className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-600">アップロード中...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span className="text-sm text-gray-600">
              クリックして画像を選択
            </span>
            <span className="text-xs text-gray-400">
              {accept.split(',').join(', ')} (最大{maxSizeMB}MB)
            </span>
          </div>
        )}
      </button>

      {/* エラーメッセージ */}
      {error && (
        <div className="mt-2 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* プレビュー */}
      {preview && previewUrl && (
        <div className="mt-4">
          <img
            src={previewUrl}
            alt="Preview"
            className="max-w-full h-auto rounded-lg shadow-md"
          />
        </div>
      )}
    </div>
  );
}
