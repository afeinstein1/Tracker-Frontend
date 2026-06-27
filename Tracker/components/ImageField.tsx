import { useState } from 'react'
import { uploadImage, deleteImage } from '@/lib/trackerService'
import imageCompression from 'browser-image-compression'

type Props = {
  fieldId: string
  value: string
  onChange: (url: string) => void
}

export function ImageField({ fieldId, value, onChange }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.2,         // 200KB max
        maxWidthOrHeight: 1200, // resize to max 1200px
        useWebWorker: true
      })
      const url = await uploadImage(compressed as File, fieldId)
      onChange(url)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete() {
    if (!value) return
    setUploading(true)
    setError(null)
    try {
      await deleteImage(value)
      onChange('')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {value ? (
        <>
          <img
            src={value}
            alt="field image"
            style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px' }}
          />
          <button onClick={handleDelete} disabled={uploading} style={{ color: 'red' }}>
            {uploading ? '...' : '✕'}
          </button>
        </>
      ) : (
        <label style={{ cursor: 'pointer' }}>
          {uploading ? 'Uploading...' : '+ Image'}
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </label>
      )}
      {error && <span style={{ color: 'red', fontSize: '12px' }}>{error}</span>}
    </div>
  )
}