import { CheckboxFieldView } from "@/components/CheckboxField"
import { ProgressNumber } from "@/components/NumberField"
import {TrackerField} from "@/Types/field"

export function renderField(field: TrackerField) {
    switch(field.type) {
        case "checkbox":
            return(
                <CheckboxFieldView
                field={field}
                onChange={() => {}}
                />
                )
           

        case "number":
            return(
                <ProgressNumber label={field.label} max={field.max} />
            )
    }
}