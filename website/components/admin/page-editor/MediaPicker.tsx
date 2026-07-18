"use client";

import { useState, useEffect, useRef } from "react";

interface MediaPickerProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

interface MediaItem {
  id: string;
  filename: string;
  url: string;
  type: string;
  size: number;
}

export function MediaPicker({ value, onChange, label = "Image" }: MediaPickerProps) {
  const [open, setOpen] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function fetchMedia() {
    setLoading(true);
    fetch("/api/admin/media")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setMedia(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setMedia([]);
        setLoading(false);
      });
  }

  useEffect(() => {
    if (!open) return;
    fetchMedia();
  }, [open]);

  async function handleFileUpload(file: File) {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        onChange(data.url);
        setOpen(false);
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-1.5">{label}</label>
      <div className="flex items-center gap-3">
        {value ? (
          <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-line bg-cream shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-lg border-2 border-dashed border-line bg-cream/50 flex items-center justify-center text-muted text-xs shrink-0">
            No image
          </div>
        )}
        <div className="flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Image URL or pick from library"
            className="w-full px-3 py-2 text-sm border border-line rounded-lg bg-white focus:outline-none focus:border-gold"
          />
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-1.5 text-xs text-gold hover:text-gold-dark font-medium"
          >
            Browse media library →
          </button>
        </div>
      </div>

      {/* Media library modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-card max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-line">
              <h3 className="font-serif text-lg font-semibold text-ink">Media Library</h3>
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-3 py-1.5 bg-burgundy text-white rounded-lg text-sm hover:bg-burgundy-dark transition-colors disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "+ Upload New"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-muted hover:text-ink text-xl leading-none"
                >
                  &times;
                </button>
              </div>
            </div>
            <div className="overflow-y-auto p-5 flex-1">
              {loading ? (
                <p className="text-muted text-sm text-center py-8">Loading media...</p>
              ) : media.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted text-sm mb-4">
                    No media found. Upload your first image.
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-burgundy text-white rounded-lg text-sm hover:bg-burgundy-dark transition-colors"
                  >
                    Upload Image
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {media
                    .filter((m) => m.type === "image")
                    .map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onChange(item.url);
                          setOpen(false);
                        }}
                        className="group relative rounded-lg overflow-hidden border border-line hover:border-gold transition-colors aspect-square bg-cream"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.url}
                          alt={item.filename}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-2 py-1 truncate">
                          {item.filename}
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}