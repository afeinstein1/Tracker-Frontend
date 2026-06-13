import { TrackerSection } from "@/Types/field"
import { renderField } from "./renderer"

type Props = {
  section: TrackerSection
  onFieldChange: (fieldId: string, value: boolean | number) => void
}

export function TrackerSectionView({ section, onFieldChange }: Props) {
  return (
    <div style={{
      border: '2px solid #ccc',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '16px'
    }}>
      <h2>{section.title}</h2>
      {section.fields.map(field => (
        <div key={field.id}>
          {renderField(field, onFieldChange)}
        </div>
      ))}
    </div>
  )
}