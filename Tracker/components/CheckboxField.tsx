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
        border: '2px solid black',
        backgroundColor: checked ? 'black' : 'white',
        opacity: disabled ? 0.5 : 1
      }} />
      {field.label}
    </Checkbox>
  )
}