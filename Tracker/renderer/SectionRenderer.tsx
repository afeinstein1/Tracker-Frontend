import { EditTarget, TrackerSection } from "@/Types/field"
import { renderField } from "./renderer"
import { ImageField } from '@/components/ImageField'

type Props = {
  section: TrackerSection
  onFieldChange: (fieldId: string, value: boolean | number) => void
  onColumnValueChange: (fieldId: string, columnId: string, value: string) => void
  isEditMode: boolean
  onEditTarget: (target: EditTarget) => void
  tabId: string
  onAddField: (sectionId: string) => void
}

export function TrackerSectionView({ section, onFieldChange, onColumnValueChange, isEditMode, onEditTarget, tabId, onAddField }: Props) {
  return (
    <div style={{
      border: '2px solid #ccc',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '16px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <h2 style={{ margin: 0 }}>{section.title}</h2>
        {isEditMode && (
          <button onClick={() => onEditTarget({ type: "section", item: section, tabId: tabId })}>✏️</button>
        )}
      </div>

      {section.columns.length > 0 && (
        <div style={{ display: 'flex', gap: '32px', marginBottom: '4px' }}>
          <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div>Field</div>
            {isEditMode && <div style={{ width: '28px' }} />}
          </div>
          {section.columns.map(col => (
            <div key={col.id} style={{ flex: 1, fontWeight: 600, textAlign: 'center' }}>{col.label}</div>
          ))}
        </div>
      )}

      {section.fields.map(field => (
        <div key={field.id} style={{ display: 'flex', alignItems: 'center', gap: '32px', marginBottom: '8px', minHeight: '56px' }}>
          <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: '4px' }}>
            {renderField(field, onFieldChange)}
            {isEditMode && (
              <button onClick={() => onEditTarget({ type: "field", item: field, sectionId: section.id })}>✏️</button>
            )}
          </div>
        {section.columns.map(col => (
          <div key={col.id} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch' }}>
            {col.type === 'text' ? (
              <textarea
                value={field.columnValues[col.id] ?? ''}
                onChange={e => onColumnValueChange(field.id, col.id, e.target.value)}
                style={{ width: '100%', height: '80%', padding: '4px', resize: 'none', verticalAlign: 'top' }}
              />
            ) : (
              <div>{col.type === 'image' ? (
                <ImageField
                  fieldId={field.id}
                  value={field.columnValues[col.id] ?? ''}
                  onChange={url => onColumnValueChange(field.id, col.id, url)}
                  isEditMode={isEditMode}
                />
              ) : (
                <input
                  value={field.columnValues[col.id] ?? ''}
                  onChange={e => onColumnValueChange(field.id, col.id, e.target.value)}
                  style={{ width: '100%', padding: '4px' }}
                />
              )}</div>
            )}
          </div>
        ))}

        </div>
      ))}

      {isEditMode && <button style={{ marginTop: '8px' }} onClick={() => onAddField(section.id)}>+ Field</button>}
    </div>
  )
}