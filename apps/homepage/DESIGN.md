# Design System: Marionette Studios

## 1. Visual Theme & Atmosphere

Marionette Studios' website embodies the intersection of cinematic prestige and cutting-edge AI technology -- a digital equivalent of walking into a private screening room at Korea's top film studio. The mood is dark, luxurious, and confident. Every element whispers "premium production company" rather than shouting it.

The design draws from luxury watch brand aesthetics crossed with MOFAC Studios' cinematic gravitas. Dark surfaces create a theatrical backdrop where golden accents become the spotlight. Typography is deliberately elegant -- serif for headlines conveys tradition and craft, while geometric sans-serif labels add technical precision. The overall impression: "This is where Korea's most ambitious films are made."

**Key Characteristics:**
- Deep black backgrounds (#080808, #131313) create theatrical darkness
- Gold accents (#c9a84c, #e6c364) function as spotlight/key light metaphor
- Serif typography (Noto Serif) for headlines conveys tradition and auteur credibility
- Geometric sans-serif (Space Grotesk) for labels adds technical precision
- Subtle film grain texture in hero section creates cinematic atmosphere
- Grayscale-to-color hover transitions on images evoke film development
- Generous whitespace between sections creates breathing room like cinema letterboxing

## 2. Color Palette & Roles

### Primary
- **Marionette Gold** (`#c9a84c`): Primary brand accent, used sparingly for maximum impact
- **Gold Light** (`#e6c364`): Hover states, gradients, CTAs
- **Gold Dim** (`rgba(201, 168, 76, 0.15)`): Subtle backgrounds, borders on dark

### Backgrounds
- **Deep Black** (`#080808`): Primary page background, header
- **Surface Dark** (`#131313`): Cards, elevated sections
- **Surface Container** (`#1c1b1b`): Input backgrounds, subtle containers
- **Surface Container Low** (`#201f1f`): Higher elevation surfaces
- **Surface Container High** (`#2a2a2a`): Cards, highlighted areas
- **Surface Container Highest** (`#353534`): Modal overlays, dropdowns

### Text
- **On Surface** (`#e5e2e1`): Primary text, headings
- **On Surface Variant** (`#d0c5b2`): Secondary text, descriptions (warm off-white)
- **Muted** (`#99907e`): Tertiary text, metadata

### Borders
- **Outline** (`#99907e`): Input borders, dividers
- **Outline Variant** (`#4d4637`): Subtle borders, dividers
- **White 5%** (`rgba(255,255,255,0.05)`): Hairline separators

### Interactive States
- **Primary Hover** (`#b89a42`): Darker gold for button hover
- **Focus Ring** (`hsla(212, 100%, 48%, 1)`): Blue focus for accessibility

## 3. Typography Rules

### Font Family
- **Headlines**: `Noto Serif`, fallback: Georgia, serif
- **Body**: `Manrope`, fallback: system-ui, sans-serif
- **Labels/Technical**: `Space Grotesk`, fallback: monospace
- **Material Icons**: `Material Symbols Outlined`

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display Hero | Noto Serif | 48-72px | 700 | 1.0-1.1 | 0 | Large cinematic headlines |
| Section Heading | Noto Serif | 32-40px | 700 | 1.2 | 0 | Section titles |
| Card Title | Noto Serif | 24px | 700 | 1.3 | 0 | Work titles, team names |
| Body Large | Manrope | 18-20px | 400 | 1.6-1.8 | 0 | Introductions, descriptions |
| Body | Manrope | 16px | 400 | 1.5 | 0 | Standard text |
| Label Small | Space Grotesk | 12-14px | 500 | 1.0 | 0.1-0.2em | Eyebrow text, tags, uppercase labels |
| Button | Space Grotesk | 14px | 700 | 1.0 | 0.15em | CTA buttons, uppercase |

### Principles
- **Serif authority**: Headlines use Noto Serif to convey auteur credibility and traditional craft
- **Sans-serif precision**: Labels and technical text use Space Grotesk for modern, precise feel
- **Generous tracking on labels**: Uppercase labels use letter-spacing 0.1-0.2em for elegance
- **Warm body text**: Body text uses slightly warm off-white (#e5e2e1) not pure white
- **Line height breathing room**: Headlines run tight (1.0-1.2), body text breathes (1.5-1.8)

## 4. Component Stylings

### Buttons

**Primary CTA (Gilded Gradient)**
```
background: linear-gradient(135deg, #e6c364 0%, #c9a84c 100%)
text: #3d2e00 (dark gold)
padding: 16px 32px
radius: 4px (small, subtle rounding)
font: Space Grotesk 14px weight 700, letter-spacing 0.15em, uppercase
transition: transform 0.2s ease, box-shadow 0.2s ease
hover: scale(0.98), subtle shadow
active: scale(0.95)
```

**Ghost Button**
```
background: transparent
text: #c9a84c
border: 1px solid rgba(201, 168, 76, 0.3)
padding: 16px 32px
radius: 4px
font: Space Grotesk 14px weight 700, letter-spacing 0.15em, uppercase
hover: background rgba(201, 168, 76, 0.1)
```

**Text Link**
```
text: #c9a84c
font: Manrope 16px weight 500
underline on hover
```

### Cards

**Work Card**
```
background: #1c1b1b
border-radius: 8px
overflow: hidden
image: aspect-ratio 16/9, grayscale filter
hover: image removes grayscale, scale(1.02)
overlay: gradient from transparent to rgba(0,0,0,0.6) at bottom
```

**Team Card**
```
background: transparent
image: aspect-ratio 3/4, grayscale filter
border-radius: 8px
hover: image removes grayscale
name: Noto Serif 24px weight 700
role: Space Grotesk 12px, gold color, uppercase, wide tracking
bio: Manrope 14px, muted color
```

**Stat Card**
```
background: #1c1b1b
border-left: 2px solid #c9a84c
padding: 32px
label: Space Grotesk 12px, gold, uppercase, wide tracking
value: Noto Serif 40-48px weight 700
```

### Navigation

**Header**
```
background: #080808 with backdrop-blur
position: fixed, top 0
logo: Space Grotesk 20px, weight 700, tracking 0.2em, gold color
nav links: Manrope 14px, muted color
hover: gold color
active: gold color
CTA button: ghost style, "ENTER STUDIO" uppercase
```

### Forms

**Input Field**
```
background: transparent
border-bottom: 1px solid #4d4637
padding: 16px 0
font: Space Grotesk 14px, tracking 0.1em, uppercase
placeholder: #666666
focus: border-color #c9a84c
transition: border-color 0.2s ease
```

**Textarea**
```
Same as input
min-height: 120px
resize: vertical
```

### Film/Image Treatment

**Image Grayscale to Color**
```
initial: filter grayscale(100%)
hover: filter grayscale(0%)
transition: filter 0.7s ease, transform 0.3s ease
scale on hover: scale(1.02-1.05)
```

## 5. Layout Principles

### Container & Spacing
- Max width: 1200px
- Section padding: 96px vertical (desktop), 64px (tablet), 48px (mobile)
- Component gap: 24-32px
- Grid: 12-column with 24px gutters

### Section Rhythm
```
Hero: Full viewport height, dark gradient overlay
Stats: Horizontal 3-column grid, bordered cards
Works: Vertical stack with generous spacing (80px between items)
Team: 2-column grid on desktop, stacked on mobile
Pipeline: Horizontal 4-step flow with arrows
Contact: 2-column (info + form) or stacked
Footer: Multi-row, minimal
```

### Responsive Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | <640px | Single column, reduced padding, stacked layouts |
| Tablet | 640-1024px | 2-column grids where applicable |
| Desktop | 1024-1280px | Full layout, 3-column works grid |
| Large Desktop | >1280px | Centered content, max-width 1200px |

### Grid Layouts
- Works: 1 column (mobile) → 1 column (tablet) → 3 columns (desktop)
- Team: 1 column (mobile) → 2 columns (desktop)
- Stats: 1 column (mobile) → 3 columns (desktop)
- Contact: 1 column (mobile) → 2 columns (desktop)

## 6. Depth & Elevation

### Shadow System
| Level | Treatment | Use |
|-------|-----------|-----|
| Flat | No shadow | Page background |
| Subtle | `0 2px 4px rgba(0,0,0,0.3)` | Minimal card lift |
| Card | `0 4px 12px rgba(0,0,0,0.4)` | Standard cards |
| Elevated | `0 8px 24px rgba(0,0,0,0.5)` | Modals, dropdowns |

### Glass Panel Effect
```
background: rgba(19, 19, 19, 0.7)
backdrop-filter: blur(16px)
```

### Film Grain Texture (Hero)
```
background-image: url("data:image/svg+xml,...")
opacity: 0.03-0.05
```

## 7. Do's and Don'ts

### Do
- Use gold (#c9a84c) sparingly -- it's the spotlight, not the stage
- Use Noto Serif for all headlines and titles -- authorial credibility
- Apply grayscale-to-color transitions on images -- cinematic reveal effect
- Use uppercase with wide tracking for labels and eyebrows -- elegant hierarchy
- Maintain generous vertical spacing between sections -- cinematic letterboxing feel
- Use warm off-white (#e5e2e1) for body text -- comfortable reading
- Keep CTAs minimal and impactful -- quality over quantity

### Don't
- Don't use gold for large background areas -- reserve for accents
- Don't mix serif fonts arbitrarily -- Noto Serif for headlines only
- Don't use pure black (#000000) for backgrounds -- use #080808 or #131313
- Don't over-design cards -- let the content (film images) be the hero
- Don't use more than 3 colors actively -- black, gold, warm white
- Don't make CTAs too large or numerous -- one primary CTA per section
- Don't skip hover states on interactive elements -- they're crucial for perceived quality

## 8. Responsive Behavior

### Mobile (<640px)
- Section padding: 48px vertical
- Single column layouts
- Reduced headline sizes (48px → 36px)
- Stack team cards vertically
- Full-width CTAs
- Hamburger navigation (optional)

### Tablet (640-1024px)
- Section padding: 64px vertical
- 2-column grids where applicable
- Moderate headline sizes (48px → 40px)
- Inline team cards (photo + text side by side)

### Desktop (1024-1280px)
- Section padding: 96px vertical
- Full layout with 3-column works grid
- Hero: 72px headline, full gradient overlay
- Full navigation visible

### Large Desktop (>1280px)
- Centered content with max-width 1200px
- Generous margins
- Maximum typography scale

### Image Behavior
- Maintain aspect ratios: 16:9 for works, 3:4 for team
- Grayscale filter on load, reveal on hover
- Scale slightly on hover (1.02-1.05)
- Object-fit: cover for consistent framing

## 9. Agent Prompt Guide

### Quick Color Reference
- Primary Accent: Gold (`#c9a84c`)
- Gold Light: (`#e6c364`)
- Background: Deep Black (`#080808`)
- Surface: Dark (`#131313`)
- Surface Elevated: (`#1c1b1b`)
- Text Primary: Warm White (`#e5e2e1`)
- Text Secondary: Warm Gray (`#d0c5b2`)
- Text Muted: (`#99907e`)

### Example Component Prompts

**Hero Section**
```
Create a hero section with full viewport height. Background: #080808 with gradient overlay (transparent to rgba(8,8,8,0.8) from top to bottom). Add subtle film grain texture overlay at 3% opacity. Company name "MARIONETTE STUDIOS" in Noto Serif 72px weight 700, white color, centered. Subtitle "AI 영상제작의 미래" in Manrope 20px, warm gray color. CTA button: gold gradient background (#e6c364 to #c9a84c), dark text (#3d2e00), uppercase Space Grotesk 14px weight 700.
```

**Stats Section**
```
Create a stats section with 3 cards in a row. Background: #131313. Each card: #1c1b1b background, 2px left border in #c9a84c, padding 32px. Label: Space Grotesk 12px, #c9a84c, uppercase, letter-spacing 0.15em. Value: Noto Serif 48px weight 700, #e5e2e1.
```

**Work Card**
```
Create a work card with image container (16:9 aspect ratio). Image starts grayscale(100%), hover removes grayscale and scales to 1.05 over 0.7s. Card background: #1c1b1b, border-radius 8px. Title: Noto Serif 24px weight 700. Tag: Space Grotesk 10px, #c9a84c, uppercase.
```

**Team Card**
```
Create a team card with vertical layout. Photo: aspect-ratio 3/4, grayscale, border-radius 8px, hover reveals color. Name: Noto Serif 24px weight 700. Role: Space Grotesk 12px, #c9a84c, uppercase, letter-spacing 0.15em. Bio: Manrope 14px, #99907e.
```

**Contact Form**
```
Create a contact form with underline-style inputs. Input: transparent background, border-bottom 1px solid #4d4637, padding 16px 0. Label: Space Grotesk 14px, uppercase, letter-spacing 0.1em, #99907e. Focus state: border-color #c9a84c. Submit button: full width, gold gradient background, dark text, uppercase.
```

### Korean Content Guidelines
- Korean text: Use Noto Serif KR for headings, Manrope for body
- English text: Use Space Grotesk with wide letter-spacing for labels
- Mixed language: Korean headlines, English technical labels
- Numbers: Arabic numerals with Korean context labels

### Animation Timing
- Grayscale transition: 0.7s ease
- Scale transform: 0.3s ease
- Color transitions: 0.2-0.3s ease
- Page transitions: 0.4s ease-out
