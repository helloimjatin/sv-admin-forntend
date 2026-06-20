---
name: Clinical Precision
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3d4943'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6d7a73'
  outline-variant: '#bccac1'
  surface-tint: '#006c4e'
  primary: '#00694c'
  on-primary: '#ffffff'
  primary-container: '#008560'
  on-primary-container: '#f5fff7'
  inverse-primary: '#68dbae'
  secondary: '#50625d'
  on-secondary: '#ffffff'
  secondary-container: '#d3e7e0'
  on-secondary-container: '#566863'
  tertiary: '#825100'
  on-tertiary: '#ffffff'
  tertiary-container: '#a36700'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#86f8c9'
  primary-fixed-dim: '#68dbae'
  on-primary-fixed: '#002115'
  on-primary-fixed-variant: '#00513a'
  secondary-fixed: '#d3e7e0'
  secondary-fixed-dim: '#b7cbc4'
  on-secondary-fixed: '#0d1f1b'
  on-secondary-fixed-variant: '#394a45'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-mono:
    fontFamily: jetbrainsMono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-padding: 24px
  gutter: 16px
  stack-sm: 4px
  stack-md: 12px
  stack-lg: 24px
---

## Brand & Style

The design system is engineered for a medical-grade administrative environment where clarity, efficiency, and professional trust are paramount. The aesthetic is strictly **Minimalist** with a **Corporate Modern** foundation, prioritizing high legibility for data-dense interfaces. 

By utilizing a flat design language, the UI removes visual noise to allow healthcare administrators to focus on critical patient data and operational metrics. The emotional response is one of calm authority—achieved through generous whitespace, a restricted color palette, and a "hairline" border treatment that replaces traditional shadows for a lighter, more contemporary feel.

## Colors

The color strategy for the design system centers on a professional emerald green, symbolizing health and growth. 

- **Primary Green (#1D9E75):** Used for primary actions, active navigation states, and success indicators.
- **Surface Fills (#E1F5EE):** A soft mint wash used for subtle background highlights, selected list items, or secondary button states to maintain a low-strain visual environment.
- **Semantic Accents:** Coral/Red is reserved strictly for blocked patient states or critical errors. Amber is utilized for warnings and pending reviews.
- **Neutrals:** A range of slates (from #F8FAFC to #1E293B) provides structural hierarchy without the harshness of pure black.

## Typography

This design system utilizes **Hanken Grotesk** as its primary typeface. It was chosen for its sharp, contemporary geometry and exceptional legibility at small sizes—crucial for an admin panel containing complex tables and patient records.

For technical identifiers such as Patient IDs or medical codes, a secondary monospaced font (**JetBrains Mono**) is introduced to ensure character distinction and alignment in data grids. Typography scaling is conservative to maximize information density while maintaining a clear hierarchy through weight and subtle letter-spacing adjustments.

## Layout & Spacing

The design system employs a **Fluid Grid** layout model with a 12-column structure for dashboard views. To accommodate the vast amount of medical data, the system relies on a 4px/8px baseline rhythm.

- **Desktop:** 24px outer margins with 16px gutters between cards.
- **Tablet:** 16px outer margins. Sidebar collapses to an icon-only rail to preserve horizontal space.
- **Mobile:** Single column flow with 12px margins.

Whitespace is used intentionally as a separator rather than lines whenever possible, creating a "breathable" interface despite the high density of information.

## Elevation & Depth

In alignment with the "medical-grade" brief, the design system avoids heavy drop shadows. Depth is communicated through **Low-contrast outlines** and **Tonal Layering**.

- **Surface Level 0:** The main background uses a light slate (#F8FAFC).
- **Surface Level 1:** Cards and containers use pure white (#FFFFFF) with a 0.5px solid border (#E2E8F0).
- **Surface Level 2:** Modals and flyouts use a 0.5px border but may incorporate a very soft, diffused ambient shadow (4px blur, 2% opacity) only to provide a slight lift from the primary surface.

Interactive elements use a 1px border on hover to signify state changes without shifting the layout.

## Shapes

The shape language is consistently **Rounded**, striking a balance between clinical precision and approachable software.

- **Cards and Containers:** Use Level 2 roundedness (8px / 0.5rem) to soften the modular layout.
- **Buttons and Inputs:** Also follow the Level 2 standard for a uniform interactive language.
- **Status Chips:** Use Level 3 (Pill-shaped) to distinguish them clearly from interactive buttons and data cells.

## Components

### Buttons
Primary buttons are solid Green (#1D9E75) with white text. Secondary buttons use the light green fill (#E1F5EE) with green text. All buttons feature the 0.5rem corner radius and no shadows.

### Data Tables
The core of the admin panel. Tables use 0.5px horizontal dividers only. Header rows use `label-sm` typography with a subtle background fill. Row height is compact (48px) to maximize data visibility.

### Status Chips
Small, pill-shaped indicators.
- **Active:** Green text on light green background.
- **Blocked:** Red text on light coral background.
- **Warning:** Amber text on light amber background.

### Input Fields
Inputs are defined by a 0.5px border. On focus, the border transitions to 1px Primary Green. Labels are positioned above the field using `body-md` bold for clarity.

### Cards
White surfaces with 0.5px borders. Card headers should be separated from the body by a subtle 0.5px line if the card contains mixed content types (e.g., a chart and a list).