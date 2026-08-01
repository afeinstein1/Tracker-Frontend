import { SectionColumn, TrackerField, TrackerSection, TrackerTab } from '@/Types/field'

export const MAX_ROWS_PER_FILE = 500
export const MAX_COLS_PER_FILE = 12
export const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024
export const MAX_BATCH_FILES = 25

export class CsvImportError extends Error {
  fileName: string
  row?: number

  constructor(fileName: string, message: string, row?: number) {
    super(row !== undefined ? `${fileName} (row ${row}): ${message}` : `${fileName}: ${message}`)
    this.name = 'CsvImportError'
    this.fileName = fileName
    this.row = row
  }
}

function isBlank(v: string | undefined): boolean {
  return v === undefined || v.trim() === ''
}

function isBoolCell(v: string | undefined): boolean {
  if (v === undefined) return false
  const t = v.trim().toUpperCase()
  return t === 'TRUE' || t === 'FALSE'
}

function boolValue(v: string | undefined): boolean {
  return (v ?? '').trim().toUpperCase() === 'TRUE'
}

// Every maximal contiguous run of TRUE/FALSE cells within [colStart, colEnd) of a row.
function findAllBoolRuns(row: string[], colStart: number, colEnd: number): { start: number; end: number }[] {
  const runs: { start: number; end: number }[] = []
  let c = colStart
  while (c < colEnd) {
    if (isBoolCell(row[c])) {
      const start = c
      while (c < colEnd && isBoolCell(row[c])) c++
      runs.push({ start, end: c })
    } else {
      c++
    }
  }
  return runs
}

export function defaultTabName(fileName: string): string {
  const base = fileName.replace(/\.csv$/i, '').trim()
  const idx = base.lastIndexOf(' - ')
  const name = idx === -1 ? base : base.slice(idx + 3).trim()
  return name || base || fileName
}

export function defaultTrackerTitle(fileNames: string[]): string {
  const prefixes = fileNames.map(f => {
    const base = f.replace(/\.csv$/i, '').trim()
    const idx = base.lastIndexOf(' - ')
    return idx === -1 ? null : base.slice(0, idx).trim()
  })
  const first = prefixes[0]
  if (first && prefixes.every(p => p === first)) return first
  return 'Imported Tracker'
}

// Builds one section from a header row (defines column labels), a section name, and its
// contiguous block of data rows within [colStart, colEnd). The boolean group is derived from
// the first data row, then re-validated across every data row in the section - a candidate
// group column only survives if it's TRUE/FALSE on every row; the first inconsistent column
// truncates the group there and becomes an ordinary text column instead.
function buildSection(
  fileName: string,
  headerRow: string[],
  sectionName: string,
  dataRows: string[][],
  rowNumbers: number[],
  colStart: number,
  colEnd: number
): TrackerSection {
  if (dataRows.length === 0) {
    throw new CsvImportError(fileName, `Section "${sectionName}" has no data rows`, rowNumbers[0])
  }

  const runs = findAllBoolRuns(dataRows[0], colStart, colEnd)
  if (runs.length === 0) {
    throw new CsvImportError(fileName, `Section "${sectionName}" has no TRUE/FALSE values to establish its structure`, rowNumbers[0])
  }
  const groupStart = runs[0].start
  let groupEnd = runs[0].end

  for (let c = groupStart; c < groupEnd; c++) {
    const allBool = dataRows.every(r => isBoolCell(r[c]))
    if (!allBool) {
      if (c === groupStart) {
        throw new CsvImportError(fileName, `Section "${sectionName}" doesn't have a consistent TRUE/FALSE column across all its rows`, rowNumbers[0])
      }
      groupEnd = c
      break
    }
  }
  const groupSize = groupEnd - groupStart

  let labelCol = -1
  for (let c = colStart; c < colEnd; c++) {
    if (c < groupStart || c >= groupEnd) { labelCol = c; break }
  }
  if (labelCol === -1) {
    throw new CsvImportError(fileName, `Section "${sectionName}" has no column left to use as a field label`, rowNumbers[0])
  }

  const otherCols: number[] = []
  for (let c = colStart; c < colEnd; c++) {
    if (c === labelCol) continue
    if (c >= groupStart && c < groupEnd) continue
    otherCols.push(c)
  }

  const columns: SectionColumn[] = otherCols.map((c, i) => ({
    id: crypto.randomUUID(),
    label: (headerRow[c] ?? '').trim() || `Column ${i + 1}`,
    type: 'text' as const
  }))

  const isDropdown = groupSize > 1
  // "None" is a real, selectable option at index 0 (not a -1 sentinel) because the dropdown
  // <select> only renders <option>s from field.options - a -1 "unselected" value has nothing
  // to match, so the browser silently falls back to displaying the first real option instead,
  // even though the data says nothing is selected.
  const dropdownOptions = isDropdown
    ? ['None', ...Array.from({ length: groupSize }, (_, i) => (headerRow[groupStart + i] ?? '').trim() || `Option ${i + 1}`)]
    : []

  const fields: TrackerField[] = dataRows.map((row, idx) => {
    if (!isBoolCell(row[groupStart])) {
      throw new CsvImportError(fileName, `Expected TRUE/FALSE in section "${sectionName}"`, rowNumbers[idx])
    }

    const columnValues: Record<string, string> = {}
    otherCols.forEach((c, i) => { columnValues[columns[i].id] = (row[c] ?? '').trim() })
    const label = (row[labelCol] ?? '').trim()

    if (!isDropdown) {
      return {
        id: crypto.randomUUID(),
        label,
        type: 'checkbox',
        checked: boolValue(row[groupStart]),
        weight: 1,
        columnValues
      }
    }

    const trueIndexes: number[] = []
    for (let i = 0; i < groupSize; i++) {
      if (boolValue(row[groupStart + i])) trueIndexes.push(i)
    }
    if (trueIndexes.length > 1) {
      throw new CsvImportError(fileName, `Multiple options marked TRUE for "${label || 'a field'}" in section "${sectionName}"`, rowNumbers[idx])
    }

    return {
      id: crypto.randomUUID(),
      label,
      type: 'dropdown',
      options: dropdownOptions,
      selected: trueIndexes.length === 1 ? trueIndexes[0] + 1 : 0,
      weight: 1,
      columnValues
    }
  })

  return {
    id: crypto.randomUUID(),
    title: sectionName,
    columns,
    fields
  }
}

// Scans [rowStart, rowEnd) within [colStart, colEnd) for section-marker rows (no TRUE/FALSE
// anywhere in range) and the data rows that follow each one, building one TrackerSection per
// marker (or per run of consecutive markers - see below). Stops early if it hits a row that's
// entirely blank in range, since that means this lane/section has run out of content before
// the rest of the range does.
//
// Two marker rows back to back (no data between them) represent nested hierarchy rather than
// a redundant duplicate - e.g. a character name followed immediately by a category name. The
// first marker of such a pair becomes a persistent "outer prefix" applied to every subsequent
// lone marker's section name, until the next back-to-back pair replaces it.
function buildSectionsInRange(
  fileName: string,
  rows: string[][],
  rowStart: number,
  rowEnd: number,
  colStart: number,
  colEnd: number,
  headerRow: string[]
): TrackerSection[] {
  const sections: TrackerSection[] = []
  let pendingMarkers: string[] = []
  let pendingMarkerRows: number[] = []
  let dataRows: string[][] = []
  let dataRowNumbers: number[] = []
  let outerPrefix: string | null = null

  function flush() {
    if (pendingMarkers.length === 0) return
    if (pendingMarkers.length >= 2) {
      outerPrefix = pendingMarkers[0]
    }
    const name = pendingMarkers.length === 1 && outerPrefix
      ? `${outerPrefix} — ${pendingMarkers[0]}`
      : pendingMarkers.join(' — ')
    sections.push(buildSection(fileName, headerRow, name, dataRows, dataRowNumbers, colStart, colEnd))
    pendingMarkers = []
    pendingMarkerRows = []
    dataRows = []
    dataRowNumbers = []
  }

  for (let r = rowStart; r < rowEnd; r++) {
    const slice = rows[r].slice(colStart, colEnd)
    if (slice.every(isBlank)) break

    const runs = findAllBoolRuns(rows[r], colStart, colEnd)
    if (runs.length === 0) {
      if (dataRows.length > 0) flush()
      // The marker's name is every non-blank cell in the row, not just colStart - a marker
      // can carry its text in any single column (e.g. a leading blank checkbox column pushes
      // it to column 2), and a case 3 lane's marker row commonly carries two values (e.g.
      // "Argentum,Landmarks") that both belong in the name.
      const values: string[] = []
      for (let c = colStart; c < colEnd; c++) {
        if (!isBlank(rows[r][c])) values.push(rows[r][c].trim())
      }
      if (values.length === 0) {
        throw new CsvImportError(fileName, 'Section header row has no name', r + 1)
      }
      pendingMarkers.push(...values)
      pendingMarkerRows.push(r + 1)
    } else {
      if (pendingMarkers.length === 0) {
        throw new CsvImportError(fileName, 'Data row appears before any section header', r + 1)
      }
      dataRows.push(rows[r])
      dataRowNumbers.push(r + 1)
    }
  }
  flush()

  return sections
}

function parseCase3(fileName: string, rows: string[][], width: number): TrackerSection[] {
  const sections: TrackerSection[] = []
  let bandStart = 0

  while (bandStart < rows.length) {
    if (isBlank(rows[bandStart][0])) { bandStart++; continue }
    if (bandStart + 1 >= rows.length) {
      throw new CsvImportError(fileName, 'Band header has no data row beneath it to establish lane widths', bandStart + 1)
    }

    const runs = findAllBoolRuns(rows[bandStart + 1], 0, width)
    if (runs.length === 0) {
      throw new CsvImportError(fileName, 'Could not determine lane widths for this band (no TRUE/FALSE found)', bandStart + 2)
    }

    const lanes = runs.map(run => ({ colStart: run.start, colEnd: run.end + 1 }))

    for (const lane of lanes) {
      const cell = rows[bandStart][lane.colStart]
      if (isBlank(cell) || isBoolCell(cell)) {
        throw new CsvImportError(fileName, 'Band lanes are not aligned on the same header row', bandStart + 1)
      }
    }

    // A band boundary is a row where at least one of the current band's lanes goes fresh
    // (a new top-level header) and none of the others are still mid-data - a lane that's
    // simply exhausted (blank) doesn't block the boundary, which is what lets a band shrink
    // to fewer lanes than the one before it (e.g. a final single-lane band). A lane still
    // mid-data blocks it, since that's just an in-lane section change, not a new band.
    let bandEnd = rows.length
    for (let r = bandStart + 1; r < rows.length; r++) {
      let anyFresh = false
      let anyMidData = false
      for (const lane of lanes) {
        const cell = rows[r][lane.colStart]
        if (isBoolCell(cell)) anyMidData = true
        else if (!isBlank(cell)) anyFresh = true
      }
      if (anyFresh && !anyMidData) { bandEnd = r; break }
    }

    for (const lane of lanes) {
      sections.push(...buildSectionsInRange(fileName, rows, bandStart, bandEnd, lane.colStart, lane.colEnd, rows[bandStart]))
    }

    bandStart = bandEnd
  }

  return sections
}

export function parseCsvFile(fileName: string, rawRows: string[][]): TrackerTab {
  // Row indices are kept aligned to the original file (1-based row numbers = index + 1) so
  // error messages point at the right line - blank rows (e.g. a trailing blank line) are
  // skipped where encountered rather than filtered out up front.
  const nonBlankRows = rawRows.filter(r => !r.every(isBlank))
  if (nonBlankRows.length === 0) {
    throw new CsvImportError(fileName, 'File is empty')
  }
  if (nonBlankRows.length > MAX_ROWS_PER_FILE) {
    throw new CsvImportError(fileName, `Too many rows (max ${MAX_ROWS_PER_FILE})`)
  }
  const width = Math.max(...nonBlankRows.map(r => r.length))
  if (width > MAX_COLS_PER_FILE) {
    throw new CsvImportError(fileName, `Too many columns (max ${MAX_COLS_PER_FILE})`)
  }

  const padded = rawRows.map(r => Array.from({ length: width }, (_, i) => (r[i] ?? '').toString()))
  const header = padded[0]

  let sections: TrackerSection[]

  if (isBlank(header[0])) {
    if (padded.length < 2) {
      throw new CsvImportError(fileName, 'No data rows', 1)
    }
    sections = buildSectionsInRange(fileName, padded, 1, padded.length, 0, width, header)
  } else {
    if (padded.length < 2) {
      throw new CsvImportError(fileName, 'Row 1 names a section but there are no more rows', 1)
    }
    const runs = findAllBoolRuns(padded[1], 0, width)
    if (runs.length === 0) {
      throw new CsvImportError(fileName, 'Row 1 names a section but row 2 has no TRUE/FALSE values', 2)
    } else if (runs.length === 1) {
      const sectionName = header[0].trim()
      const dataRows: string[][] = []
      const rowNumbers: number[] = []
      for (let i = 1; i < padded.length; i++) {
        if (padded[i].every(isBlank)) break
        dataRows.push(padded[i])
        rowNumbers.push(i + 1)
      }
      sections = [buildSection(fileName, header, sectionName, dataRows, rowNumbers, 0, width)]
    } else {
      sections = parseCase3(fileName, padded, width)
    }
  }

  return {
    id: crypto.randomUUID(),
    title: defaultTabName(fileName),
    sections
  }
}

export type CsvFileInput = { name: string; rows: string[][]; sizeBytes: number }
export type CsvParseResult =
  | { fileName: string; tab: TrackerTab; error?: undefined }
  | { fileName: string; tab?: undefined; error: CsvImportError }

export function parseCsvBatch(files: CsvFileInput[]): CsvParseResult[] {
  if (files.length > MAX_BATCH_FILES) {
    throw new CsvImportError('import', `Too many files selected (max ${MAX_BATCH_FILES} per import)`)
  }

  return files.map(f => {
    try {
      if (f.sizeBytes > MAX_FILE_SIZE_BYTES) {
        throw new CsvImportError(f.name, `File is larger than ${Math.round(MAX_FILE_SIZE_BYTES / (1024 * 1024))}MB`)
      }
      const tab = parseCsvFile(f.name, f.rows)
      return { fileName: f.name, tab }
    } catch (e) {
      const error = e instanceof CsvImportError ? e : new CsvImportError(f.name, e instanceof Error ? e.message : 'Unknown error')
      return { fileName: f.name, error }
    }
  })
}
