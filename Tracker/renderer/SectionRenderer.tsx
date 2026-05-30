import { TrackerSection } from "@/Types/field"
import { renderField } from "./renderer"

type Props = {
  section: TrackerSection
}

export function TrackerSectionView({ section }: Props) {
  return (
    <div>
      <h2>{section.title}</h2>
      {section.fields.map(field => (
        <div key={field.id}>
          {renderField(field)}
        </div>
      ))}
    </div>
  )
}