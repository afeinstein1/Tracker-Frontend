import { supabase } from './supabase'
import { Tracker, TrackerTab, TrackerSection, TrackerField } from '@/Types/field'

export async function saveTracker(tracker: Tracker): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()

  
  if (!user) throw new Error('Not authenticated')

  // Save tracker
 const { error: trackerError } = await supabase
    .from('trackers')
    .upsert({ id: tracker.id, owner_id: user.id, title: tracker.title, is_public: tracker.is_public })

  // Save tabs
  for (const [tabIndex, tab] of tracker.tabs.entries()) {
    const { error: tabError } = await supabase
      .from('tracker_tabs')
      .upsert({ id: tab.id, tracker_id: tracker.id, title: tab.title, order: tabIndex })
    if (tabError) throw tabError

    // Save sections
    for (const [sectionIndex, section] of tab.sections.entries()) {
      const { error: sectionError } = await supabase
        .from('tracker_sections')
        .upsert({ id: section.id, tab_id: tab.id, title: section.title, order: sectionIndex })
      if (sectionError) throw sectionError

      // Save fields
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

export async function loadTracker(trackerId: string): Promise<Tracker> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Load tracker
  const { data: trackerData, error: trackerError } = await supabase
    .from('trackers')
    .select('*')
    .eq('id', trackerId)
    .single()
  if (trackerError) throw trackerError

  // Load tabs
  const { data: tabsData, error: tabsError } = await supabase
    .from('tracker_tabs')
    .select('*')
    .eq('tracker_id', trackerId)
    .order('order')
  if (tabsError) throw tabsError

  // Load sections
  const { data: sectionsData, error: sectionsError } = await supabase
    .from('tracker_sections')
    .select('*')
    .in('tab_id', tabsData.map(tab => tab.id))
    .order('order')
  if (sectionsError) throw sectionsError

  // Load fields
  const { data: fieldsData, error: fieldsError } = await supabase
    .from('tracker_fields')
    .select('*')
    .in('section_id', sectionsData.map(section => section.id))
    .order('order')
  if (fieldsError) throw fieldsError

  // Load values for this user
  const { data: valuesData, error: valuesError } = await supabase
    .from('tracker_values')
    .select('*')
    .in('field_id', fieldsData.map(field => field.id))
    .eq('user_id', user.id)
  if (valuesError) throw valuesError

  // Assemble into Tracker shape
  const tabs: TrackerTab[] = tabsData.map(tab => ({
    id: tab.id,
    title: tab.title,
    sections: sectionsData
      .filter(section => section.tab_id === tab.id)
      .map(section => ({
        id: section.id,
        title: section.title,
        fields: fieldsData
          .filter(field => field.section_id === section.id)
          .map(field => {
            const value = valuesData.find(v => v.field_id === field.id)
            if (field.type === 'checkbox') {
              return {
                id: field.id,
                label: field.label,
                type: 'checkbox' as const,
                checked: value?.checked ?? false,
                weight: field.weight
              }
            } else {
              return {
                id: field.id,
                label: field.label,
                type: 'number' as const,
                value: value?.value ?? 0,
                max: field.max,
                weight: field.weight
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
    .insert({ id: newTracker.id, owner_id: user.id, title: newTracker.title })
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
    tabs: original.tabs.map(tab => ({
      ...tab,
      id: crypto.randomUUID(),
      sections: tab.sections.map(section => ({
        ...section,
        id: crypto.randomUUID(),
        fields: section.fields.map(field => ({
          ...field,
          id: crypto.randomUUID()
        }))
      }))
    }))
  }

  await saveTracker(copied)
  return copied
}