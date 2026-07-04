import { DropdownField } from "@/Types/field"
import { Label } from '@/components/form'

type Props = {
  field: DropdownField
  onChange: (selected: number) => void
  disabled?: boolean
}
export function DropdownFieldView({ field, onChange, disabled = false }: Props) {
  return (
    <div>
      <Label style={{ display: 'block', marginBottom: '4px' }}>{field.label}</Label>
      <select
        value={field.selected}
        onChange={e => onChange(Number(e.target.value))}
        disabled={disabled}
        style={{ width: '150px', padding: '4px' }}
      >
        {field.options.map((option, index) => (   
          <option key={index} value={index}>{option}</option>
        ))}
      </select>
    </div>
  )
}