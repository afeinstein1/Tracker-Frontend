import { useState } from "react"
import { EditTarget, TrackerField } from "@/Types/field"

type Props = {
  target: EditTarget
  onSave: (updated: EditTarget) => void
  onDelete: () => void
  onClose: () => void
}

export function EditPopup({ target, onSave, onDelete, onClose }: Props) {
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

  function handleSave() {
    if (target.type === "tracker") {
      onSave({ ...target, item: { ...target.item, title } })
    } else if (target.type === "tab") {
      onSave({ ...target, item: { ...target.item, title } })
    } else if (target.type === "section") {
      onSave({ ...target, item: { ...target.item, title } })
    } else if (target.type === "field") {
      const updatedField: TrackerField = fieldType === "checkbox"
        ? { ...target.item, label: title, type: "checkbox", checked: target.item.type === "checkbox" ? target.item.checked : false }
        : { ...target.item, label: title, type: "number", value: target.item.type === "number" ? target.item.value : 0, max }
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
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        minWidth: '300px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
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

            {target.type === "field" && (
              <>
                <label>
                  Type
                  <select
                    value={fieldType}
                    onChange={e => setFieldType(e.target.value as "checkbox" | "number")}
                    style={{ display: 'block', width: '100%', marginTop: '4px' }}
                  >
                    <option value="checkbox">Checkbox</option>
                    <option value="number">Number</option>
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
              </>
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