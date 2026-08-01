import { EditTarget, SectionUnlockCondition, TabUnlockCondition, TrackerTab } from "@/Types/field"
import { TrackerSectionView } from "./SectionRenderer"
import { Meter } from "@/components/Meter"

type Props = {
  tab: TrackerTab
  onFieldChange: (sectionId: string, fieldId: string, value: boolean | number) => void
  onColumnValueChange: (sectionId: string, fieldId: string, columnId: string, value: string) => void
  isEditMode: boolean
  onEditTarget: (target: EditTarget) => void
  onAddSection: () => void
  onAddField: (sectionId: string) => void
  overallPercentage: number
  tabPercentages: Record<string, number>
  allTabs: TrackerTab[]
  disabled?: boolean
}

export function TabView({ allTabs, tab, onFieldChange, onColumnValueChange, isEditMode, onEditTarget, onAddSection, onAddField, overallPercentage, tabPercentages, disabled = false }: Props) {
  const fields = tab.sections.flatMap(section => section.fields)

  const totalWeight = fields.reduce((sum, field) => sum + field.weight, 0)
  const totalProgress = fields.reduce((sum, field) => {
    let contribution = 0
    if (field.type === "checkbox") contribution = field.checked ? 1 : 0
    else if (field.type === "number") contribution = field.value / field.max
    else if (field.type === "dropdown") contribution = field.selected === -1 ? 0 : field.selected / (field.options.length - 1)
    return sum + (contribution * field.weight)
  }, 0)
  const percentage = totalWeight === 0 ? 0 : (totalProgress / totalWeight) * 100

  function getFieldCompletion(fieldId: string): boolean {
    const field = allTabs.flatMap(t => t.sections.flatMap(s => s.fields)).find(f => f.id === fieldId)
    if (!field) return false
    if (field.type === "checkbox") return field.checked
    if (field.type === "number") return field.value >= field.max
    if (field.type === "dropdown") return field.selected === field.options.length - 1
    return false
  }

  function getFieldLabel(fieldId: string): string {
    return allTabs.flatMap(t => t.sections.flatMap(s => s.fields)).find(f => f.id === fieldId)?.label ?? 'a specific field'
  }

  function getUnlockMessage(condition: TabUnlockCondition | SectionUnlockCondition): string {
    if (condition.type === "overall") return `${condition.percentage}% overall completion is reached`
    if (condition.type === "tab") return `${condition.percentage}% completion of "${allTabs.find(t => t.id === condition.tabId)?.title ?? 'another tab'}" is reached`
    return `"${getFieldLabel(condition.fieldId ?? '')}" is complete`
  }

  const isTabLocked = !isEditMode && tab.unlockCondition !== undefined && (
    tab.unlockCondition.type === "overall"
      ? overallPercentage < (tab.unlockCondition.percentage ?? 0)
      : tab.unlockCondition.type === "tab"
      ? (tabPercentages[tab.unlockCondition.tabId ?? ''] ?? 0) < (tab.unlockCondition.percentage ?? 0)
      : !getFieldCompletion(tab.unlockCondition.fieldId ?? '')
  )

  return (
    <div>
        {isTabLocked && (
          <p style={{ color: 'var(--color-text-muted)', padding: '16px' }}>
            🔒 This tab unlocks when {getUnlockMessage(tab.unlockCondition!)}
          </p>
        )}
      <div style={{ opacity: isTabLocked ? 0.5 : 1, position: 'relative' }}>
        {isTabLocked && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 10,
            cursor: 'not-allowed'
          }} />
        )}
        <Meter label="Tab Progress" value={percentage} maxValue={100} />
        {tab.sections.map(section => {
          const isSectionLocked = !isEditMode && section.unlockCondition !== undefined && (
            section.unlockCondition.type === "overall"
              ? overallPercentage < section.unlockCondition.percentage!
              : section.unlockCondition.type === "tab"
              ? (tabPercentages[section.unlockCondition.tabId ?? ''] ?? 0) < section.unlockCondition.percentage!
              : section.unlockCondition.type === "field" && 'fieldId' in section.unlockCondition
              ? !getFieldCompletion((section.unlockCondition as any).fieldId ?? '')
              : false
          )
          const isLockedByTab = !isEditMode && isTabLocked
          const isLocked = isSectionLocked || isLockedByTab

          return (
            <div key={section.id} style={{ opacity: isLocked ? 0.5 : 1, position: 'relative' }}>
              {isLocked && (
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  zIndex: 1,
                  borderRadius: '12px',
                  backgroundColor: 'rgba(0,0,0,0.05)'
                }}>
                  <p style={{ fontWeight: 600 }}>
                    🔒 Unlocks when {isLockedByTab ? getUnlockMessage(tab.unlockCondition!) : getUnlockMessage(section.unlockCondition!)}
                  </p>
                </div>
              )}
              <div style={{ pointerEvents: isLocked ? 'none' : 'auto' }}>
                <TrackerSectionView
                  section={section}
                  onFieldChange={(fieldId, value) => onFieldChange(section.id, fieldId, value)}
                  onColumnValueChange={(fieldId, columnId, value) => onColumnValueChange(section.id, fieldId, columnId, value)}
                  isEditMode={isEditMode}
                  onEditTarget={onEditTarget}
                  tabId={tab.id}
                  onAddField={onAddField}
                  disabled={disabled}
                />
              </div>
            </div>
          )
        })}
        {isEditMode && <button onClick={onAddSection}>+ Section</button>}
      </div>
    </div>
  )
}