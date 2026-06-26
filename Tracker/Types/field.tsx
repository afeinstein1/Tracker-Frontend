export interface Field {
  id: string
  label: string
  weight: number
  columnValues: Record<string, string>
}

export interface CheckboxField extends Field {
  type: "checkbox"
  checked: boolean
}

export interface NumberField extends Field {
  type: "number"
  value: number
  max: number
}

export type TrackerField = CheckboxField | NumberField

export interface SectionColumn {
  id: string
  label: string
  type: "text" | "image"
}

export interface TrackerSection {
  id: string
  title: string
  columns: SectionColumn[]  // new
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