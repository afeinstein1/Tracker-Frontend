import { EditTarget, TrackerTab } from "@/Types/field"
import { TrackerSectionView } from "./SectionRenderer"
import { Meter } from "@/components/Meter"

type Props = {
  tab: TrackerTab
  onFieldChange: (sectionId: string, fieldId: string, value: boolean | number) => void
  isEditMode: boolean
  onEditTarget: (target: EditTarget) => void
  onAddSection: () => void
  onAddField: (sectionId: string) => void
}

export function TabView({ tab, onFieldChange, isEditMode, onEditTarget, onAddSection, onAddField }: Props) {
  const fields = tab.sections.flatMap(section => section.fields)

  const totalWeight = fields.reduce((sum, field) => sum + field.weight, 0)

  const totalProgress = fields.reduce((sum, field) => {
    const contribution = field.type === "checkbox"
      ? (field.checked ? 1 : 0)
      : field.value / field.max
    return sum + (contribution * field.weight)
  }, 0)

  const percentage = totalWeight === 0 ? 0 : (totalProgress / totalWeight) * 100

  return (
    <div>
      <Meter label="Tab Progress" value={Math.round(percentage)} maxValue={100} />
      {tab.sections.map(section => (
        <TrackerSectionView
          key={section.id}
          section={section}
          onFieldChange={(fieldId, value) => onFieldChange(section.id, fieldId, value)}
          isEditMode={isEditMode}
          onEditTarget={onEditTarget}
          tabId={tab.id}
          onAddField={onAddField}
        />
      ))}
      {isEditMode && <button onClick={onAddSection}>+ Section</button>}
    </div>
  )
}