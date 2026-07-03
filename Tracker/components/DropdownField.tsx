import { DropdownField } from "@/Types/field"

type Props = {
  field: DropdownField
  onChange: (selected: number) => void
  disabled?: boolean
}
export function DropdownFieldView({ field, onChange, disabled = false }: Props) {
  return (
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
  )
}