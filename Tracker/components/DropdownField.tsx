import { DropdownField } from "@/Types/field"
import { Box, Text } from "@chakra-ui/react"
import { SimpleSelect } from "@/components/SimpleSelect"

type Props = {
  field: DropdownField
  onChange: (selected: number) => void
  disabled?: boolean
}
export function DropdownFieldView({ field, onChange, disabled = false }: Props) {
  return (
    <Box>
      <Text fontSize="sm" mb={1}>{field.label}</Text>
      <SimpleSelect
        width="200px"
        disabled={disabled}
        value={String(field.selected)}
        onChange={v => onChange(Number(v))}
        options={field.options.map((option, index) => ({ value: String(index), label: option }))}
      />
    </Box>
  )
}
