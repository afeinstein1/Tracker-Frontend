import { useState } from 'react'
import { uploadImage, deleteImage } from '@/lib/trackerService'
import imageCompression from 'browser-image-compression'

type Props = {
  fieldId: string
  value: string
  onChange: (url: string) => void
  isEditMode: boolean
}

export function ImageField({ fieldId, value, onChange, isEditMode }: Props) {
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
    <div style={{ width: '100%', maxHeight: '80px' }}>
      {value ? (
        <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
          <img
            src={value}
            alt="field image"
            style={{ width: '100%', maxHeight: '80px', objectFit: 'cover', borderRadius: '4px', display: 'block' }}
          />
          {isEditMode && (
            <button
              onClick={handleDelete}
              disabled={uploading}
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                color: 'red',
                background: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                padding: 0,
                lineHeight: '20px',
                textAlign: 'center',
                cursor: 'pointer'
              }}
            >
              {uploading ? '...' : '✕'}
            </button>
          )}
        </div>
      ) : (
        isEditMode && (
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
        )
      )}
      {error && <span style={{ color: 'red', fontSize: '12px' }}>{error}</span>}
    </div>
  )
}