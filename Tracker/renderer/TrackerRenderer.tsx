import { Tracker } from "@/Types/field"
import { TabView } from "./TabRenderer"
import { Meter } from "@/components/Meter"
import { useState } from "react"

type Props = {
  tracker: Tracker
}

export function TrackerView({ tracker: initialTracker }: Props) {
  const [tracker, setTracker] = useState(initialTracker)
  const [activeTab, setActiveTab] = useState(0)

  function handleFieldChange(tabId: string, sectionId: string, fieldId: string, value: boolean | number) {
    setTracker((prev: Tracker) => ({
      ...prev,
      tabs: prev.tabs.map(tab =>
        tab.id !== tabId ? tab : {
          ...tab,
          sections: tab.sections.map(section =>
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
        }
      )
    }))
  }

  const fields = tracker.tabs.flatMap(tab => tab.sections.flatMap(section => section.fields))

  const totalProgress = fields.reduce((sum, field) => {
    if (field.type === "checkbox") return sum + (field.checked ? 1 : 0)
    if (field.type === "number") return sum + (field.value / field.max)
    return sum
  }, 0)

  const percentage = fields.length === 0 ? 0 : (totalProgress / fields.length) * 100

  return (
    <div style={{ width: '90%', margin: '0 auto' }}>
      <h1>{tracker.title}</h1>
      <Meter label="Overall Progress" value={Math.round(percentage)} maxValue={100} />
      <div>
        {tracker.tabs.map((tab, index) => (
          <button key={tab.id} onClick={() => setActiveTab(index)}>
            {tab.title}
          </button>
        ))}
      </div>
      <TabView
        tab={tracker.tabs[activeTab]}
        onFieldChange={(sectionId, fieldId, value) => handleFieldChange(tracker.tabs[activeTab].id, sectionId, fieldId, value)}
      />
    </div>
  )
}