import { CheckboxField } from "@/Types/field"
import { useState } from "react"
import { Checkbox } from 'react-aria-components'

type Props = {
  field: CheckboxField
  onChange: (checked: boolean) => void
  disabled?: boolean
}


export function CheckboxFieldView({ field, onChange, disabled = false }: Props) {
  const [checked, setChecked] = useState(field.checked)

  function handleChange(newChecked: boolean) {
    setChecked(newChecked)
    onChange(newChecked)
  }

  return (
    <Checkbox 
      isSelected={checked}
      isDisabled={disabled}
      onChange={handleChange}
      style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: disabled ? 'default' : 'pointer' }}
    >
      <div style={{
        width: '18px',
        height: '18px',
        borderRadius: 'var(--border-radius-sm)',
        border: checked ? '2px solid var(--color-accent)' : '2px solid var(--color-border)',
        backgroundColor: checked ? 'var(--color-accent)' : 'var(--color-surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.5 : 1,
        transition: 'background-color 0.15s, border-color 0.15s'
      }}>
        {checked && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6L4.5 8.5L10 3" stroke="var(--color-accent-text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      {field.label}
    </Checkbox>
  )
}