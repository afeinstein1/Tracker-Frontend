import { useState } from 'react'
import {NumberField, Label, Input, Button, Group} from 'react-aria-components'

export function ProgressNumber({ label, max, onChange, value: initialValue, disabled = false }: { label: string, max: number, onChange: (value: number) => void, value: number, disabled?: boolean }) {
  const [value, setValue] = useState(initialValue)

  function handleChange(newValue: number) {
    setValue(newValue)
    onChange(newValue)
  }
  
  return (
    <NumberField 
      value={value} 
      onChange={handleChange}
      minValue={0}
      maxValue={max}
      isDisabled={disabled}
    >
      <Label>{label}</Label>
      <Group>
        <Button slot="decrement">-</Button>
        <Input />
        <Button slot="increment">+</Button>
      </Group>
      <span>/ {max}</span>
    </NumberField>
  )
}