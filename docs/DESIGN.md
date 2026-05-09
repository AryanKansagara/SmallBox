# SmallBox Design System

## 1. Brand Identity
**Product:** SmallBox — Enterprise tools for small businesses, powered by IBM  
**Tagline:** Enterprise-grade tools. Small business price: free.  
**Personality:** Trustworthy, empowering, modern, approachable

---

## 2. Color Palette

### Core Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#0062FF` | IBM Blue — CTAs, links, active states, accents |
| `primary-hover` | `#0050D0` | Hover on primary buttons |
| `primary-light` | `#EBF2FF` | Light bg tints, badge backgrounds |
| `background` | `#0A0E1A` | Page/app background (deep navy) |
| `surface` | `#111827` | Card surfaces, sidebar |
| `surface-2` | `#1A2235` | Elevated cards, modals |
| `surface-3` | `#232F45` | Hover states on cards |
| `border` | `#2A3A55` | Dividers, card borders |
| `text-primary` | `#FFFFFF` | Headlines, primary text |
| `text-secondary` | `#8B9CB6` | Supporting/muted text |
| `text-muted` | `#4B5E7A` | Placeholders, disabled |

### Semantic Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `success` | `#10B981` | Positive values, income |
| `danger` | `#EF4444` | Errors, negative values |
| `warning` | `#F59E0B` | Alerts, budget warnings |
| `info` | `#38BDF8` | Info states |

---

## 3. Typography

| Level | Font | Size | Weight | Line Height |
|-------|------|------|--------|-------------|
| Display | Inter | 72px | 800 | 1.1 |
| H1 | Inter | 48px | 700 | 1.15 |
| H2 | Inter | 36px | 700 | 1.2 |
| H3 | Inter | 24px | 600 | 1.3 |
| H4 | Inter | 18px | 600 | 1.4 |
| Body | Inter | 16px | 400 | 1.6 |
| Small | Inter | 14px | 400 | 1.5 |
| Caption | Inter | 12px | 400 | 1.4 |

---

## 4. Spacing
Base unit: 4px  
Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128

---

## 5. Border Radius
| Token | Value | Usage |
|-------|-------|-------|
| `rounded-sm` | 4px | Tags, badges |
| `rounded` | 8px | Inputs, small cards |
| `rounded-lg` | 12px | Standard cards |
| `rounded-xl` | 16px | Feature cards, modals |
| `rounded-2xl` | 20px | Large containers |
| `rounded-full` | 9999px | Buttons, avatars, pills |

---

## 6. Shadows & Elevation
```
shadow-card: 0 4px 24px rgba(0, 0, 0, 0.4)
shadow-elevated: 0 8px 40px rgba(0, 98, 255, 0.15)
shadow-glow: 0 0 40px rgba(0, 98, 255, 0.3)
```

---

## 7. Components

### Buttons
- **Primary:** IBM Blue filled, rounded-full, px-6 py-3, white text, hover brightness-110 + shadow-glow
- **Secondary:** Transparent with border-primary, rounded-full, IBM blue text, hover bg-primary/10
- **Ghost:** No border, text-secondary, hover text-primary

### Cards
- Background: `surface` (#111827)
- Border: 1px solid `border`
- Border-radius: `rounded-xl`
- Padding: 24px
- Hover: bg-surface-2, border-primary/40, translateY(-2px) transition

### Sidebar
- Width: 240px (collapsed: 64px)
- Background: `surface` with border-right
- Nav items: icon + label, active state: bg-primary/10 + text-primary + left border 3px primary

### Navigation Bar
- Glassmorphism: backdrop-blur-md, bg-background/80
- Border-bottom: 1px solid border
- Height: 64px

---

## 8. Icons
Library: **Lucide React**  
Default size: 20px  
Color: inherit from parent

---

## 9. Motion & Animation
| Type | Duration | Easing |
|------|----------|--------|
| Micro (hover) | 150ms | ease-out |
| Standard | 300ms | cubic-bezier(0.4, 0, 0.2, 1) |
| Entrance | 500ms | cubic-bezier(0.0, 0, 0.2, 1) |
| Spring | 600ms | spring(stiffness: 300, damping: 30) |

**Framer Motion patterns:**
- Cards: `whileHover={{ y: -4, boxShadow: "0 0 40px rgba(0,98,255,0.3)" }}`
- Buttons: `whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}`
- Page entrance: `initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}`
- Stagger children: `staggerChildren: 0.08`
