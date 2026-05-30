import { CheckboxField } from "@/Types/field"
import { useState } from "react"
import { Checkbox } from 'react-aria-components'

type Props = {
  field: CheckboxField
  onChange: (checked: boolean) => void
}

export function CheckboxFieldView({ field }: Props) {
  const [checked, setChecked] = useState(field.checked)

  return (
    <Checkbox 
      isSelected={checked}
      onChange={setChecked}
      style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
    >
      <div style={{
        width: '18px',
        height: '18px',
        border: '2px solid black',
        backgroundColor: checked ? 'black' : 'white'
      }} />
      {field.label}
    </Checkbox>
  )
}