'use client'

import { useState, useRef }          from 'react'
import Image                          from 'next/image'
import { Upload, X, GripVertical,
         Star, Loader2, AlertCircle } from 'lucide-react'
import toast                          from 'react-hot-toast'

interface ImageManagerProps {
  images:    string[]
  onChange:  (images: string[]) => void
  folder?:   string   // Cloudinary folder name
  maxImages?: number
  label?:    string
}

export default function ImageManager({
  images,
  onChange,
  folder     = 'mathura-vrindavan',
  maxImages  = 8,
  label      = 'Images',
}: ImageManagerProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver,  setDragOver]  = useState(false)
  const [dragIdx,   setDragIdx]   = useState<number | null>(null)
  const [dragTarget,setDragTarget]= useState<number | null>(null)
  const fileInputRef              = useRef<HTMLInputElement>(null)

  // ── Upload handler ──────────────────────────────────────────────────────────
  async function uploadFile(file: File) {
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Max size is 10 MB.')
      return
    }
    if (images.length >= maxImages) {
      toast.error(`Maximum ${maxImages} images allowed.`)
      return
    }

    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file',   file)
      fd.append('folder', folder)

      const res  = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()

      if (res.ok && data.data?.url) {
        // First uploaded image becomes thumbnail automatically
        onChange([...images, data.data.url])
        toast.success('Image uploaded!')
      } else {
        toast.error(data.error ?? 'Upload failed. Check Cloudinary env vars.')
      }
    } catch {
      toast.error('Upload failed. Check your connection.')
    } finally {
      setUploading(false)
    }
  }

  async function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    for (const file of files.slice(0, maxImages - images.length)) {
      await uploadFile(file)
    }
    e.target.value = ''
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'))
    for (const file of files.slice(0, maxImages - images.length)) {
      await uploadFile(file)
    }
  }

  // ── Remove image ─────────────────────────────────────────────────────────────
  function removeImage(idx: number) {
    if (!confirm('Remove this image?')) return
    const updated = images.filter((_, i) => i !== idx)
    onChange(updated)
  }

  // ── Set as thumbnail (move to index 0) ───────────────────────────────────────
  function setAsThumbnail(idx: number) {
    if (idx === 0) return
    const updated = [images[idx], ...images.filter((_, i) => i !== idx)]
    onChange(updated)
    toast.success('Set as main thumbnail!')
  }

  // ── Drag-to-reorder ──────────────────────────────────────────────────────────
  function handleDragStart(idx: number) { setDragIdx(idx) }
  function handleDragEnter(idx: number) { setDragTarget(idx) }
  function handleDragEnd() {
    if (dragIdx !== null && dragTarget !== null && dragIdx !== dragTarget) {
      const updated = [...images]
      const [moved] = updated.splice(dragIdx, 1)
      updated.splice(dragTarget, 0, moved)
      onChange(updated)
    }
    setDragIdx(null)
    setDragTarget(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">
          {label} ({images.length}/{maxImages})
        </label>
        {images.length > 0 && (
          <p className="text-xs text-gray-400">
            First image = thumbnail · Drag to reorder
          </p>
        )}
      </div>

      {/* ── Upload drop zone ── */}
      {images.length < maxImages && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className="border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all mb-4"
          style={{
            borderColor:     dragOver ? '#ff7d0f' : 'var(--border-default)',
            background:      dragOver ? 'var(--surface-saffron)' : 'var(--bg-surface-muted)',
          }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileInput}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={28} className="text-saffron-500 animate-spin" />
              <p className="text-sm text-gray-500">Uploading to Cloudinary...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload size={28} className="text-gray-300" />
              <p className="text-sm font-semibold text-gray-600">
                Drop images here or <span style={{ color: '#ff7d0f' }}>click to upload</span>
              </p>
              <p className="text-xs text-gray-400">
                JPG, PNG, WebP · Max 10 MB · Up to {maxImages} images
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Image grid ── */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {images.map((url, i) => (
            <div
              key={url}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragEnter={() => handleDragEnter(i)}
              onDragEnd={handleDragEnd}
              className="relative group rounded-xl overflow-hidden cursor-grab active:cursor-grabbing transition-all duration-200"
              style={{
                paddingBottom: '66%',
                outline: dragTarget === i && dragIdx !== i
                  ? '2px dashed #ff7d0f'
                  : i === 0
                  ? '2px solid #22c55e'
                  : '2px solid transparent',
                opacity: dragIdx === i ? 0.5 : 1,
              }}>
              <div className="absolute inset-0">
                <Image
                  src={url}
                  alt={`Image ${i + 1}`}
                  fill
                  sizes="200px"
                  className="object-cover"
                />

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200" />

                {/* Thumbnail badge */}
                {i === 0 && (
                  <div className="absolute top-1.5 left-1.5 z-10">
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: 'var(--surface-green)', color: 'var(--text-on-green)' }}>
                      <Star size={9} className="inline mr-0.5" />Thumbnail
                    </span>
                  </div>
                )}

                {/* Image number */}
                <div className="absolute top-1.5 right-1.5 z-10">
                  <span className="text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold"
                    style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}>
                    {i + 1}
                  </span>
                </div>

                {/* Drag handle */}
                <div className="absolute bottom-1.5 left-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical size={14} className="text-white drop-shadow" />
                </div>

                {/* Action buttons */}
                <div className="absolute bottom-1.5 right-1.5 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {i !== 0 && (
                    <button type="button"
                      onClick={() => setAsThumbnail(i)}
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: '#22c55e' }}
                      title="Set as main thumbnail">
                      <Star size={11} className="text-white" />
                    </button>
                  )}
                  <button type="button"
                    onClick={() => removeImage(i)}
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: '#dc2626' }}
                    title="Remove image">
                    <X size={11} className="text-white" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Cloudinary warning */}
      {images.length === 0 && (
        <div className="flex items-start gap-2 p-3 rounded-xl"
          style={{ background: 'var(--surface-amber)', border: '1px solid var(--surface-amber-border)' }}>
          <AlertCircle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 leading-relaxed">
            Upload requires Cloudinary configured in Vercel env vars.
            Alternatively, drop image files in{' '}
            <code className="font-mono bg-amber-100 px-1 rounded">
              /public/images/places/
            </code>{' '}
            and they&apos;ll be served automatically.
          </p>
        </div>
      )}
    </div>
  )
}