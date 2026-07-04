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
      <Label style={{ display: 'block', marginBottom: '4px' }}>{label}</Label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Group style={{ display: 'flex', alignItems: 'center' }}>
          <Button slot="decrement">-</Button>
          <Input style={{ width: '50px', textAlign: 'center' }} />
          <Button slot="increment">+</Button>
        </Group>
        <span style={{ color: 'var(--color-text-muted)' }}>/ {max}</span>
      </div>
    </NumberField>
  )
}