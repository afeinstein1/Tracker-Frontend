export interface Field{
    id: string
    label: string
    weight: number
}

export interface CheckboxField extends Field{
    type: "checkbox"
    checked: boolean
}

export interface NumberField extends Field{
    type: "number"
    value: number
    max: number
}

export type TrackerField =
    | CheckboxField
    | NumberField


export interface TrackerSection {
  id: string
  title: string
  fields: TrackerField[]
}

export interface TrackerTab {
  id: string
  title: string
  sections: TrackerSection[]
}

export interface Tracker {
  id: string
  title: string
  is_public: boolean
  tabs: TrackerTab[]
}
export type EditTarget =
  | { type: "tracker"; item: Tracker }
  | { type: "tab"; item: TrackerTab }
  | { type: "section"; item: TrackerSection; tabId: string }
  | { type: "field"; item: TrackerField; sectionId: string }