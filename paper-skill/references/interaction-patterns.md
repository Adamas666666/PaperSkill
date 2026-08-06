# Interaction Pattern Library

Give every chapter at least one active learner operation. Meet the density minimums in
`contract.md` §3: use at least `distinctPatternsMin` (6) of P1-P8 across the tutorial, and
use P1 in no more than `p1SliderChaptersMax` (4) chapters.

All controls must update the Canvas or explanatory feedback immediately. Preserve keyboard focus styles and use buttons for actions.

## Module Presentation Modes

The required automatic analogy animation is always life-based. Active body modules may use any of these modes:

- **Life metaphor:** direct manipulation of an object from the unified theme.
- **Mathematical/technical:** coordinate grids, feature maps, vectors, architecture graphs, equations, curves, bars, or verified result tables.
- **Hybrid linked views:** one user action updates both the life-metaphor view and the mathematical or technical view.

Choose the mode that makes the paper concept easiest to operate. Mathematical graphics are allowed and encouraged in active modules when they expose the real mechanism more clearly than metaphor. At least `mathOrHybridModulesMin` (4) modules should be mathematical/technical or hybrid, and at least `lifeOrHybridModulesMin` (4) should be life-metaphor or hybrid (per `contract.md` §3).

An active module must form this loop:

```text
learner action -> visible state change -> immediate feedback -> conceptual judgment
```

Hover-only explanations, passive autoplay, tooltip-only clicks, formula symbol definitions, and chapter-loader buttons do not count as primary active modules.

Read `visual-interaction-standard.md` before assigning patterns. Each module needs one dominant operation and one shared state model. The operation must update the main Canvas or active technical graphic plus the feedback sentence; also update a value, output, dimensions, selected path, or comparison bar whenever the concept has a meaningful quantity.

Prefer the reference page's compact composition: one dominant Canvas, one control row or direct-manipulation target, one stable detail region, and one feedback bar. A module may contain linked life and technical views, but it must not become a collection of unrelated mini dashboards.

## P1: Real-Time Slider and Canvas

Use for continuous parameters such as noise, temperature, step count, guidance, or learning rate.

Requirements:

- Label the parameter plainly in Simplified Chinese.
- Display the current value beside the label.
- Update on `input`, not only on `change`.
- Change both the scene and `.feedback` text immediately.
- Use green for useful, blue for intermediate, and red for harmful ranges.
- Do not use this pattern in more than four chapters.

## P2: Step-Through Visualizer

Use for training, sampling, inference, or forward and reverse motion within one simple activity.

Requirements:

- Provide previous or reset and next controls as appropriate.
- Show the current step and total steps.
- Explain the visible action in one short Simplified Chinese sentence per step.
- Disable or relabel the next button at completion.
- Preserve stable Canvas and control dimensions while content changes.
- Advance one subject through positions or states of the same action. Do not move an item through several stations or hand it between actors.

## P3: Synchronized Before and After

Use for unguided vs guided, old vs new, or ODE vs SDE comparisons.

Requirements:

- Use equivalent starting states and identical Canvas dimensions.
- Animate both sides on the same time basis.
- Mark the weak side red and the effective side green or blue.
- Keep labels visible without covering the scene.
- A draggable divider is acceptable when it directly improves comparison.
- When started by a button, use one shared start timestamp and hold both final states long enough to compare.

## P4: Mode Chips

Use for method variants, configuration choices, or several discrete modes.

Requirements:

- Use button-like `.chip` controls, not a tab interface.
- Keep one selected chip visually explicit.
- Update Canvas, feedback, and any values immediately.
- Use labels that identify the modes without a separate instruction paragraph.

## P5: Clickable Hotspots

Use for interactive architecture diagrams or parts of one recognizable object.

Requirements:

- Give clickable regions a pointer cursor and keyboard-equivalent controls when feasible.
- Highlight the active node with a pulse or strong outline.
- Put details in a stable information area below the Canvas, not a blocking popup.
- Keep hit testing aligned with CSS-scaled pointer coordinates.
- Require a meaningful state change, not a tooltip-only click. Selecting a component must update its highlight and the active path, values, output, or feedback.
- Use chips or step controls when the learner needs to switch routes or execution modes; use drag only when changing a connection expresses the architecture concept.
- Do not animate packages, data, or ingredients through stations.
- Pair Canvas-only hotspots with a keyboard-operable DOM control when feasible. Keep the detail panel fixed so selecting another component does not shift layout.

## P6: Drag to Explore

Use for distance, similarity, boundaries, paths, movable tools, or 2D parameter exploration.

Requirements:

- Make the draggable object visually obvious.
- Use grab and grabbing cursor states.
- Support pointer events so mouse and touch follow one path.
- Clamp motion to the Canvas.
- Update the scene and feedback during the drag.
- Make the drag operation itself express the concept.

## P7: Auto-Play with Hover Pause

Use only as a supporting demonstration or analogy animation.

Requirements:

- Pause on hover when that helps inspection.
- Pause off-screen with `IntersectionObserver`.
- Resume without a visible play or replay instruction.
- Never use P7 as a chapter's only interaction.
- Add an explicit click, chip, step, drag, or button operation if the module must count toward the active-module total.

## P8: Result Race

Use for Chapter 10 benchmark comparisons.

Requirements:

- Start only after the learner activates a clear comparison button.
- Animate verified values from zero or a shared baseline.
- Stagger growth or travel slightly for readability.
- Highlight the paper's method without hiding competitors.
- Show a trophy only when the verified metric supports the win.
- Allow replay through a normal command button, without drawing replay copy on Canvas.

## Default Assignment

This is the default mapping for a 10-chapter tutorial (per `contract.md` §2). Adapt it to
the paper and to `chapterCount` (6–10) by merging or splitting adjacent roles; preserve
variety and the P1 cap regardless of count.

| Chapter | Default pattern |
| --- | --- |
| 1 | P1, corruption strength |
| 2 | P6, representation placement |
| 3 | P2, forward and reverse sequence |
| 4 | P1 or P6, framework parameter |
| 5 | P4, guidance modes |
| 6 | P3, inference variants |
| 7 | P2, training iterations |
| 8 | P5 plus P4 or P2, an interactive simplified architecture module |
| 9 | P6 plus P7, review or auxiliary behavior |
| 10 | P8, verified result comparison |

Do not fall back to a page dominated by sliders. Choose the operation that best matches the concept, then implement the simplest complete version of that operation.

## High-Clarity Pairings

Prefer these combinations when they fit the paper:

- P1 plus a binary repair button: stress the old method, then apply the paper method under the same conditions.
- P5 plus a technical inset: click a position, layer, or stage and update both the recurring scene and feature, tensor, or architecture details.
- P3 plus one shared start button: compare old and new methods from equal starting states.
- P4 plus compact trade-off bars: switch variants and update geometry, parameters, compute, quality, and feedback together.
- P2 plus stable dimensions: advance through inference or architecture while the route stays fixed and only active state, output, and feedback change.
- P1 or P6 plus a technical curve: connect a physical cue such as pace, width, tension, or distance to a paper-grounded mathematical quantity.
- P8 plus a verified evidence table: use animation to reveal the comparison and the table to preserve exact values.

These are compositions, not chapter-number assignments. Choose the smallest interaction that makes the paper mechanism visible.
