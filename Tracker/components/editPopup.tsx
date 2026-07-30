import { useState } from "react"
import { EditTarget, SectionUnlockCondition, TabUnlockCondition, Tracker, TrackerField } from "@/Types/field"

type Props = {
  target: EditTarget
  onSave: (updated: EditTarget) => void
  tracker: Tracker
  onDelete: () => void
  onClose: () => void
}

export function EditPopup({ tracker, target, onSave, onDelete, onClose }: Props) {
  const [confirming, setConfirming] = useState(false)

  const [title, setTitle] = useState(
    target.type === "field" ? target.item.label : target.item.title
  )
  const [fieldType, setFieldType] = useState(
    target.type === "field" ? target.item.type : "checkbox"
  )
  const [max, setMax] = useState(
    target.type === "field" && target.item.type === "number" ? target.item.max : 0
  )
  const [weight, setWeight] = useState(
    target.type === "field" ? target.item.weight : 1
  )
  const [isPublic, setIsPublic] = useState(
    target.type === "tracker" ? target.item.is_public : false
  )
  const [columns, setColumns] = useState(
    target.type === "section" ? target.item.columns : []
  )
  const [options, setOptions] = useState(
    target.type === "field" && target.item.type === "dropdown" 
      ? target.item.options 
      : ['Option 1', 'Option 2']
  )
  const [unlockCondition, setUnlockCondition] = useState<TabUnlockCondition | SectionUnlockCondition | undefined>(
    target.type === "tab" || target.type === "section" ? target.item.unlockCondition : undefined
  )

  
  function handleSave() {
    if (target.type === "tracker") {
      onSave({ ...target, item: { ...target.item, title, is_public: isPublic } })
      } else if (target.type === "tab") {
        onSave({ ...target, item: { ...target.item, title, unlockCondition: unlockCondition as TabUnlockCondition } })
      } else if (target.type === "section") {
      onSave({ ...target, item: { ...target.item, title, columns, unlockCondition: unlockCondition as any } })
      } else if (target.type === "field") {
      const updatedField: TrackerField = fieldType === "checkbox"
        ? { ...target.item, label: title, type: "checkbox", checked: target.item.type === "checkbox" ? target.item.checked : false, weight, columnValues: target.item.columnValues }
        : fieldType === "number"
        ? { ...target.item, label: title, type: "number", value: target.item.type === "number" ? target.item.value : 0, max, weight, columnValues: target.item.columnValues }
        : { ...target.item, label: title, type: "dropdown", options, selected: target.item.type === "dropdown" ? target.item.selected : 0, weight, columnValues: target.item.columnValues }
      onSave({ ...target, item: updatedField })
    }
  }

  function getDeleteWarning() {
    if (target.type === "tab") return "This will delete the tab and all its sections and fields."
    if (target.type === "section") return "This will delete the section and all its fields."
    return "This will delete this field."
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px',
      zIndex: 1000
    }}>
    <div style={{
      backgroundColor: 'var(--color-background)',
      borderRadius: '12px',
      padding: '24px',
      width: '100%',
      maxWidth: '500px',
      maxHeight: '90vh',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      color: 'var(--color-text)'
    }}>
        <h2 style={{ margin: 0 }}>Edit {target.type}</h2>

        {!confirming ? (
          <>
            <label>
              {target.type === "field" ? "Label" : "Title"}
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                style={{ display: 'block', width: '100%', marginTop: '4px' }}
              />
            </label>
            
            
            {target.type === "tracker" && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={e => setIsPublic(e.target.checked)}
                />
                Make this tracker public
              </label>
            )}
            {(target.type === "tab" || target.type === "section") && (
              <div>
                <label>
                  Unlock Condition
                  <select
                    value={unlockCondition?.type ?? 'none'}
                    onChange={e => {
                      const type = e.target.value
                      if (type === 'none') setUnlockCondition(undefined)
                      else if (type === 'overall') setUnlockCondition({ type: 'overall', percentage: 50 })
                      else if (type === 'tab') setUnlockCondition({ type: 'tab', tabId: '', percentage: 50 })
                      else if (type === 'field') setUnlockCondition({ type: 'field', fieldId: '' })
                    }}
                    style={{ display: 'block', width: '100%', marginTop: '4px' }}
                  >
                  <option value="none">No lock</option>
                  <option value="overall">Overall completion %</option>
                  <option value="tab">Another tab's completion %</option>
                  <option value="field">Specific field complete</option>
                  </select>
                </label>

                {unlockCondition?.type === 'overall' && (
                  <label>
                    Percentage
                    <input
                      type="number"
                      value={unlockCondition.percentage}
                      min={0}
                      max={100}
                      onChange={e => setUnlockCondition({ ...unlockCondition, percentage: Number(e.target.value) })}
                      style={{ display: 'block', width: '100%', marginTop: '4px' }}
                    />
                  </label>
                )}

                {unlockCondition?.type === 'tab' && (
                  <>
                    <label>
                      Tab
                      <select
                        value={unlockCondition.tabId ?? ''}
                        onChange={e => setUnlockCondition({ ...unlockCondition, tabId: e.target.value })}
                        style={{ display: 'block', width: '100%', marginTop: '4px' }}
                      >
                        <option value="">Select a tab...</option>
                        {tracker.tabs.map(tab => (
                          <option key={tab.id} value={tab.id}>{tab.title}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Percentage
                      <input
                        type="number"
                        value={unlockCondition.percentage}
                        min={0}
                        max={100}
                        onChange={e => setUnlockCondition({ ...unlockCondition, percentage: Number(e.target.value) })}
                        style={{ display: 'block', width: '100%', marginTop: '4px' }}
                      />
                    </label>
                  </>
                )}

                {unlockCondition?.type === 'field' && (
                  <label>
                    Field
                    <select
                      value={(unlockCondition as any).fieldId ?? ''}
                      onChange={e => setUnlockCondition({ ...unlockCondition, fieldId: e.target.value } as any)}
                      style={{ display: 'block', width: '100%', marginTop: '4px' }}
                    >
                      <option value="">Select a field...</option>
                      {tracker.tabs.flatMap(tab =>
                        tab.sections.flatMap(section =>
                          section.fields.map(field => (
                            <option key={field.id} value={field.id}>
                              {tab.title} → {section.title} → {field.label}
                            </option>
                          ))
                        )
                      )}
                    </select>
                  </label>
                )}
                <small style={{ color: 'var(--color-text-muted)' }}>
                  {target.type === "tab"
                    ? "Locks this tab until the condition is met"
                    : "Locks this section until the condition is met"}
                </small>
              </div>
            )}
            {target.type === "section" && (
              <div>
                <p style={{ margin: '0 0 8px 0', fontWeight: 600 }}>Extra Columns</p>
                {columns.map((col, index) => (
                  <div key={col.id} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                      <input
                        value={col.label}
                        onChange={e => setColumns(prev => prev.map((c, i) =>
                          i === index ? { ...c, label: e.target.value } : c
                        ))}
                        placeholder="Column name"
                        style={{ flex: 1, padding: '4px' }}
                      />
                      <select
                        value={col.type}
                        onChange={e => setColumns(prev => prev.map((c, i) =>
                          i === index ? { ...c, type: e.target.value as "text" | "image" | "dropdown", options: e.target.value === 'dropdown' ? (c.options ?? ['Option 1', 'Option 2']) : c.options } : c
                        ))}
                        style={{ padding: '4px' }}
                      >
                        <option value="text">Text</option>
                        <option value="image">Image</option>
                        <option value="dropdown">Dropdown</option>
                      </select>
                      <button onClick={() => setColumns(prev => prev.filter((_, i) => i !== index))}
                        style={{ color: 'red' }}>✕</button>
                    </div>
                    {col.type === 'dropdown' && (
                      <div style={{ paddingLeft: '8px' }}>
                        {(col.options ?? []).map((option, optIndex) => (
                          <div key={optIndex} style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                            <input
                              value={option}
                              onChange={e => setColumns(prev => prev.map((c, i) =>
                                i !== index ? c : { ...c, options: (c.options ?? []).map((o, oi) => oi === optIndex ? e.target.value : o) }
                              ))}
                              placeholder={`Option ${optIndex + 1}`}
                              style={{ flex: 1, padding: '4px' }}
                            />
                            <button onClick={() => setColumns(prev => prev.map((c, i) =>
                              i !== index ? c : { ...c, options: (c.options ?? []).filter((_, oi) => oi !== optIndex) }
                            ))} style={{ color: 'red' }}>✕</button>
                          </div>
                        ))}
                        <button onClick={() => setColumns(prev => prev.map((c, i) =>
                          i !== index ? c : { ...c, options: [...(c.options ?? []), ''] }
                        ))}>+ Add Option</button>
                      </div>
                    )}
                  </div>
                ))}
                <button onClick={() => setColumns(prev => [...prev, {
                  id: crypto.randomUUID(),
                  label: 'New Column',
                  type: 'text' as const
                }])}>+ Add Column</button>
              </div>
            )}
            {target.type === "field" && (
              <>
                <label>
                  Type
                  <select
                    value={fieldType}
                    onChange={e => setFieldType(e.target.value as "checkbox" | "number" | "dropdown")}
                    style={{ display: 'block', width: '100%', marginTop: '4px' }}
                  >
                    <option value="checkbox">Checkbox</option>
                    <option value="number">Number</option>
                    <option value="dropdown">Dropdown</option>
                  </select>
                </label>

                {fieldType === "number" && (
                  <label>
                    Max Value
                    <input
                      type="number"
                      value={max}
                      onChange={e => setMax(Number(e.target.value))}
                      style={{ display: 'block', width: '100%', marginTop: '4px' }}
                    />
                  </label>
                )}
                <label>
                  Weight
                  <input
                    type="number"
                    value={weight}
                    onChange={e => setWeight(Number(e.target.value))}
                    style={{ display: 'block', width: '100%', marginTop: '4px' }}
                  />
                </label>
              </>
            )}
            {fieldType === "dropdown" && (
              <div>
                <p style={{ margin: '0 0 8px 0', fontWeight: 600 }}>Options</p>
                {options.map((option, index) => (
                  <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input
                      value={option}
                      onChange={e => setOptions(prev => prev.map((o, i) => i === index ? e.target.value : o))}
                      placeholder={`Option ${index + 1}`}
                      style={{ flex: 1, padding: '4px' }}
                    />
                    <button onClick={() => setOptions(prev => prev.filter((_, i) => i !== index))} style={{ color: 'red' }}>✕</button>
                  </div>
                ))}
                <button onClick={() => setOptions(prev => [...prev, ''])}>+ Add Option</button>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              {target.type !== "tracker" && (
                <button onClick={() => setConfirming(true)} style={{ color: 'red' }}>
                  Delete
                </button>
              )}
              <button onClick={onClose}>Cancel</button>
              <button onClick={handleSave}>Save</button>
            </div>
          </>
        ) : (
          <>
            <p>{getDeleteWarning()}</p>
            <p>Are you sure?</p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirming(false)}>Go Back</button>
              <button onClick={onDelete} style={{ color: 'red' }}>Confirm Delete</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}