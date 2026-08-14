import { useMemo } from "react"
import { createListCollection, Portal, Select } from "@chakra-ui/react"

// A thin wrapper around Chakra's Select that behaves like a plain single-value <select> - used
// instead of NativeSelect because the native <select> popup renders via OS-level chrome that
// doesn't reliably pick up the app's theme (white-on-white text was the reported symptom).
// Chakra's Select renders its own listbox in the DOM instead of a native popup, so it's always
// themed consistently.

export type SimpleSelectOption = { value: string; label: string }

type Props = {
  value: string
  onChange: (value: string) => void
  options: SimpleSelectOption[]
  disabled?: boolean
  placeholder?: string
  width?: string
}

export function SimpleSelect({ value, onChange, options, disabled = false, placeholder, width = "100%" }: Props) {
  const collection = useMemo(() => createListCollection({
    items: options,
    itemToValue: item => item.value,
    itemToString: item => item.label
  }), [options])

  return (
    <Select.Root
      collection={collection}
      value={value ? [value] : []}
      onValueChange={details => onChange(details.value[0] ?? '')}
      disabled={disabled}
      width={width}
    >
      <Select.Control>
        <Select.Trigger>
          <Select.ValueText placeholder={placeholder} />
        </Select.Trigger>
        <Select.IndicatorGroup>
          <Select.Indicator />
        </Select.IndicatorGroup>
      </Select.Control>
      <Portal>
        <Select.Positioner>
          {/*
            Explicit background/text color here instead of relying on Chakra's own color mode -
            this app's light/dark theming is driven by CSS custom properties (see global.css),
            which Chakra's internal color mode isn't synced to. Without this, the popup's
            background stayed on Chakra's light-mode default (white) while the text inherited
            this app's dark-mode color from the surrounding page (also near-white) - white on
            white. Using the same variables global.css already defines keeps this in sync for
            both themes automatically.
          */}
          <Select.Content
            css={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              borderColor: 'var(--color-border)',
              borderWidth: '1px'
            }}
          >
            {options.map(opt => (
              <Select.Item
                key={opt.value}
                item={opt}
                css={{
                  color: 'var(--color-text)',
                  '&[data-highlighted]': {
                    backgroundColor: 'var(--color-background)'
                  }
                }}
              >
                <Select.ItemText>{opt.label}</Select.ItemText>
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Portal>
    </Select.Root>
  )
}
