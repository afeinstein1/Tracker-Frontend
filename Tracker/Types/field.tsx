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
export interface DropdownField extends Field {
  type: "dropdown"
  options: string[]
  selected: number 
}
export type TrackerField = CheckboxField | NumberField | DropdownField


export interface TabUnlockCondition {
  type: "overall" | "tab" | "field"
  tabId?: string
  fieldId?: string
  percentage?: number
}

export interface SectionUnlockCondition {
  type: "overall" | "tab" | "field"
  tabId?: string
  fieldId?: string
  percentage?: number  
}

export interface SectionColumn {
  id: string
  label: string
  type: "text" | "image" | "dropdown"
  options?: string[]
}
export interface TrackerSection {
  id: string
  title: string
  columns: SectionColumn[]
  fields: TrackerField[]
  unlockCondition?: TabUnlockCondition  
}

export interface TrackerTab {
  id: string
  title: string
  sections: TrackerSection[]
  unlockCondition?: TabUnlockCondition  
}

export interface Tracker {
  id: string
  title: string
  is_public: boolean
  owner_id: string
  tabs: TrackerTab[]
}

export type EditTarget =
  | { type: "tracker"; item: Tracker }
  | { type: "tab"; item: TrackerTab }
  | { type: "section"; item: TrackerSection; tabId: string }
  | { type: "field"; item: TrackerField; sectionId: string }