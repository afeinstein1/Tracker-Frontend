import { useState } from 'react'
import {NumberField, Label, Input, Button, Group} from 'react-aria-components'

export function ProgressNumber({ label, max }: { label: string, max: number }) {
  const [value, setValue] = useState(0)
  
  return (
    <NumberField 
      value={value} 
      onChange={setValue}
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