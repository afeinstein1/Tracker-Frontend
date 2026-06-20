import { EditTarget, TrackerSection } from "@/Types/field"
import { renderField } from "./renderer"

type Props = {
  section: TrackerSection
  onFieldChange: (fieldId: string, value: boolean | number) => void
  isEditMode: boolean
  onEditTarget: (target: EditTarget) => void
  tabId: string
  onAddField: (sectionId: string) => void
}

export function TrackerSectionView({ section, onFieldChange, isEditMode, onEditTarget, tabId, onAddField }: Props) {
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
      {section.fields.map(field => (
        <div key={field.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {renderField(field, onFieldChange)}
          {isEditMode && (
            <button onClick={() => onEditTarget({ type: "field", item: field, sectionId: section.id })}>✏️</button>
          )}
        </div>
      ))}
      {isEditMode && <button style={{ marginTop: '8px' }} onClick={() => onAddField(section.id)}>+ Field</button>}
    </div>
  )
}