import { supabase } from './supabase'
import { Tracker, TrackerTab, TrackerSection, TrackerField } from '@/Types/field'

export async function saveTracker(tracker: Tracker): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error: trackerError } = await supabase
    .from('trackers')
    .upsert({ id: tracker.id, owner_id: user.id, title: tracker.title, is_public: tracker.is_public })
  if (trackerError) throw trackerError

  for (const [tabIndex, tab] of tracker.tabs.entries()) {
    const { error: tabError } = await supabase
      .from('tracker_tabs')
      .upsert({ id: tab.id, tracker_id: tracker.id, title: tab.title, order: tabIndex })
    if (tabError) throw tabError

    for (const [sectionIndex, section] of tab.sections.entries()) {
      const { error: sectionError } = await supabase
        .from('tracker_sections')
        .upsert({ id: section.id, tab_id: tab.id, title: section.title, order: sectionIndex })
      if (sectionError) throw sectionError

      for (const [columnIndex, column] of section.columns.entries()) {
        const { error: columnError } = await supabase
          .from('section_columns')
          .upsert({ id: column.id, section_id: section.id, label: column.label, type: column.type, order: columnIndex })
        if (columnError) throw columnError
      }

      for (const [fieldIndex, field] of section.fields.entries()) {
        const { error: fieldError } = await supabase
          .from('tracker_fields')
          .upsert({
            id: field.id,
            section_id: section.id,
            label: field.label,
            type: field.type,
            weight: field.weight,
            max: field.type === 'number' ? field.max : null,
            order: fieldIndex
          })
        if (fieldError) throw fieldError
      }
    }
  }
}

export async function saveTrackerValues(tracker: Tracker): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const fields = tracker.tabs.flatMap(tab =>
    tab.sections.flatMap(section => section.fields)
  )

  for (const field of fields) {
    const { error } = await supabase
      .from('tracker_values')
      .upsert({
        field_id: field.id,
        user_id: user.id,
        checked: field.type === 'checkbox' ? field.checked : false,
        value: field.type === 'number' ? field.value : 0
      }, { onConflict: 'field_id,user_id' })
    if (error) throw error
  }
}

export async function saveColumnValues(tracker: Tracker): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const fields = tracker.tabs.flatMap(tab =>
    tab.sections.flatMap(section => section.fields)
  )

  for (const field of fields) {
    for (const [columnId, value] of Object.entries(field.columnValues)) {
      const { error } = await supabase
        .from('field_column_values')
        .upsert({
          field_id: field.id,
          column_id: columnId,
          user_id: user.id,
          value
        }, { onConflict: 'field_id,column_id,user_id' })
      if (error) throw error
    }
  }
}

export async function loadTracker(trackerId: string): Promise<Tracker> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: trackerData, error: trackerError } = await supabase
    .from('trackers')
    .select('*')
    .eq('id', trackerId)
    .single()
  if (trackerError) throw trackerError

  const { data: tabsData, error: tabsError } = await supabase
    .from('tracker_tabs')
    .select('*')
    .eq('tracker_id', trackerId)
    .order('order')
  if (tabsError) throw tabsError

  const { data: sectionsData, error: sectionsError } = await supabase
    .from('tracker_sections')
    .select('*')
    .in('tab_id', tabsData.map(tab => tab.id))
    .order('order')
  if (sectionsError) throw sectionsError

  const { data: fieldsData, error: fieldsError } = await supabase
    .from('tracker_fields')
    .select('*')
    .in('section_id', sectionsData.map(section => section.id))
    .order('order')
  if (fieldsError) throw fieldsError

  const { data: valuesData, error: valuesError } = await supabase
    .from('tracker_values')
    .select('*')
    .in('field_id', fieldsData.map(field => field.id))
    .eq('user_id', user.id)
  if (valuesError) throw valuesError

  const { data: columnsData, error: columnsError } = await supabase
    .from('section_columns')
    .select('*')
    .in('section_id', sectionsData.map(section => section.id))
    .order('order')
  if (columnsError) throw columnsError

  const { data: columnValuesData, error: columnValuesError } = await supabase
    .from('field_column_values')
    .select('*')
    .in('field_id', fieldsData.map(field => field.id))
    .eq('user_id', user.id)
  if (columnValuesError) throw columnValuesError

  const tabs: TrackerTab[] = tabsData.map(tab => ({
    id: tab.id,
    title: tab.title,
    sections: sectionsData
      .filter(section => section.tab_id === tab.id)
      .map(section => ({
        id: section.id,
        title: section.title,
        columns: columnsData
          .filter((col: any) => col.section_id === section.id)
          .map((col: any) => ({
            id: col.id,
            label: col.label,
            type: col.type as "text" | "image"
          })),
        fields: fieldsData
          .filter(field => field.section_id === section.id)
          .map(field => {
            const value = valuesData.find((v: any) => v.field_id === field.id)
            const columnValues = Object.fromEntries(
              columnValuesData
                .filter((cv: any) => cv.field_id === field.id)
                .map((cv: any) => [cv.column_id, cv.value ?? ''])
            )
            if (field.type === 'checkbox') {
              return {
                id: field.id,
                label: field.label,
                type: 'checkbox' as const,
                checked: value?.checked ?? false,
                weight: field.weight,
                columnValues
              }
            } else {
              return {
                id: field.id,
                label: field.label,
                type: 'number' as const,
                value: value?.value ?? 0,
                max: field.max,
                weight: field.weight,
                columnValues
              }
            }
          })
      }))
  }))

  return {
    id: trackerData.id,
    title: trackerData.title,
    is_public: trackerData.is_public,
    tabs
  }
}

export async function loadUserTrackers(): Promise<Tracker[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('trackers')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })
  if (error) throw error

  return Promise.all(data.map(tracker => loadTracker(tracker.id)))
}

export async function loadPublicTrackers(): Promise<Tracker[]> {
  const { data, error } = await supabase
    .from('trackers')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
  if (error) throw error

  return Promise.all(data.map(tracker => loadTracker(tracker.id)))
}

export async function deleteTracker(trackerId: string): Promise<void> {
  const { error } = await supabase
    .from('trackers')
    .delete()
    .eq('id', trackerId)
  if (error) throw error
}

export async function createTracker(title: string): Promise<Tracker> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const newTracker: Tracker = {
    id: crypto.randomUUID(),
    title,
    is_public: false,
    tabs: []
  }
  const { error } = await supabase
    .from('trackers')
    .insert({ id: newTracker.id, owner_id: user.id, title: newTracker.title, is_public: false })
  if (error) throw error

  return newTracker
}

export async function copyTracker(trackerId: string): Promise<Tracker> {
  const original = await loadTracker(trackerId)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const copied: Tracker = {
    ...original,
    id: crypto.randomUUID(),
    title: `${original.title} (copy)`,
    is_public: false,
    tabs: original.tabs.map(tab => ({
      ...tab,
      id: crypto.randomUUID(),
      sections: tab.sections.map(section => ({
        ...section,
        id: crypto.randomUUID(),
        columns: section.columns.map(col => ({
          ...col,
          id: crypto.randomUUID()
        })),
        fields: section.fields.map(field => ({
          ...field,
          id: crypto.randomUUID(),
          columnValues: {}
        }))
      }))
    }))
  }

  await saveTracker(copied)
  return copied
}