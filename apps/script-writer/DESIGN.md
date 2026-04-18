# Cine Script Writer: Design Specification
**Concept**: Advanced Production Studio (B-Plan)

## 1. Visual Identity
A "Command & Control" center for professional screenwriters. High-density, performance-oriented UI with cinematic visual feedback.

## 2. Color Palette (Studio Obsidian)
| Token | Hex | Usage |
|-------|-----|-------|
| `bg-primary` | `#050505` | Main interface background |
| `bg-secondary` | `#0E0E10` | Sidebar, panels, cards |
| `accent-primary` | `#8B5CF6` | Primary actions, "Signal Violet" glows |
| `accent-success` | `#10B981` | Completion, "Cinema Mint" |
| `text-primary` | `#F3F4F6` | Primary headings and body |
| `text-muted` | `#9CA3AF` | Supporting labels and metadata |
| `border-subtle` | `#1F2937` | High-density grid lines |

## 3. Typography
- **UI Font**: `Inter` (Variable) - Sans-serif for maximum readability at high density.
- **Code/Script Font**: `JetBrains Mono` - For script segments, logs, and ID indicators.
- **Weighting**: Book (400) for body, Medium (500) for UI, Bold (700) for Section Headers.

## 4. Layout System
- **Density**: High (Compact spacing, 4px - 8px increments).
- **Framework**: Multi-pane "Dashboard" layout inspired by DaVinci Resolve.
- **Components**: 
    - **Header**: Global navigation + AI Orchestration Status.
    - **Sidebar**: Quick navigation and project history.
    - **Stage Controller**: Tabbed view for Scenario → Script → Refinement.
    - **Output Panel**: The "Cinematic Preview" (Main script output).

## 5. Visual Language
- **Glows**: Subtle violet shadows/glows for active items (Inspired by Frame.io).
- **Glassmorphism**: Backdrop blur (8px) for overlays and floating panels.
- **Corners**: Precise 4px rounding (Technical/Professional feel).
- **Motion**: Linear-to-Ease-Out (200ms) for most transitions.

## 6. Component strategy
- **Status Indicators**: Pulse animations for "In-Progress" states.
- **Buttons**: Flat, minimal borders, high-contrast hover highlights.
