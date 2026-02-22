# Content Design Template

> Follow this process for **every** new module before writing code.
> Output goes into `docs/content_spec.md` under the module's section.

---

## Step 1: Prerequisites Audit

Before designing content, answer:

- [ ] What **must** the learner already know?
- [ ] Which previous modules cover those prerequisites?
- [ ] Are there any concepts we might **assume** but shouldn't?

```
Prerequisites: [list module IDs]
Assumed knowledge: [concepts NOT taught in prereqs]
```

---

## Step 2: Learning Objectives

What should the learner be able to **do** after completing this module?

Write 3–5 objectives using action verbs:

```
After this module, the learner can:
1. [Explain / Identify / Compute / Visualize / Apply] ...
2. ...
3. ...
```

---

## Step 3: Concept Inventory

List **every** concept the module touches. Classify each:

| Concept        | Status       | Notes                           |
| -------------- | ------------ | ------------------------------- |
| [concept name] | 🆕 Introduce | First time learner sees this    |
| [concept name] | 🔄 Reinforce | Covered before, building deeper |
| [concept name] | ✅ Assume    | Prereq, just reference          |

> **Rule**: No concept should be 🆕 without at least one step dedicated to it.
> If a concept is important enough to mention, it's important enough to teach.

---

## Step 4: Step Flow Design

Design 8–15 guided steps. For each step, specify:

```markdown
#### Step N — [Title]

- **Viz**: [What the visualization shows, what's interactive]
- **Content**: [2-3 sentence intuitive explanation, plain language]
- **Go Deeper**: [KaTeX math + formal definition + references]
- **Quiz**: [Optional — question + 4 options + correct answer + explanation]
- **Author's Note**: [Optional — personal insight, when relevant]
```

### Step Design Rules

1. **Start concrete, end abstract** — begin with something you can see/drag, build toward formal definitions
2. **One concept per step** — never introduce two new ideas simultaneously
3. **Show before tell** — the visualization should make the concept obvious before the text explains it
4. **Every 2-3 steps: a quiz** — reinforces learning, breaks up passive reading
5. **First step = zero prereqs** — even if the module has prereqs, step 1 should feel approachable
6. **Last step = connection forward** — always end with "why this matters for AI/ML" or "what's next"
7. **Go Deeper is optional reading** — the main content must stand alone without it

### Pacing Guide

| Step Count | Module Complexity                          | Est. Time |
| ---------- | ------------------------------------------ | --------- |
| 8–10       | Light (single concept family)              | ~15 min   |
| 11–13      | Medium (concept + operations + properties) | ~25 min   |
| 14–16      | Heavy (foundational, many sub-concepts)    | ~30 min   |

---

## Step 5: Playground Config

List all parameters the free exploration mode exposes:

| Parameter | Control Type                       | Range   | Default   |
| --------- | ---------------------------------- | ------- | --------- |
| [name]    | Slider / Toggle / Stepper / Button | [range] | [default] |

**Try This prompts** (4–6): guided exploration questions that lead to "aha" moments.

---

## Step 6: Challenge Design

Design 3–4 challenges of increasing difficulty:

| #   | Title  | Difficulty | Goal         | Completion Criteria    |
| --- | ------ | ---------- | ------------ | ---------------------- |
| 1   | [name] | Easy       | [what to do] | [measurable condition] |
| 2   | [name] | Medium     | [what to do] | [measurable condition] |
| 3   | [name] | Hard       | [what to do] | [measurable condition] |

### Challenge Rules

1. Challenges must use the **same visualization** as the guided steps
2. No new concepts — only application of what was taught
3. Progressive hints (2–3 per challenge)
4. Clear, measurable completion (distance < X, accuracy > Y, etc.)

---

## Step 7: Visualization Requirements

Specify what the visualization component needs to support:

```
Component: [name, e.g., VectorTransform]
Library: [Mafs / Canvas / React Three Fiber / Konva]

Required features:
- [ ] [feature 1]
- [ ] [feature 2]

Interactive elements:
- [ ] [draggable, slider, toggle, etc.]

Data inputs:
- [ ] [what props it needs]
```

---

## Step 8: Review Checklist

Before marking the content spec as complete:

- [ ] Every 🆕 concept has a dedicated step
- [ ] No step introduces more than one new concept
- [ ] Quizzes appear every 2–3 steps
- [ ] Step 1 is approachable with zero context
- [ ] Last step connects to AI/ML
- [ ] Playground exposes all relevant parameters
- [ ] Challenges are solvable with only taught concepts
- [ ] Estimated time is realistic (test by reading aloud)
- [ ] Go Deeper math is correct (verify formulas)
- [ ] Prerequisites are accurate and complete
