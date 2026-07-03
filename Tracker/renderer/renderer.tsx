import { CheckboxFieldView } from "@/components/CheckboxField"
import { DropdownFieldView } from "@/components/DropdownField"
import { ProgressNumber } from "@/components/NumberField"
import { TrackerField } from "@/Types/field"

export function renderField(field: TrackerField, onFieldChange: (fieldId: string, value: boolean | number) => void, disabled: boolean = false) {
  switch (field.type) {
    case "checkbox":
      return (
        <CheckboxFieldView
          field={field}
          onChange={(checked) => onFieldChange(field.id, checked)}
          disabled={disabled}
        />
      )
    case "number":
      return (
        <ProgressNumber 
          label={field.label} 
          max={field.max} 
          value={field.value}
          onChange={(value) => onFieldChange(field.id, value)}
          disabled={disabled}
        />
      )
      case "dropdown":
        return (
          <DropdownFieldView
            field={field}
            onChange={(selected) => onFieldChange(field.id, selected)}
            disabled={disabled}
          />
        )
  }
}