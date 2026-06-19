import { EditTarget, Tracker, TrackerField, TrackerSection, TrackerTab } from "@/Types/field"
import { TabView } from "./TabRenderer"
import { Meter } from "@/components/Meter"
import { useState } from "react"
import { EditPopup } from "@/components/editPopup"

type Props = {
  tracker: Tracker
}

export function TrackerView({ tracker: initialTracker }: Props) {
  const [tracker, setTracker] = useState(initialTracker)
  const [activeTab, setActiveTab] = useState(0)
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)

  function handleTrackerEdit(updatedTracker: Tracker) {
    setTracker(updatedTracker)
    setEditTarget(null)
  }

  function handleTabEdit(updatedTab: TrackerTab) {
    setTracker(prev => ({
      ...prev,
      tabs: prev.tabs.map(tab => tab.id === updatedTab.id ? updatedTab : tab)
    }))
    setEditTarget(null)
  }

  function handleSectionEdit(tabId: string, updatedSection: TrackerSection) {
    setTracker(prev => ({
      ...prev,
      tabs: prev.tabs.map(tab =>
        tab.id !== tabId ? tab : {
          ...tab,
          sections: tab.sections.map(section =>
            section.id === updatedSection.id ? updatedSection : section
          )
        }
      )
    }))
    setEditTarget(null)
  }

  function handleFieldEdit(sectionId: string, updatedField: TrackerField) {
    const tabId = tracker.tabs[activeTab].id
    setTracker(prev => ({
      ...prev,
      tabs: prev.tabs.map(tab =>
        tab.id !== tabId ? tab : {
          ...tab,
          sections: tab.sections.map(section =>
            section.id !== sectionId ? section : {
              ...section,
              fields: section.fields.map(field =>
                field.id === updatedField.id ? updatedField : field
              )
            }
          )
        }
      )
    }))
    setEditTarget(null)
  }
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
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <h1>{tracker.title}</h1>
      {isEditMode && (
        <button onClick={() => setEditTarget({ type: "tracker", item: tracker })}>✏️</button>
      )}
      <button onClick={() => setIsEditMode(!isEditMode)} style={{ marginLeft: 'auto' }}>
        {isEditMode ? "Done" : "Edit"}
      </button>
    </div>

    <Meter label="Overall Progress" value={Math.round(percentage)} maxValue={100} />

    <div style={{ display: 'flex', gap: '8px' }}>
      {tracker.tabs.map((tab, index) => (
        <div key={tab.id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button onClick={() => setActiveTab(index)}>
            {tab.title}
          </button>
          {isEditMode && (
            <button onClick={() => setEditTarget({ type: "tab", item: tab })}>✏️</button>
          )}
        </div>
      ))}
      {isEditMode && <button>+ Tab</button>}
    </div>

    <TabView
      tab={tracker.tabs[activeTab]}
      onFieldChange={(sectionId, fieldId, value) => handleFieldChange(tracker.tabs[activeTab].id, sectionId, fieldId, value)}
      isEditMode={isEditMode}
      onEditTarget={setEditTarget}
    />

    {editTarget && (
      <EditPopup
        target={editTarget}
        onSave={(updated) => {
          if (updated.type === "tracker") handleTrackerEdit(updated.item)
          else if (updated.type === "tab") handleTabEdit(updated.item)
          else if (updated.type === "section") handleSectionEdit(tracker.tabs[activeTab].id, updated.item)
          else if (updated.type === "field") handleFieldEdit(updated.sectionId, updated.item)
        }}
        onDelete={() => {
          setEditTarget(null)
        }}
        onClose={() => setEditTarget(null)}
      />
    )}
  </div>
)
}



