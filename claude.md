**Project**: _My Awesome RA_
**Purpose**: AI Agent service for reference-grounded LaTeX paper writing
**Core Technologies**: Upstage SOLAR API, Document Parsing, Information Extraction, Streamlit
## Details
- Upstage API (https://console.upstage.ai/docs/getting-started)

## 1. Problem Definition

### 1.1 Background

Academic paper writing in LaTeX, especially for conference/journal submission, involves repetitive and high-friction tasks beyond actual ideation:

- Navigating submission rules and formatting requirements
- Managing growing reference sets
- Verifying whether written claims are correctly and precisely supported by cited literature

As the number of references and document sections increases, authors experience significant **context switching** between:

- LaTeX editors
- PDF viewers
- Reference managers
- Notes or memory-based tracking of “which paper supported which claim”

This workflow does not scale and degrades writing confidence over time.

---

### 1.2 Core Problem

> During multi-file LaTeX paper writing, it is difficult to maintain a **low-friction, durable mapping** between
> **(a) the claim currently being written** and
> **(b) the exact evidence span inside reference PDFs that supports it**.
>
> As sections are edited, moved, or rewritten, this mapping **decays over time**, leading to excessive context switching and internal consistency drift.

This problem is not solved by traditional reference managers or PDF annotation tools, because the mapping is **contextual to the author’s evolving LaTeX document**, not to static PDFs.

---

### 1.3 Subproblems

#### A. Evidence Grounding (External Consistency)

- **Input**: Current LaTeX context (sentence / paragraph / section at cursor)
- **Output**: Exact supporting evidence spans from reference PDFs
	(“Paper Z, page X, paragraph Y supports this claim”)
- **Pain Points**:
	- Manual PDF re-navigation
	- Loss of grounding confidence
	- Cognitive overload as references grow

#### B. Document Drift (Internal Consistency)

- Multi-file `.tex` documents evolve non-linearly
- Definitions, assumptions, and claims may:
	- diverge across sections
	- become duplicated or contradictory
	- remain cited but no longer justified by the original evidence
- This is treated as a **separate job** with independent acceptance criteria
