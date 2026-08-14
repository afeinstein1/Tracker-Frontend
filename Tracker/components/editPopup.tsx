import { useState } from "react"
import { Dialog, Portal, Field, Input, Button, IconButton, Checkbox, Stack, Text } from "@chakra-ui/react"
import { SimpleSelect } from "@/components/SimpleSelect"
import { EditTarget, SectionUnlockCondition, TabUnlockCondition, Tracker, TrackerField } from "@/Types/field"

type Props = {
  target: EditTarget
  onSave: (updated: EditTarget) => void
  tracker: Tracker
  onDelete: () => void
  onClose: () => void
}

export function EditPopup({ tracker, target, onSave, onDelete, onClose }: Props) {
  const [confirming, setConfirming] = useState(false)

  const [title, setTitle] = useState(
    target.type === "field" ? target.item.label : target.item.title
  )
  const [fieldType, setFieldType] = useState(
    target.type === "field" ? target.item.type : "checkbox"
  )
  const [max, setMax] = useState(
    target.type === "field" && target.item.type === "number" ? target.item.max : 0
  )
  const [weight, setWeight] = useState(
    target.type === "field" ? target.item.weight : 1
  )
  const [isPublic, setIsPublic] = useState(
    target.type === "tracker" ? target.item.is_public : false
  )
  const [columns, setColumns] = useState(
    target.type === "section" ? target.item.columns : []
  )
  const [options, setOptions] = useState(
    target.type === "field" && target.item.type === "dropdown"
      ? target.item.options
      : ['Option 1', 'Option 2']
  )
  const [unlockCondition, setUnlockCondition] = useState<TabUnlockCondition | SectionUnlockCondition | undefined>(
    target.type === "tab" || target.type === "section" ? target.item.unlockCondition : undefined
  )

  function handleSave() {
    if (target.type === "tracker") {
      onSave({ ...target, item: { ...target.item, title, is_public: isPublic } })
    } else if (target.type === "tab") {
      onSave({ ...target, item: { ...target.item, title, unlockCondition: unlockCondition as TabUnlockCondition } })
    } else if (target.type === "section") {
      onSave({ ...target, item: { ...target.item, title, columns, unlockCondition: unlockCondition as any } })
    } else if (target.type === "field") {
      const updatedField: TrackerField = fieldType === "checkbox"
        ? { ...target.item, label: title, type: "checkbox", checked: target.item.type === "checkbox" ? target.item.checked : false, weight, columnValues: target.item.columnValues }
        : fieldType === "number"
        ? { ...target.item, label: title, type: "number", value: target.item.type === "number" ? target.item.value : 0, max, weight, columnValues: target.item.columnValues }
        : { ...target.item, label: title, type: "dropdown", options, selected: target.item.type === "dropdown" ? target.item.selected : 0, weight, columnValues: target.item.columnValues }
      onSave({ ...target, item: updatedField })
    }
  }

  function getDeleteWarning() {
    if (target.type === "tab") return "This will delete the tab and all its sections and fields."
    if (target.type === "section") return "This will delete the section and all its fields."
    return "This will delete this field."
  }

  return (
    <Dialog.Root open onOpenChange={details => { if (!details.open) onClose() }} placement="center" scrollBehavior="inside">
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="500px">
            <Dialog.Header>
              <Dialog.Title textTransform="capitalize">Edit {target.type}</Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              {!confirming ? (
                <Stack gap={4}>
                  <Field.Root>
                    <Field.Label>{target.type === "field" ? "Label" : "Title"}</Field.Label>
                    <Input value={title} onChange={e => setTitle(e.target.value)} />
                  </Field.Root>

                  {target.type === "tracker" && (
                    <Checkbox.Root checked={isPublic} onCheckedChange={d => setIsPublic(!!d.checked)}>
                      <Checkbox.HiddenInput />
                      <Checkbox.Control />
                      <Checkbox.Label>Make this tracker public</Checkbox.Label>
                    </Checkbox.Root>
                  )}

                  {(target.type === "tab" || target.type === "section") && (
                    <Stack gap={3}>
                      <Field.Root>
                        <Field.Label>Unlock Condition</Field.Label>
                        <SimpleSelect
                          value={unlockCondition?.type ?? 'none'}
                          onChange={type => {
                            if (type === 'none') setUnlockCondition(undefined)
                            else if (type === 'overall') setUnlockCondition({ type: 'overall', percentage: 50 })
                            else if (type === 'tab') setUnlockCondition({ type: 'tab', tabId: '', percentage: 50 })
                            else if (type === 'field') setUnlockCondition({ type: 'field', fieldId: '' })
                          }}
                          options={[
                            { value: 'none', label: 'No lock' },
                            { value: 'overall', label: 'Overall completion %' },
                            { value: 'tab', label: "Another tab's completion %" },
                            { value: 'field', label: 'Specific field complete' }
                          ]}
                        />
                      </Field.Root>

                      {unlockCondition?.type === 'overall' && (
                        <Field.Root>
                          <Field.Label>Percentage</Field.Label>
                          <Input
                            type="number"
                            value={unlockCondition.percentage}
                            min={0}
                            max={100}
                            onChange={e => setUnlockCondition({ ...unlockCondition, percentage: Number(e.target.value) })}
                          />
                        </Field.Root>
                      )}

                      {unlockCondition?.type === 'tab' && (
                        <>
                          <Field.Root>
                            <Field.Label>Tab</Field.Label>
                            <SimpleSelect
                              value={unlockCondition.tabId ?? ''}
                              onChange={v => setUnlockCondition({ ...unlockCondition, tabId: v })}
                              placeholder="Select a tab..."
                              options={tracker.tabs.map(tab => ({ value: tab.id, label: tab.title }))}
                            />
                          </Field.Root>
                          <Field.Root>
                            <Field.Label>Percentage</Field.Label>
                            <Input
                              type="number"
                              value={unlockCondition.percentage}
                              min={0}
                              max={100}
                              onChange={e => setUnlockCondition({ ...unlockCondition, percentage: Number(e.target.value) })}
                            />
                          </Field.Root>
                        </>
                      )}

                      {unlockCondition?.type === 'field' && (
                        <Field.Root>
                          <Field.Label>Field</Field.Label>
                          <SimpleSelect
                            value={(unlockCondition as any).fieldId ?? ''}
                            onChange={v => setUnlockCondition({ ...unlockCondition, fieldId: v } as any)}
                            placeholder="Select a field..."
                            options={tracker.tabs.flatMap(tab =>
                              tab.sections.flatMap(section =>
                                section.fields.map(field => ({
                                  value: field.id,
                                  label: `${tab.title} → ${section.title} → ${field.label}`
                                }))
                              )
                            )}
                          />
                        </Field.Root>
                      )}
                      <Text fontSize="sm" color="fg.muted">
                        {target.type === "tab"
                          ? "Locks this tab until the condition is met"
                          : "Locks this section until the condition is met"}
                      </Text>
                    </Stack>
                  )}

                  {target.type === "section" && (
                    <Stack gap={3}>
                      <Text fontWeight="semibold">Extra Columns</Text>
                      {columns.map((col, index) => (
                        <Stack key={col.id} gap={2} pb={3} borderBottomWidth="1px" borderColor="border">
                          <Stack direction="row" gap={2} align="center">
                            <Input
                              value={col.label}
                              onChange={e => setColumns(prev => prev.map((c, i) =>
                                i === index ? { ...c, label: e.target.value } : c
                              ))}
                              placeholder="Column name"
                            />
                            <SimpleSelect
                              width="auto"
                              value={col.type}
                              onChange={v => setColumns(prev => prev.map((c, i) =>
                                i === index ? { ...c, type: v as "text" | "image" | "dropdown", options: v === 'dropdown' ? (c.options ?? ['Option 1', 'Option 2']) : c.options } : c
                              ))}
                              options={[
                                { value: 'text', label: 'Text' },
                                { value: 'image', label: 'Image' },
                                { value: 'dropdown', label: 'Dropdown' }
                              ]}
                            />
                            <IconButton
                              aria-label="Remove column"
                              size="sm"
                              colorPalette="red"
                              variant="ghost"
                              onClick={() => setColumns(prev => prev.filter((_, i) => i !== index))}
                            >
                              ✕
                            </IconButton>
                          </Stack>
                          {col.type === 'dropdown' && (
                            <Stack pl={2} gap={1}>
                              {(col.options ?? []).map((option, optIndex) => (
                                <Stack key={optIndex} direction="row" gap={2}>
                                  <Input
                                    value={option}
                                    onChange={e => setColumns(prev => prev.map((c, i) =>
                                      i !== index ? c : { ...c, options: (c.options ?? []).map((o, oi) => oi === optIndex ? e.target.value : o) }
                                    ))}
                                    placeholder={`Option ${optIndex + 1}`}
                                  />
                                  <IconButton
                                    aria-label="Remove option"
                                    size="sm"
                                    colorPalette="red"
                                    variant="ghost"
                                    onClick={() => setColumns(prev => prev.map((c, i) =>
                                      i !== index ? c : { ...c, options: (c.options ?? []).filter((_, oi) => oi !== optIndex) }
                                    ))}
                                  >
                                    ✕
                                  </IconButton>
                                </Stack>
                              ))}
                              <Button size="sm" variant="outline" onClick={() => setColumns(prev => prev.map((c, i) =>
                                i !== index ? c : { ...c, options: [...(c.options ?? []), ''] }
                              ))}>
                                + Add Option
                              </Button>
                            </Stack>
                          )}
                        </Stack>
                      ))}
                      <Button size="sm" variant="outline" alignSelf="flex-start" onClick={() => setColumns(prev => [...prev, {
                        id: crypto.randomUUID(),
                        label: 'New Column',
                        type: 'text' as const
                      }])}>
                        + Add Column
                      </Button>
                    </Stack>
                  )}

                  {target.type === "field" && (
                    <Stack gap={3}>
                      <Field.Root>
                        <Field.Label>Type</Field.Label>
                        <SimpleSelect
                          value={fieldType}
                          onChange={v => setFieldType(v as "checkbox" | "number" | "dropdown")}
                          options={[
                            { value: 'checkbox', label: 'Checkbox' },
                            { value: 'number', label: 'Number' },
                            { value: 'dropdown', label: 'Dropdown' }
                          ]}
                        />
                      </Field.Root>

                      {fieldType === "number" && (
                        <Field.Root>
                          <Field.Label>Max Value</Field.Label>
                          <Input type="number" value={max} onChange={e => setMax(Number(e.target.value))} />
                        </Field.Root>
                      )}
                      <Field.Root>
                        <Field.Label>Weight</Field.Label>
                        <Input type="number" value={weight} onChange={e => setWeight(Number(e.target.value))} />
                      </Field.Root>
                    </Stack>
                  )}

                  {fieldType === "dropdown" && (
                    <Stack gap={2}>
                      <Text fontWeight="semibold">Options</Text>
                      {options.map((option, index) => (
                        <Stack key={index} direction="row" gap={2}>
                          <Input
                            value={option}
                            onChange={e => setOptions(prev => prev.map((o, i) => i === index ? e.target.value : o))}
                            placeholder={`Option ${index + 1}`}
                          />
                          <IconButton
                            aria-label="Remove option"
                            size="sm"
                            colorPalette="red"
                            variant="ghost"
                            onClick={() => setOptions(prev => prev.filter((_, i) => i !== index))}
                          >
                            ✕
                          </IconButton>
                        </Stack>
                      ))}
                      <Button size="sm" variant="outline" alignSelf="flex-start" onClick={() => setOptions(prev => [...prev, ''])}>
                        + Add Option
                      </Button>
                    </Stack>
                  )}
                </Stack>
              ) : (
                <Stack gap={3}>
                  <Text>{getDeleteWarning()}</Text>
                  <Text>Are you sure?</Text>
                </Stack>
              )}
            </Dialog.Body>

            <Dialog.Footer>
              {!confirming ? (
                <Stack direction="row" gap={2} justify="flex-end" width="100%">
                  {target.type !== "tracker" && (
                    <Button variant="ghost" colorPalette="red" onClick={() => setConfirming(true)}>
                      Delete
                    </Button>
                  )}
                  <Button variant="outline" onClick={onClose}>Cancel</Button>
                  <Button colorPalette="brand" onClick={handleSave}>Save</Button>
                </Stack>
              ) : (
                <Stack direction="row" gap={2} justify="flex-end" width="100%">
                  <Button variant="outline" onClick={() => setConfirming(false)}>Go Back</Button>
                  <Button colorPalette="red" onClick={onDelete}>Confirm Delete</Button>
                </Stack>
              )}
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
