import { useWindowDimensions } from "react-native"
import { EditTarget, TrackerSection } from "@/Types/field"
import { renderField } from "./renderer"
import { ImageField } from '@/components/ImageField'
import { Box, Button, Heading, IconButton, Input, Stack, Text, Textarea } from "@chakra-ui/react"
import { SimpleSelect } from "@/components/SimpleSelect"

type Props = {
  section: TrackerSection
  onFieldChange: (fieldId: string, value: boolean | number) => void
  onColumnValueChange: (fieldId: string, columnId: string, value: string) => void
  isEditMode: boolean
  onEditTarget: (target: EditTarget) => void
  tabId: string
  onAddField: (sectionId: string) => void
  disabled?: boolean
}

export function TrackerSectionView({ section, onFieldChange, onColumnValueChange, isEditMode, onEditTarget, tabId, onAddField, disabled = false }: Props) {
  const { width } = useWindowDimensions()
  const isNarrow = width < 700

  function renderColumnValue(fieldId: string, col: TrackerSection['columns'][number], value: string) {
    if (col.type === 'text') {
      if (!isEditMode || disabled) {
        return (
          <Text w="100%" p={1} whiteSpace="pre-wrap" wordBreak="break-word">
            {value}
          </Text>
        )
      }
      return (
        <Textarea
          value={value}
          onChange={e => onColumnValueChange(fieldId, col.id, e.target.value)}
          rows={Math.max(2, value.split('\n').length)}
          resize="vertical"
        />
      )
    }
    if (col.type === 'image') {
      return (
        <Box>
          <ImageField
            fieldId={fieldId}
            value={value}
            onChange={url => onColumnValueChange(fieldId, col.id, url)}
            isEditMode={isEditMode && !disabled}
          />
        </Box>
      )
    }
    if (col.type === 'dropdown') {
      return (
        <SimpleSelect
          disabled={!isEditMode || disabled}
          value={value}
          onChange={v => onColumnValueChange(fieldId, col.id, v)}
          options={[{ value: '', label: '—' }, ...(col.options ?? []).map(option => ({ value: option, label: option }))]}
        />
      )
    }
    return (
      <Input
        value={value}
        onChange={e => onColumnValueChange(fieldId, col.id, e.target.value)}
        readOnly={!isEditMode || disabled}
      />
    )
  }

  return (
    <Box borderWidth="1px" borderColor="border" borderRadius="lg" p={4} mb={4}>
      <Stack direction="row" align="center" gap={2} mb={3}>
        <Heading size="md">{section.title}</Heading>
        {isEditMode && (
          <IconButton aria-label="Edit section" size="sm" variant="ghost" onClick={() => onEditTarget({ type: "section", item: section, tabId: tabId })}>✏️</IconButton>
        )}
      </Stack>

      {!isNarrow && section.columns.length > 0 && (
        <Stack direction="row" gap={8} mb={1}>
          <Stack direction="row" flex={2} align="center" gap={1}>
            <Text>Field</Text>
            {isEditMode && <Box w="28px" />}
          </Stack>
          {section.columns.map(col => (
            <Text key={col.id} flex={1} fontWeight="semibold" textAlign="center">{col.label}</Text>
          ))}
        </Stack>
      )}

      {section.fields.map(field => (
        isNarrow ? (
          <Box key={field.id} mb={4} pb={4} borderBottomWidth="1px" borderColor="border">
            <Stack direction="row" align="center" gap={1} mb={section.columns.length > 0 ? 3 : 0}>
              {renderField(field, onFieldChange, disabled)}
              {isEditMode && (
                <IconButton aria-label="Edit field" size="sm" variant="ghost" onClick={() => onEditTarget({ type: "field", item: field, sectionId: section.id })}>✏️</IconButton>
              )}
            </Stack>
            {section.columns.map(col => (
              <Box key={col.id} mb={2}>
                <Text fontSize="xs" fontWeight="semibold" color="fg.muted" mb={1}>{col.label}</Text>
                {renderColumnValue(field.id, col, field.columnValues[col.id] ?? '')}
              </Box>
            ))}
          </Box>
        ) : (
          <Stack key={field.id} direction="row" align="stretch" gap={8} mb={2} minH="40px">
            <Stack direction="row" flex={2} align="flex-start" gap={1} pt={1}>
              {renderField(field, onFieldChange, disabled)}
              {isEditMode && (
                <IconButton aria-label="Edit field" size="sm" variant="ghost" onClick={() => onEditTarget({ type: "field", item: field, sectionId: section.id })}>✏️</IconButton>
              )}
            </Stack>
            {section.columns.map(col => (
              <Box key={col.id} flex={1} display="flex" alignItems="flex-start" justifyContent="center">
                {renderColumnValue(field.id, col, field.columnValues[col.id] ?? '')}
              </Box>
            ))}
          </Stack>
        )
      ))}

      {isEditMode && <Button mt={2} variant="outline" onClick={() => onAddField(section.id)}>+ Field</Button>}
    </Box>
  )
}
