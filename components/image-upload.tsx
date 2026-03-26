"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface ImageUploadProps {
  label: string;
  onUploaded: (path: string) => void;
  onRemoved: () => void;
}

type UploadState = "idle" | "uploading" | "uploaded" | "error";

export function ImageUpload({ label, onUploaded, onRemoved }: ImageUploadProps) {
  const [state, setState] = useState<UploadState>("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(
    async (file: File) => {
      setState("uploading");
      setErrorMsg("");

      // Client-side preview
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();

        if (!res.ok) {
          setState("error");
          setErrorMsg(data.error || "Upload failed");
          setPreview(null);
          URL.revokeObjectURL(objectUrl);
          return;
        }

        setState("uploaded");
        onUploaded(data.path);
      } catch {
        setState("error");
        setErrorMsg("Upload failed — please try again");
        setPreview(null);
        URL.revokeObjectURL(objectUrl);
      }
    },
    [onUploaded]
  );

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) upload(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  }

  function handleRemove() {
    setState("idle");
    setPreview(null);
    setErrorMsg("");
    onRemoved();
    if (inputRef.current) inputRef.current.value = "";
  }

  if (state === "uploaded" && preview) {
    return (
      <div className="relative">
        <img
          src={preview}
          alt="Upload preview"
          className="w-full h-32 object-contain rounded-lg border border-neutral-200 bg-white"
        />
        <button
          onClick={handleRemove}
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-charcoal/70 text-white rounded-full hover:bg-charcoal transition-colors cursor-pointer"
          aria-label="Remove uploaded image"
        >
          <X className="w-3.5 h-3.5" />
        </button>
        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-forest-600">
          <CheckCircle className="w-3.5 h-3.5" />
          Image uploaded
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-100 ${
          dragOver
            ? "border-forest-400 bg-forest-50"
            : state === "error"
              ? "border-red-300 bg-red-50"
              : "border-neutral-200 hover:border-oak-300 bg-white"
        }`}
      >
        {state === "uploading" ? (
          <>
            <Loader2 className="w-6 h-6 text-oak-400 animate-spin" />
            <span className="text-xs text-neutral-500">Uploading...</span>
            {preview && (
              <img
                src={preview}
                alt="Uploading preview"
                className="w-16 h-16 object-contain rounded opacity-50"
              />
            )}
          </>
        ) : (
          <>
            <Upload className="w-6 h-6 text-neutral-400" />
            <span className="text-xs text-neutral-500 text-center">{label}</span>
            <span className="text-[0.625rem] text-neutral-400">
              JPEG, PNG or WebP — max 5MB
            </span>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
      {state === "error" && (
        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-red-600">
          <AlertCircle className="w-3.5 h-3.5" />
          {errorMsg}
        </div>
      )}
    </div>
  );
}
