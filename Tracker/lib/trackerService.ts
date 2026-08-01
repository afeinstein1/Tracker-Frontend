import { supabase } from './supabase'
import { Tracker, TrackerTab, TrackerSection, TrackerField, TabUnlockCondition, SectionUnlockCondition } from '@/Types/field'
import { isPremiumUser } from './premium'

// Upserting row-by-row in a loop turns into thousands of sequential network round trips for
// a large import (hundreds of fields, each touching multiple tables). Chunking into a handful
// of bulk upserts keeps large saves (like CSV import) from taking minutes.
const UPSERT_BATCH_SIZE = 500

async function batchUpsert(table: string, rows: any[], onConflict?: string): Promise<void> {
  for (let i = 0; i < rows.length; i += UPSERT_BATCH_SIZE) {
    const chunk = rows.slice(i, i + UPSERT_BATCH_SIZE)
    const { error } = onConflict
      ? await supabase.from(table).upsert(chunk, { onConflict })
      : await supabase.from(table).upsert(chunk)
    if (error) throw error
  }
}

// supabase-js sends .in() filters as part of the request URL, so a large id list (hundreds of
// fields, as a big CSV import produces) can blow past the server's URL length limit and come
// back as a bad request. Chunking the id list into several smaller queries avoids that.
const SELECT_IN_CHUNK_SIZE = 150

async function chunkedSelect<T>(ids: string[], queryFn: (chunk: string[]) => PromiseLike<{ data: T[] | null; error: any }>): Promise<T[]> {
  if (ids.length === 0) return []
  const results: T[] = []
  for (let i = 0; i < ids.length; i += SELECT_IN_CHUNK_SIZE) {
    const chunk = ids.slice(i, i + SELECT_IN_CHUNK_SIZE)
    const { data, error } = await queryFn(chunk)
    if (error) throw error
    results.push(...(data ?? []))
  }
  return results
}


function remapUnlockCondition<T extends { type: string; tabId?: string; fieldId?: string }>(
  condition: T | undefined,
  tabIdMap: Map<string, string>,
  fieldIdMap: Map<string, string>
): T | undefined {
  if (!condition) return undefined
  if (condition.type === 'tab') return { ...condition, tabId: tabIdMap.get(condition.tabId ?? '') ?? condition.tabId }
  if (condition.type === 'field') return { ...condition, fieldId: fieldIdMap.get(condition.fieldId ?? '') ?? condition.fieldId }
  return condition
}

function resetFieldProgress(field: TrackerField): TrackerField {
  if (field.type === 'checkbox') return { ...field, checked: false }
  if (field.type === 'number') return { ...field, value: 0 }
  return { ...field, selected: -1 }
}

export function resetTrackerProgress(tracker: Tracker): Tracker {
  return {
    ...tracker,
    tabs: tracker.tabs.map(tab => ({
      ...tab,
      sections: tab.sections.map(section => ({
        ...section,
        fields: section.fields.map(resetFieldProgress)
      }))
    }))
  }
}

export async function saveTracker(tracker: Tracker): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error: trackerError } = await supabase
    .from('trackers')
    .upsert({ id: tracker.id, owner_id: user.id, title: tracker.title, is_public: tracker.is_public })
  if (trackerError) throw trackerError



  // Delete removed tabs
  const { data: existingTabs } = await supabase
    .from('tracker_tabs')
    .select('id')
    .eq('tracker_id', tracker.id)
  if (existingTabs) {
    const currentTabIds = tracker.tabs.map(tab => tab.id)
    const toDelete = existingTabs
      .filter((tab: any) => !currentTabIds.includes(tab.id))
      .map((tab: any) => tab.id)
    if (toDelete.length > 0) {
      const { error } = await supabase.from('tracker_tabs').delete().in('id', toDelete)
      if (error) throw error
    }
  }

  const allColumnRows: any[] = []
  const allFieldRows: any[] = []

  for (const [tabIndex, tab] of tracker.tabs.entries()) {
    const { error: tabError } = await supabase
      .from('tracker_tabs')
      .upsert({ id: tab.id, tracker_id: tracker.id, title: tab.title, order: tabIndex, unlock_condition: tab.unlockCondition ?? null })
    if (tabError) throw tabError

    // Delete removed sections
    const { data: existingSections } = await supabase
      .from('tracker_sections')
      .select('id')
      .eq('tab_id', tab.id)
    if (existingSections) {
      const currentSectionIds = tab.sections.map(s => s.id)
      const toDelete = existingSections
        .filter((s: any) => !currentSectionIds.includes(s.id))
        .map((s: any) => s.id)
      if (toDelete.length > 0) {
        const { error } = await supabase.from('tracker_sections').delete().in('id', toDelete)
        if (error) throw error
      }
    }

    for (const [sectionIndex, section] of tab.sections.entries()) {
      const { error: sectionError } = await supabase
        .from('tracker_sections')
        .upsert({ id: section.id, tab_id: tab.id, title: section.title, order: sectionIndex, unlock_condition: section.unlockCondition ?? null })
      if (sectionError) throw sectionError

      // Delete removed columns
      const { data: existingColumns } = await supabase
        .from('section_columns')
        .select('id')
        .eq('section_id', section.id)
      if (existingColumns) {
        const currentColumnIds = section.columns.map(col => col.id)
        const toDelete = existingColumns
          .filter((col: any) => !currentColumnIds.includes(col.id))
          .map((col: any) => col.id)
        if (toDelete.length > 0) {
          const { error } = await supabase.from('section_columns').delete().in('id', toDelete)
          if (error) throw error
        }
      }

      section.columns.forEach((column, columnIndex) => {
        allColumnRows.push({ id: column.id, section_id: section.id, label: column.label, type: column.type, order: columnIndex, options: column.type === 'dropdown' ? (column.options ?? []) : null })
      })

      // Delete removed fields
      const { data: existingFields } = await supabase
        .from('tracker_fields')
        .select('id')
        .eq('section_id', section.id)
      if (existingFields) {
        const currentFieldIds = section.fields.map(f => f.id)
        const toDelete = existingFields
          .filter((f: any) => !currentFieldIds.includes(f.id))
          .map((f: any) => f.id)
        if (toDelete.length > 0) {
          const { error } = await supabase.from('tracker_fields').delete().in('id', toDelete)
          if (error) throw error
        }
      }

      section.fields.forEach((field, fieldIndex) => {
        allFieldRows.push({
          id: field.id,
          section_id: section.id,
          label: field.label,
          type: field.type,
          weight: field.weight,
          max: field.type === 'number' ? field.max : null,
          options: field.type === 'dropdown' ? field.options : null,
          order: fieldIndex
        })
      })
    }
  }

  await batchUpsert('section_columns', allColumnRows)
  await batchUpsert('tracker_fields', allFieldRows)
}
const IMAGE_LIMIT = 50

export async function getUserImageCount(): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('user_image_usage')
    .select('image_count')
    .eq('user_id', user.id)
    .single()

  if (error) return 0
  return data.image_count
}

export async function uploadImage(file: File, fieldId: string): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const count = await getUserImageCount()
  if (!isPremiumUser(user) && count >= IMAGE_LIMIT) throw new Error(`Image limit of ${IMAGE_LIMIT} reached`)

  const ext = file.name.split('.').pop()
  const path = `${user.id}/${fieldId}-${crypto.randomUUID()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('tracker-images')
    .upload(path, file)
  if (uploadError) throw uploadError

  const { data, error: urlError } = await supabase.storage
    .from('tracker-images')
    .createSignedUrl(path, 60 * 60 * 24 * 365)
  if (urlError) throw urlError

  const { error: countError } = await supabase
    .from('user_image_usage')
    .upsert({ user_id: user.id, image_count: count + 1 })
  if (countError) throw countError

  return data.signedUrl
}

export async function deleteImage(url: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const path = extractStoragePath(url)
  if (!path) return

  const { error } = await supabase.storage
    .from('tracker-images')
    .remove([path])
  if (error) throw error

  const count = await getUserImageCount()
  const { error: countError } = await supabase
    .from('user_image_usage')
    .upsert({ user_id: user.id, image_count: Math.max(0, count - 1) })
  if (countError) throw countError
}

export async function saveTrackerValues(tracker: Tracker): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const fields = tracker.tabs.flatMap(tab =>
    tab.sections.flatMap(section => section.fields)
  )

  const rows = fields.map(field => ({
    field_id: field.id,
    user_id: user.id,
    checked: field.type === 'checkbox' ? field.checked : false,
    value: field.type === 'number' ? field.value : field.type === 'dropdown' ? field.selected : 0
  }))
  await batchUpsert('tracker_values', rows, 'field_id,user_id')
}

export async function saveColumnValues(tracker: Tracker): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const fields = tracker.tabs.flatMap(tab =>
    tab.sections.flatMap(section => section.fields)
  )

  const rows = fields.flatMap(field =>
    Object.entries(field.columnValues).map(([columnId, value]) => ({
      field_id: field.id,
      column_id: columnId,
      user_id: user.id,
      value
    }))
  )
  console.log(`[saveColumnValues] fields=${fields.length} rows=${rows.length}`, rows[0])
  await batchUpsert('field_column_values', rows, 'field_id,column_id,user_id')
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

  const sectionsData = await chunkedSelect<any>(tabsData.map(tab => tab.id), chunk =>
    supabase.from('tracker_sections').select('*').in('tab_id', chunk).order('order')
  )

  const fieldsData = await chunkedSelect<any>(sectionsData.map(section => section.id), chunk =>
    supabase.from('tracker_fields').select('*').in('section_id', chunk).order('order')
  )

  const valuesData = await chunkedSelect<any>(fieldsData.map(field => field.id), chunk =>
    supabase.from('tracker_values').select('*').in('field_id', chunk).eq('user_id', user.id)
  )

  const columnsData = await chunkedSelect<any>(sectionsData.map(section => section.id), chunk =>
    supabase.from('section_columns').select('*').in('section_id', chunk).order('order')
  )

  const columnValuesData = await chunkedSelect<any>(fieldsData.map(field => field.id), chunk =>
    supabase.from('field_column_values').select('*').in('field_id', chunk).eq('user_id', trackerData.owner_id)
  )

  const tabs: TrackerTab[] = tabsData.map(tab => ({
    id: tab.id,
    title: tab.title,
    unlockCondition: tab.unlock_condition ?? undefined,
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
            type: col.type as "text" | "image" | "dropdown",
            options: col.options ?? undefined
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
            } else if (field.type === 'number') {
              return {
                id: field.id,
                label: field.label,
                type: 'number' as const,
                value: value?.value ?? 0,
                max: field.max,
                weight: field.weight,
                columnValues
              }
            } else {
              return {
                id: field.id,
                label: field.label,
                type: 'dropdown' as const,
                options: field.options ?? [],
                selected: value?.value ?? -1,
                weight: field.weight,
                columnValues
              }
            }
          }),
          unlockCondition: section.unlock_condition ?? undefined,
      }))
  }))

  return {
    id: trackerData.id,
    title: trackerData.title,
    is_public: trackerData.is_public,
    owner_id: trackerData.owner_id,
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

const TRACKER_LIMIT = 10

export async function getUserTrackerCount(): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { count, error } = await supabase
    .from('trackers')
    .select('id', { count: 'exact', head: true })
    .eq('owner_id', user.id)
  if (error) throw error
  return count ?? 0
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

  if (!isPremiumUser(user)) {
    const count = await getUserTrackerCount()
    if (count >= TRACKER_LIMIT) throw new Error(`Tracker limit of ${TRACKER_LIMIT} reached`)
  }

  const newTracker: Tracker = {
    id: crypto.randomUUID(),
    title,
    is_public: false,
    owner_id: user.id,
    tabs: []
  }
  const { error } = await supabase
    .from('trackers')
    .insert({ id: newTracker.id, owner_id: user.id, title: newTracker.title, is_public: false })
  if (error) throw error

  return newTracker
}
function extractStoragePath(url: string): string | null {
  const marker = '/tracker-images/'
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  return url.slice(idx + marker.length).split('?')[0]
}

async function copyFieldImage(url: string, newFieldId: string, ownerId: string): Promise<{ url: string; copied: boolean }> {
  const fromPath = extractStoragePath(url)
  if (!fromPath) return { url, copied: false }

  const ext = fromPath.split('.').pop()
  const toPath = `${ownerId}/${newFieldId}-${crypto.randomUUID()}.${ext}`

  const { error: copyError } = await supabase.storage.from('tracker-images').copy(fromPath, toPath)
  if (copyError) return { url, copied: false }

  const { data, error: urlError } = await supabase.storage
    .from('tracker-images')
    .createSignedUrl(toPath, 60 * 60 * 24 * 365)
  if (urlError || !data) return { url, copied: false }

  return { url: data.signedUrl, copied: true }
}
export async function copyTracker(trackerId: string): Promise<Tracker> {
  const original = await loadTracker(trackerId)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const tabIdMap = new Map(original.tabs.map(tab => [tab.id, crypto.randomUUID()]))
  const fieldIdMap = new Map(
    original.tabs.flatMap(tab => tab.sections.flatMap(section => section.fields))
      .map(field => [field.id, crypto.randomUUID()])
  )

  let imagesCopied = 0

  const tabs: TrackerTab[] = await Promise.all(original.tabs.map(async tab => {
    const sections: TrackerSection[] = await Promise.all(tab.sections.map(async section => {
      const columnIdMap = new Map(section.columns.map(col => [col.id, crypto.randomUUID()]))
      const columns = section.columns.map(col => ({ ...col, id: columnIdMap.get(col.id)! }))

      const fields: TrackerField[] = await Promise.all(section.fields.map(async field => {
        const newFieldId = fieldIdMap.get(field.id)!
        const columnValues: Record<string, string> = {}
        for (const [colId, value] of Object.entries(field.columnValues)) {
          const newColId = columnIdMap.get(colId) ?? colId
          const col = section.columns.find(c => c.id === colId)
          if (col?.type === 'image' && value) {
            const result = await copyFieldImage(value, newFieldId, user.id)
            columnValues[newColId] = result.url
            if (result.copied) imagesCopied++
          } else {
            columnValues[newColId] = value
          }
        }
        return {
          ...resetFieldProgress(field),
          id: newFieldId,
          columnValues
        }
      }))

      return {
        ...section,
        id: crypto.randomUUID(),
        columns,
        fields,
        unlockCondition: remapUnlockCondition(section.unlockCondition, tabIdMap, fieldIdMap)
      }
    }))

    return {
      ...tab,
      id: tabIdMap.get(tab.id)!,
      sections,
      unlockCondition: remapUnlockCondition(tab.unlockCondition, tabIdMap, fieldIdMap)
    }
  }))

  const copied: Tracker = {
    ...original,
    id: crypto.randomUUID(),
    title: `${original.title} (copy)`,
    is_public: false,
    owner_id: user.id,
    tabs
  }

  await saveTracker(copied)
  await saveColumnValues(copied)

  if (imagesCopied > 0) {
    // Copying a tracker always succeeds in full, even if it pushes the
    // owner's image count past IMAGE_LIMIT - the limit only blocks new
    // uploads, never a copy.
    const count = await getUserImageCount()
    const { error: countError } = await supabase
      .from('user_image_usage')
      .upsert({ user_id: user.id, image_count: count + imagesCopied })
    if (countError) throw countError
  }

  return copied
}