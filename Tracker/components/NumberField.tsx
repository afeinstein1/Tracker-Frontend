import { useState } from 'react'
import {NumberField, Label, Input, Button, Group} from 'react-aria-components'

export function ProgressNumber({ label, max, onChange }: { label: string, max: number, onChange: (value: number) => void }) {
  const [value, setValue] = useState(0)

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