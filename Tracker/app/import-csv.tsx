import { useState } from 'react'
import { useRouter } from 'expo-router'
import Papa from 'papaparse'
import { useIsPremium } from '@/lib/premium'
import { createTracker, saveTracker, saveTrackerValues, saveColumnValues } from '@/lib/trackerService'
import {
  parseCsvBatch,
  defaultTrackerTitle,
  MAX_BATCH_FILES,
  CsvFileInput,
  CsvParseResult
} from '@/lib/csvImport'
import { Tracker } from '@/Types/field'

export default function ImportCsv() {
  const router = useRouter()
  const isPremium = useIsPremium()

  const [results, setResults] = useState<CsvParseResult[] | null>(null)
  const [trackerTitle, setTrackerTitle] = useState('')
  const [tabTitles, setTabTitles] = useState<Record<string, string>>({})
  const [includedFiles, setIncludedFiles] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files
    if (!fileList || fileList.length === 0) return
    const files = Array.from(fileList)
    e.target.value = ''

    setError(null)
    setResults(null)

    if (files.length > MAX_BATCH_FILES) {
      setError(`Too many files selected (max ${MAX_BATCH_FILES} per import)`)
      return
    }

    setLoading(true)
    try {
      const inputs: CsvFileInput[] = await Promise.all(files.map(async file => {
        const text = await file.text()
        const parsed = Papa.parse<string[]>(text, { skipEmptyLines: false })
        return { name: file.name, rows: parsed.data, sizeBytes: file.size }
      }))

      const batchResults = parseCsvBatch(inputs)
      setResults(batchResults)
      setTrackerTitle(defaultTrackerTitle(files.map(f => f.name)))

      const titles: Record<string, string> = {}
      const included: Record<string, boolean> = {}
      batchResults.forEach(r => {
        if (r.tab) {
          titles[r.fileName] = r.tab.title
          included[r.fileName] = true
        }
      })
      setTabTitles(titles)
      setIncludedFiles(included)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleConfirm() {
    if (!results) return
    const includedTabs = results.filter(r => r.tab && includedFiles[r.fileName])
    if (includedTabs.length === 0) return

    setSaving(true)
    setError(null)
    try {
      const created = await createTracker(trackerTitle.trim() || 'Imported Tracker')
      const tracker: Tracker = {
        ...created,
        tabs: includedTabs.map(r => ({
          ...r.tab!,
          title: (tabTitles[r.fileName] || r.tab!.title).trim() || r.tab!.title
        }))
      }
      await saveTracker(tracker)
      await saveTrackerValues(tracker)
      await saveColumnValues(tracker)
      router.push(`/tracker/${tracker.id}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setResults(null)
    setError(null)
    router.push('/')
  }

  if (!isPremium) {
    return (
      <div style={{ width: '90%', maxWidth: '500px', margin: '0 auto', paddingTop: '40px' }}>
        <h1>Import from CSV</h1>
        <p>CSV import is a premium feature.</p>
        <button onClick={() => router.push('/')}>← My Trackers</button>
      </div>
    )
  }

  const includedCount = results?.filter(r => r.tab && includedFiles[r.fileName]).length ?? 0

  return (
    <div style={{ width: '90%', maxWidth: '700px', margin: '0 auto', paddingTop: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        <h1 style={{ margin: 0 }}>Import from CSV</h1>
        <button onClick={() => router.push('/')} style={{ marginLeft: 'auto' }}>← My Trackers</button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!results && (
        <div style={{ border: '2px solid #ccc', borderRadius: '12px', padding: '16px' }}>
          <p>Each CSV becomes one tab. Up to {MAX_BATCH_FILES} files per import.</p>
          <label style={{ cursor: 'pointer' }}>
            <span style={{ display: 'inline-block', padding: '8px 12px', border: '1px solid #999', borderRadius: '6px' }}>
              {loading ? 'Reading files...' : 'Choose CSV files'}
            </span>
            <input
              type="file"
              accept=".csv"
              multiple
              onChange={handleFilesSelected}
              disabled={loading}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      )}

      {results && (
        <>
          <div style={{ border: '2px solid #ccc', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <label>
              Tracker Title
              <input
                type="text"
                value={trackerTitle}
                onChange={e => setTrackerTitle(e.target.value)}
                style={{ display: 'block', width: '100%', marginTop: '4px', padding: '8px' }}
              />
            </label>
          </div>

          {results.map(r => (
            <div key={r.fileName} style={{ border: `2px solid ${r.error ? 'red' : '#ccc'}`, borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
              {r.error ? (
                <>
                  <strong style={{ color: 'red' }}>{r.fileName}</strong>
                  <p style={{ color: 'red', margin: '4px 0 0' }}>{r.error.message}</p>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={includedFiles[r.fileName] ?? true}
                      onChange={e => setIncludedFiles(prev => ({ ...prev, [r.fileName]: e.target.checked }))}
                    />
                    <input
                      type="text"
                      value={tabTitles[r.fileName] ?? r.tab!.title}
                      onChange={e => setTabTitles(prev => ({ ...prev, [r.fileName]: e.target.value }))}
                      style={{ flex: 1, padding: '6px' }}
                    />
                  </div>
                  <ul style={{ marginTop: '8px', marginBottom: 0 }}>
                    {r.tab!.sections.map(s => (
                      <li key={s.id}>{s.title} ({s.fields.length} field{s.fields.length === 1 ? '' : 's'})</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          ))}

          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button onClick={handleCancel} disabled={saving}>Cancel</button>
            <button onClick={handleConfirm} disabled={saving || includedCount === 0}>
              {saving ? 'Importing...' : `Import ${includedCount} Tab${includedCount === 1 ? '' : 's'}`}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
