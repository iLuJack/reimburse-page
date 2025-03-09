"use client";

import { useState } from "react";
import { Upload } from "lucide-react";

interface FileUploadProps {
  onChange: (file: File | undefined) => void;
}

export default function FileUpload({ onChange }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | undefined>();
  const [preview, setPreview] = useState<string | undefined>();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    onChange(file);

    // 如果是圖片，顯示預覽
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(undefined);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        上傳發票
      </label>
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-2 text-gray-500" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">點擊上傳</span> 或拖放文件
            </p>
            <p className="text-xs text-gray-500">支援 PNG、JPG 或 PDF</p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*,.pdf"
            onChange={handleFileChange}
          />
        </label>
      </div>

      {preview && (
        <div className="mt-2">
          <img
            src={preview}
            alt="Receipt preview"
            className="h-24 object-contain"
          />
        </div>
      )}

      {selectedFile && !preview && (
        <div className="mt-2 text-sm text-gray-500">
          已選擇: {selectedFile.name}
        </div>
      )}
    </div>
  );
}
