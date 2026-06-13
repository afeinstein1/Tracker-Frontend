import { TrackerTab } from "@/Types/field"
import { TrackerSectionView } from "./SectionRenderer"
import { Meter } from "@/components/Meter"

type Props = {
  tab: TrackerTab
  onFieldChange: (sectionId: string, fieldId: string, value: boolean | number) => void
}

export function TabView({ tab, onFieldChange }: Props) {
  const fields = tab.sections.flatMap(section => section.fields)

  const totalProgress = fields.reduce((sum, field) => {
    if (field.type === "checkbox") return sum + (field.checked ? 1 : 0)
    if (field.type === "number") return sum + (field.value / field.max)
    return sum
  }, 0)

  const percentage = fields.length === 0 ? 0 : (totalProgress / fields.length) * 100

  return (
    <div>
      <Meter label="Tab Progress" value={Math.round(percentage)} maxValue={100} />
      {tab.sections.map(section => (
        <TrackerSectionView
          key={section.id}
          section={section}
          onFieldChange={(fieldId, value) => onFieldChange(section.id, fieldId, value)}
        />
      ))}
    </div>
  )
}