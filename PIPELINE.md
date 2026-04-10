# Marionette Studio: Global Pipeline Mapping (Disney GSS Alignment)

This document formalizes the integration of the 14-agent AI architecture with the **Disney 6-Stage Global Studios Standard (GSS)** and the internal **5-Layer R&R Framework**.

## 1. Disney 6-Stage Pipeline Mapping

We map our autonomous agents into the primary creative and production stages of the industry standard pipeline.

| Stage | Disney Standard Name | Marionette Agent Alignment |
|:---|:---|:---|
| **ST1** | **Creative / Development** | `WRIT`, `SCPT`, `CNCP`, `SETD`, `ASST` |
| **ST2** | **Greenlight** | *Governance / Executive Review Layer* |
| **ST3** | **Production** | `GEN`, `CINE`, `ASST` |
| **ST4** | **Post-Production** | `VFX`, `VOIC`, `EDIT`, `GRDE`, `SOND`, `SCOR`, `MSTR` |
| **ST5** | **Distribution** | *External Infrastructure* |
| **ST6** | **Marketing** | *Trailer/Promo Synthesis (Future Expansion)* |

---

## 2. 5-Layer R&R (Role & Responsibility) Framework

This framework defines the "Human-in-the-Loop" and "AI-Native" responsibilities for each agent.

- **L1: Physical Layer**: Reality / Set (N/A for Pure Digital)
- **L2: Development**: Script, Lore, Creative Architecture (`WRIT`, `SCPT`, `CNCP`, `SETD`)
- **L3: Production Management**: Scheduling, Editing, Review Workflow (`EDIT`, `MSTR`)
- **L4: Creative Control**: Human Director / Producer Interaction
- **L5: AI Technology**: Core Generative Engines (`GEN`, `CINE`, `VFX`, `VOIC`, `GRDE`, `SOND`, `SCOR`, `ASST`)

---

## 3. Detailed Agent Blueprint

| Agent | ID | Stage | Layer | Primary Engine Responsibility |
|:---|:---|:---|:---|:---|
| **Writer** | `WRIT` | ST1 | L2 | Story Synthesis & Screenwriting |
| **Script Analyst** | `SCPT` | ST1 | L2 | Breakdowns & Semantic Consistency |
| **Concept Artist** | `CNCP` | ST1 | L2 | Character DNA & Visual Pillars |
| **Set Designer** | `SETD` | ST1 | L2 | Spatial Architecture & Virtual Scenery |
| **Asset Forge** | `ASST` | ST1/ST3| L5 | 3D Geometry & Material Synthesis |
| **Previsualizer** | `GEN` | ST3 | L5 | Scene Synthesis & Layout |
| **Cinematographer**| `CINE` | ST3 | L5 | Virtual Camera Ops & Lighting |
| **VFX Artist** | `VFX` | ST4 | L5 | Technical Synthesis & Simulation |
| **Voice Talent** | `VOIC` | ST4 | L5 | Neural Voice Synthesis |
| **Editor** | `EDIT` | ST4 | L3 | Narrative Assembly & Pacing |
| **Colorist** | `GRDE` | ST4 | L5 | DI, Grading & ACES Workflow |
| **Sound Designer** | `SOND` | ST4 | L5 | SFX, Atmos & Foley |
| **Composer** | `SCOR` | ST4 | L5 | Orchestral & Synthetic Scoring |
| **Mastering** | `MSTR` | ST4 | L3/L5 | QC, Delivery & DCP Forge |

---

## 4. Architectural Goals

1. **Auteur Clarity**: The director understands exactly where each agent fits in the production lifecycle.
2. **High-Integrity Handover**: Standardized stages ensure data lineage (Vault) is preserved across departmental boundaries.
3. **Global Scalability**: Adhering to Disney GSS ensures the Marionette Pipeline can integrate with legacy studio workflows.
