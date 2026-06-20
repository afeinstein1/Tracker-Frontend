import { CheckboxFieldView } from "@/components/CheckboxField"
import { ProgressNumber } from "@/components/NumberField"
import { TrackerField } from "@/Types/field"

export function renderField(field: TrackerField, onFieldChange: (fieldId: string, value: boolean | number) => void) {
  switch (field.type) {
    case "checkbox":
      return (
        <CheckboxFieldView
          field={field}
          onChange={(checked) => onFieldChange(field.id, checked)}
        />
      )
    case "number":
      return (
        <ProgressNumber 
          label={field.label} 
          max={field.max} 
          value={field.value}
          onChange={(value) => onFieldChange(field.id, value)}
        />
      )
  }
}