import { Tracker } from "@/Types/field"
import { TrackerSectionView } from "./SectionRenderer"
import { Meter } from "@/components/Meter"
import { useState } from "react"

type Props = {
  tracker: Tracker
}

export function TrackerView({ tracker: initialTracker }: Props) {
  const [tracker, setTracker] = useState(initialTracker)

  function handleFieldChange(sectionId: string, fieldId: string, value: boolean | number) {
    setTracker((prev: Tracker) => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id !== sectionId ? section : {
          ...section,
            fields: section.fields.map(field =>
              field.id !== fieldId ? field : {
                ...field,
                ...(field.type === "checkbox" 
                  ? { checked: value as boolean } 
                  : { value: value as number })
              }
            )
        }
      )
    }))
  }

  const totalFields = tracker.sections.flatMap(section => section.fields).length

  const completedFields = tracker.sections
    .flatMap(section => section.fields)
    .filter(field => {
      if (field.type === "checkbox") return field.checked
      if (field.type === "number") return field.value >= field.max
      return false
    }).length

  return (
    <div>
      <Meter label="Progress" value={completedFields} maxValue={totalFields} />
      <h1>{tracker.title}</h1>
      {tracker.sections.map(section => (
        <TrackerSectionView
          key={section.id}
          section={section}
          onFieldChange={(fieldId, value) => handleFieldChange(section.id, fieldId, value)}
        />
      ))}
    </div>
  )
}