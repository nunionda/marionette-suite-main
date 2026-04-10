# DESIGN.md: Marionette Suite — Auteur Elite 2.0

This document defines the visual language and user experience design for the **Marionette Suite**. It serves as the single source of truth for designers and engineers to ensure $WOW and premium visual excellence.

## 1. Aesthetic Thesis: "The Auteur's Command Center"

The Auteur Elite aesthetic is **Cinema Tech**—a fusion of high-end dark luxury and functional industrial design. It feels like an elite film studio HUD, prioritizing clarity, authority, and artistic soul.

- **Look**: Deep obsidian floors, champagne gold accents, silver-blue highlights.
- **Feel**: Solid, professional, responsive, and trustworthy.

## 2. Emotional Arc & UX Principles

### 2.1 The Emotional Journey
1.  **First 5 Seconds (Visceral)**: The user feels overwhelmed by a sense of professional authority and "Hollywood-grade" quality.
2.  **5 Minutes (Behavioral)**: The user discovers that despite the visual density, the system is intuitive and responsive. They feel "in control" of a complex 14-agent workforce.
3.  **Ongoing Relationship (Reflective)**: The user trusts the system as a true creative partner that handles the "grunt work" while respecting their artistic vision.

### 2.2 Explainable AI UX
- **Transparency**: Every AI decision (e.g., Script to Concept) must show its "reasoning" via technical metadata or brief intent tags.
- **Provenance**: Visualize the lineage of every asset from prompt to final render.
- **Agent Presence**: Agents are not just backends; they are "Digital Crew" members with distinct roles and visual identities.

### 2.3 Progressive Disclosure
- **Layer 1 (The Hook)**: High-level metrics and current "Shot" status.
- **Layer 2 (The Detail)**: Click/Hover reveals agent logs, metadata, and quality scores (SOQ).
- **Layer 3 (The Deep-Dive)**: Full asset history and manual overrides.

## 3. Design Tokens

### 3.1 Color Palette
| Token | Hex | Usage |
|-------|-----|-------|
| Base (Obsidian) | `#050505` | Primary background floor |
| Surface (Steel) | `#121212` | Components and panels |
| Accent (Gold) | `#D4AF37` | Primary brand color, headers, key CTAs |
| Accent (Silver) | `#A8A9AD` | Secondary icons and dim data |
| Status (Green) | `#27AE60` | Completed/Healthy states |
| Status (Red) | `#C0392B` | Error/Failed states |
| Status (Blue) | `#3498DB` | Processing/Vault assets |

### 3.2 Typography
- **Title/Display**: `Playfair Display` (Serif). Use for h1-h3 to evoke the feeling of a script or cinematic title.
- **Body/UI**: `Inter` (Sans-Serif). Use for all functional UI elements, forms, and general text.
- **Data/Mono**: `Space Grotesk` / `Geist Mono`. Use for IDs, pipeline status, and technical metrics.

### 3.3 Surface & Elevation
- **GStack Glass**: Translucent panels with `24px` backdrop blur and `rgba(255, 255, 255, 0.01)` background.
- **Elevation**: Use subtle inner box-shadows rather than drop shadows to maintain a "flush-mounted" HUD look.

## 4. Anti-Slop Rules

To maintain high-integrity design, the following are **STRICTLY PROHIBITED**:
1.  **No Generic Gradients**: Avoid standard linear gradients. Use noise-textured "mesh" gradients if depth is needed.
2.  **No Centered Everything**: Layouts must be asymmetric and balanced, reflecting professional editorial design.
3.  **No Decorative Blobs**: Every pixel must earn its right to exist through functional utility.
4.  **No "AI Generic" Icons**: Avoid standard Lucide icons in their default state. Customize stroke weights and colors to match the brand.
5.  **No 3-Column Feature Grids**: Use Bento layouts or narrative-driven flowing structures instead.

## 5. Animation & Motion
- **Narrative Flow**: Elements should transition with a sense of "story," moving logically from source to result.
- **Active State (Haze)**: Active agents pulse with a subtle gold glow (`#D4AF37` at 10% opacity).
- **Speed**: UI responses must be snap-fast (<100ms), while content transitions can take 300-500ms for cinematic smoothness.
