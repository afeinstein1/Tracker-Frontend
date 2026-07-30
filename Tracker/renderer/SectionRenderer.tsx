import { useWindowDimensions } from "react-native"
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
  disabled?: boolean
}

export function TrackerSectionView({ section, onFieldChange, onColumnValueChange, isEditMode, onEditTarget, tabId, onAddField, disabled = false }: Props) {
  const { width } = useWindowDimensions()
  const isNarrow = width < 700

  function renderColumnValue(fieldId: string, col: TrackerSection['columns'][number], value: string) {
    if (col.type === 'text') {
      return (
        <textarea
          value={value}
          onChange={e => onColumnValueChange(fieldId, col.id, e.target.value)}
          readOnly={!isEditMode || disabled}
          style={{ width: '100%', height: isNarrow ? '60px' : '80%', padding: '4px', resize: 'none', verticalAlign: 'top' }}
        />
      )
    }
    if (col.type === 'image') {
      return (
        <div>
          <ImageField
            fieldId={fieldId}
            value={value}
            onChange={url => onColumnValueChange(fieldId, col.id, url)}
            isEditMode={isEditMode && !disabled}
          />
        </div>
      )
    }
    if (col.type === 'dropdown') {
      return (
        <select
          value={value}
          onChange={e => onColumnValueChange(fieldId, col.id, e.target.value)}
          disabled={!isEditMode || disabled}
          style={{ width: '100%', padding: '4px' }}
        >
          <option value="">—</option>
          {(col.options ?? []).map((option, i) => (
            <option key={i} value={option}>{option}</option>
          ))}
        </select>
      )
    }
    return (
      <input
        value={value}
        onChange={e => onColumnValueChange(fieldId, col.id, e.target.value)}
        readOnly={!isEditMode || disabled}
        style={{ width: '100%', padding: '4px' }}
      />
    )
  }

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

      {!isNarrow && section.columns.length > 0 && (
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
        isNarrow ? (
          <div key={field.id} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: section.columns.length > 0 ? '12px' : 0 }}>
              {renderField(field, onFieldChange, disabled)}
              {isEditMode && (
                <button onClick={() => onEditTarget({ type: "field", item: field, sectionId: section.id })}>✏️</button>
              )}
            </div>
            {section.columns.map(col => (
              <div key={col.id} style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '4px' }}>{col.label}</div>
                {renderColumnValue(field.id, col, field.columnValues[col.id] ?? '')}
              </div>
            ))}
          </div>
        ) : (
          <div key={field.id} style={{ display: 'flex', alignItems: 'center', gap: '32px', marginBottom: '8px', minHeight: '56px' }}>
            <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: '4px' }}>
              {renderField(field, onFieldChange, disabled)}
              {isEditMode && (
                <button onClick={() => onEditTarget({ type: "field", item: field, sectionId: section.id })}>✏️</button>
              )}
            </div>
            {section.columns.map(col => (
              <div key={col.id} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch' }}>
                {renderColumnValue(field.id, col, field.columnValues[col.id] ?? '')}
              </div>
            ))}
          </div>
        )
      ))}

      {isEditMode && <button style={{ marginTop: '8px' }} onClick={() => onAddField(section.id)}>+ Field</button>}
    </div>
  )
}
