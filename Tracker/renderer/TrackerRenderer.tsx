import { CheckboxField, EditTarget, Tracker, TrackerField, TrackerSection, TrackerTab } from "@/Types/field"
import { TabView } from "./TabRenderer"
import { Meter } from "@/components/Meter"
import { useEffect, useState } from "react"
import { EditPopup } from "@/components/editPopup"

type Props = {
  tracker: Tracker
  onSave?: (tracker: Tracker) => void

}

export function TrackerView({ tracker: initialTracker, onSave,  }: Props) {
  const [tracker, setTracker] = useState(initialTracker)
  const [activeTab, setActiveTab] = useState(0)
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const tabPercentages = Object.fromEntries(
  tracker.tabs.map(tab => {
    const fields = tab.sections.flatMap(s => s.fields)
    const totalWeight = fields.reduce((sum, f) => sum + f.weight, 0)
    const totalProgress = fields.reduce((sum, field) => {
      let contribution = 0
      if (field.type === "checkbox") contribution = field.checked ? 1 : 0
      else if (field.type === "number") contribution = field.value / field.max
      else if (field.type === "dropdown") contribution = field.selected === -1 ? 0 : field.selected / (field.options.length - 1)
      return sum + (contribution * field.weight)
    }, 0)
    return [tab.id, totalWeight === 0 ? 0 : (totalProgress / totalWeight) * 100]
  })
)
  

  useEffect(() => {
    if (!onSave) return
    const timer = setTimeout(() => {
      onSave(tracker)
    }, 1500)
    return () => clearTimeout(timer)
  }, [tracker])


  function handleAddTab() {
    const newTab: TrackerTab = {
      id: crypto.randomUUID(),
      title: "New Tab",
      sections: []
    }
    setTracker(prev => ({
      ...prev,
      tabs: [...prev.tabs, newTab]
    }))
  }
  function handleColumnValueChange(tabId: string, sectionId: string, fieldId: string, columnId: string, value: string) {
    setTracker(prev => ({
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
                  columnValues: { ...field.columnValues, [columnId]: value }
                }
              )
            }
          )
        }
      )
    }))
  }

  function handleAddSection() {
    const newSection: TrackerSection = {
      id: crypto.randomUUID(),
      title: "New Section",
      columns: [],  // add this
      fields: []
    }
    const tabId = tracker.tabs[activeTab].id
    setTracker(prev => ({
      ...prev,
      tabs: prev.tabs.map(tab =>
        tab.id !== tabId ? tab : {
          ...tab,
          sections: [...tab.sections, newSection]
        }
      )
    }))
  }

  function handleAddField(sectionId: string) {
    const newField: CheckboxField = {
      id: crypto.randomUUID(),
      label: "New Field",
      type: "checkbox",
      checked: false,
      weight: 1,
      columnValues: {}
    }
    const tabId = tracker.tabs[activeTab].id
    setTracker(prev => ({
      ...prev,
      tabs: prev.tabs.map(tab =>
        tab.id !== tabId ? tab : {
          ...tab,
          sections: tab.sections.map(section =>
            section.id !== sectionId ? section : {
              ...section,
              fields: [...section.fields, newField]
            }
          )
        }
      )
    }))
    setEditTarget({ type: "field", item: newField, sectionId })
  }

  function handleTabDelete(tabId: string) {
    setTracker(prev => ({
      ...prev,
      tabs: prev.tabs.filter(tab => tab.id !== tabId)
    }))
    setActiveTab(prev => Math.min(prev, tracker.tabs.length - 2))
    setEditTarget(null)
    
  }

  function handleSectionDelete(tabId: string, sectionId: string) {
    setTracker(prev => ({
      ...prev,
      tabs: prev.tabs.map(tab =>
        tab.id !== tabId ? tab : {
          ...tab,
          sections: tab.sections.filter(section => section.id !== sectionId)
        }
      )
    }))
    setEditTarget(null)
  }

  function handleFieldDelete(sectionId: string, fieldId: string) {
    const tabId = tracker.tabs[activeTab].id
    setTracker(prev => ({
      ...prev,
      tabs: prev.tabs.map(tab =>
        tab.id !== tabId ? tab : {
          ...tab,
          sections: tab.sections.map(section =>
            section.id !== sectionId ? section : {
              ...section,
              fields: section.fields.filter(field => field.id !== fieldId)
            }
          )
        }
      )
    }))
    setEditTarget(null)
  }

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
                    : field.type === "number"
                    ? { value: value as number }
                    : { selected: value as number })
                                  }
              )
            }
          )
        }
      )
    }))
  }

  const fields = tracker.tabs.flatMap(tab => tab.sections.flatMap(section => section.fields))

  const totalWeight = fields.reduce((sum, field) => sum + field.weight, 0)

const totalProgress = fields.reduce((sum, field) => {
  let contribution = 0
  if (field.type === "checkbox") {
    contribution = field.checked ? 1 : 0
  } else if (field.type === "number") {
    contribution = field.value / field.max
  } else if (field.type === "dropdown") {
    contribution = field.selected === -1 ? 0 : field.selected / (field.options.length - 1)
  }
  return sum + (contribution * field.weight)
}, 0)

  const percentage = totalWeight === 0 ? 0 : (totalProgress / totalWeight) * 100



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
      {isEditMode && <button onClick={handleAddTab}>+ Tab</button>}
    </div>

    {tracker.tabs.length === 0 ? (
      <p>No tabs yet. {isEditMode ? "Click + Tab to add one." : "Click Edit to get started."}</p>
    ) : (
     <TabView
        tab={tracker.tabs[activeTab]}
        allTabs={tracker.tabs}
        onFieldChange={(sectionId, fieldId, value) => handleFieldChange(tracker.tabs[activeTab].id, sectionId, fieldId, value)}
        onColumnValueChange={(sectionId, fieldId, columnId, value) => handleColumnValueChange(tracker.tabs[activeTab].id, sectionId, fieldId, columnId, value)}
        isEditMode={isEditMode}
        onEditTarget={setEditTarget}
        onAddSection={handleAddSection}
        onAddField={handleAddField}
        overallPercentage={Math.round(percentage)}
        tabPercentages={tabPercentages}
      />
    )}

    {editTarget && (
      <EditPopup
        target={editTarget}
        tracker={tracker}
        onSave={(updated) => {
          if (updated.type === "tracker") handleTrackerEdit(updated.item)
          else if (updated.type === "tab") handleTabEdit(updated.item)
          else if (updated.type === "section") handleSectionEdit(tracker.tabs[activeTab].id, updated.item)
          else if (updated.type === "field") handleFieldEdit(updated.sectionId, updated.item)
        }}
        onDelete={() => {
          if (editTarget.type === "tab") handleTabDelete(editTarget.item.id)
          else if (editTarget.type === "section") handleSectionDelete(editTarget.tabId, editTarget.item.id)
          else if (editTarget.type === "field") handleFieldDelete(editTarget.sectionId, editTarget.item.id)
        }}
        onClose={() => setEditTarget(null)}
      />
    )}
  </div>
)
}



