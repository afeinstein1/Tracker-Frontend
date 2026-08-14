import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

// Matches the indigo accent already used in global.css (--color-accent: #4f46e5 / #6366f1)
// so Chakra components don't look like a mismatched stock-blue reskin.
const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: '#eef2ff' },
          100: { value: '#e0e7ff' },
          200: { value: '#c7d2fe' },
          300: { value: '#a5b4fc' },
          400: { value: '#818cf8' },
          500: { value: '#6366f1' },
          600: { value: '#4f46e5' },
          700: { value: '#4338ca' },
          800: { value: '#3730a3' },
          900: { value: '#312e81' }
        }
      }
    },
    semanticTokens: {
      colors: {
        brand: {
          solid: { value: '{colors.brand.600}' },
          contrast: { value: 'white' },
          fg: { value: '{colors.brand.700}' },
          muted: { value: '{colors.brand.100}' },
          subtle: { value: '{colors.brand.50}' },
          emphasized: { value: '{colors.brand.300}' },
          focusRing: { value: '{colors.brand.600}' }
        }
      }
    }
  },
  // Chakra's own preflight resets html/body styling, which was winning over global.css's
  // `body { background-color: var(--color-background) }` - visible as a wall of white once you
  // scrolled past the initial viewport height. Forcing it here so our theme variable always wins.
  globalCss: {
    'html, body': {
      minHeight: '100%',
      backgroundColor: 'var(--color-background) !important'
    }
  }
})

export const system = createSystem(defaultConfig, config)
