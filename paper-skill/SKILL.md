---
name: "paper-skill"
description: "Analyze a machine-learning or AI paper and produce a polished Simplified Chinese interactive tutorial as a React + TypeScript (Vite) project folder. Use when a user provides a paper as a PDF, text, URL, or detailed description and wants an educational web app. Run two phases in one invocation: build a paper-specific tutorial skill in a task-scoped temporary directory, immediately use it to generate and validate the React+TS project folder, then delete the temporary skill (unless debug mode is on). Deliver only the final <paper-short-name>_output/ folder."
---

# Paper Tutorial Generator

Turn one machine-learning or AI paper into one self-contained Simplified Chinese interactive tutorial delivered as a **React + TypeScript (Vite) project folder**. Preserve the two-phase design, but execute both phases continuously in the same task.

All agent-facing instructions in this skill and its sub-files are in **English**. The final tutorial (visible prose, labels, feedback, analogy copy) is always in **Simplified Chinese**.

## Single Source of Truth

All hard numeric constraints and the color semantics live in **`contract.md`**. Do not
re-state or hard-code those numbers anywhere else — reference the relevant § instead. If
you change a number, change it only in `contract.md`.

## Required Outcome

Produce exactly one persistent deliverable in the caller's original working directory:

`<paper-short-name>_output/`  — a self-contained React + TypeScript (Vite) project folder.

Use a paper-specific skill only as an internal intermediate artifact. Create it under a
task-scoped temporary root, consume it immediately, and remove it before the final
response (unless `PAPER_SKILL_DEBUG=true`; see below). Never write that intermediate skill
under `skills/`, the workspace, or another persistent location. Never expose its path or
contents to the user.

## Continuous Two-Phase Contract

```text
paper PDF, text, URL, or description
  -> Phase 1: analyze the paper and build a temporary paperSkill
  -> validate the temporary paperSkill (agent checklist + validate-output.js on a dry run if possible)
  -> Phase 2: immediately execute that paperSkill
  -> scaffold the React+TS project folder (scaffold.js) and fill src/data/tutorial.ts / paper.css / modules / images
  -> validate the project folder (validate-output.js)
  -> delete the temporary paperSkill (unless debug)
  -> return only the final folder path
```

Do not stop, ask for confirmation, or send a final response between phases. If either phase
is blocked, clean up the temporary paperSkill before reporting the blocker.

## Phase 1 Required Reading (rules for building the intermediate skill)

These files are the **Phase 1** rule set. Read them once, before generating the
intermediate paperSkill. They teach how to build a self-contained intermediate
skill; they are NOT read again in Phase 2.

1. `contract.md` — all hard numbers and color semantics (read first).
2. `scripts/generation-pipeline.md` for the complete execution sequence.
3. `references/philosophy.md` for the instructional design principles.
4. `references/metaphor-library.md` for selecting one unified everyday theme and the chapter-count-matching set of simple actions.
5. `references/animation-library.md` for the one-subject, one-action Canvas contract.
6. `references/interaction-patterns.md` for active interaction patterns P1–P8.
7. `references/visual-interaction-standard.md` for the universal Canvas grammar, interaction compositions, technical insets, color pairing, and cross-domain adaptation rules.
8. `scripts/chapter-template.md` for the required chapter narrative order.
9. `templates/skill-template.md` for the temporary paperSkill structure.
10. `references/intermediate-skill-standard.md` for the expected intermediate Skill detail and section order.
11. `scripts/validation-checklist.md` for both validation gates and cleanup.

## Phase 2 Reading Scope (strict — do not read original paper-skill documents)

Phase 2 only executes the intermediate skill. Its entire input is:

- the temporary intermediate `SKILL.md` (already implementation-ready), and
- the `assets/react-template/` directory copied beside it (the full Vite+React+TS scaffold), and
- `scaffold.js` — a portable build helper that sits beside `assets/` in the temporary
  root and copies the template into the caller's working directory (run it, do not modify it), and
- running `scripts/validate-output.js` as the hard structural gate.

Do **not** open the original paper-skill's `SKILL.md`, `contract.md`,
`references/`, `scripts/*.md` (except `validate-output.js`), or `templates/`
during Phase 2. Every rule those files contain must already be inlined into the
intermediate skill by Phase 1, so Phase 2 needs nothing outside the temporary
directory. `scaffold.js` is a portable build helper, not a rule source — run it
unchanged.

## Phase 1 Summary

Follow all steps in `scripts/generation-pipeline.md`:

1. Read the paper source.
2. Apply the four instructional design principles.
3. Decompose the paper into problem, insight, math, architecture, training, inference, results, and terminology.
4. Generate and score at least three paper-specific theme candidates, lock the winner, then assign each chapter a different simple action that clearly belongs to it.
5. **Plan `chapterCount` chapters** per `contract.md` §2 (default 10; range 6–10). Pick a `paperType` per §2.2.
6. Assign real-world animation scenes and varied interaction patterns.
7. Design analogy cards and implementation-ready problem-first interactive modules.
8. Extract a concise formula and symbol inventory.
9. **Optionally** find and verify relevant Bilibili videos (best-effort; see `contract.md` §7).
10. Materialize the paper-specific skill under a task-scoped temporary directory.
11. Validate the temporary paperSkill (checklist + `validate-output.js` against the plan where applicable).

After Phase 1 passes, read **only** the generated temporary `SKILL.md` and its copied `assets/` directory, then immediately execute Phase 2. Do not re-open any original paper-skill document.

## Non-Negotiable Output Rules

1. Write all visible tutorial prose in natural Simplified Chinese.
2. Generate one React + TypeScript (Vite) project folder named `<paper-short-name>_output/`. The app is **data-driven**: fill `src/data/tutorial.ts` (typed by `src/types.ts`), set paper-specific `:root{}` overrides in `src/styles/paper.css`, add paper-specific Canvas widgets under `src/modules/*` and register them in `src/modules/registry.tsx`; do **not** hand-write JSX/HTML for chapter content.
3. Do not use KaTeX, MathJax, CDNs, external fonts, or local media folders beyond `public/images/` (for optional original figures, per `contract.md` §11). The only runtime dependencies are `react` and `react-dom`; the only optional network feature is the Bilibili metadata loader.
4. Do **not** edit framework files by hand: `src/components/*`, `src/lib/*`, `src/styles/tokens.css`, `src/styles/components.css`, `App.tsx`, `main.tsx`, `vite.config.ts`, `tsconfig*.json`, and `package.json` (beyond the `scaffold.js` title injection). Write paper-specific content only into `src/data/tutorial.ts`, `src/styles/paper.css`, `src/modules/*`, and `public/images/*`. `scaffold.js` injects the title; the model authors only the `:root{}` overrides and the paper-specific widgets.
5. Select one anchor everyday theme through the paper-specific candidate process in `references/metaphor-library.md`: generate at least three candidates from different activity families, score them against the paper's mechanisms, and record why the winner is stronger. All documented activities are equal examples and receive no automatic priority.
6. Build each analogy from one primary subject, one physical verb, and one visible goal. Use no more than two static supporting props and only one independently moving subject.
7. Keep the motion to one continuous action that obviously belongs to the anchor theme. A synchronized old-versus-new comparison may use one subject per panel; Chapter 10 may use a small verified result race.
8. Never use packages moving through workstations, conveyors, factory or kitchen assembly lines, delivery chains, multiple workers or machines, or objects entering a sequence of labeled boxes.
9. Do not use abstract particle clouds, arrow grids, heat maps, vector fields, or purely mathematical wave plots as automatic analogy animations. Coordinate grids, feature maps, vectors, charts, equations, and technical graphs are allowed inside active body modules when they make the mechanism clearer.
10. Keep automatic analogy animations life-based. Interactive body modules may use the anchor life metaphor, a mathematical or technical view, or a linked hybrid of both.
11. Express every nontrivial network structure through an interactive module, never a static diagram alone. The learner must click, switch, step, or drag, and the module must immediately update component highlighting, the active path, values or output, and feedback. **If the paper has no nontrivial network (e.g. `paperType: theoretical`), replace Chapter 8's architecture module with another active technical module** (per `contract.md` §2.2).
12. Make interaction the main teaching medium. Give every chapter at least one primary active module; meet the density minimums in `contract.md` §3.
13. Give each module one dominant learner operation. Drive its Canvas, selected path or component, value or technical evidence when applicable, and immediate feedback from the same state.
14. Reuse one tutorial-wide Canvas drawing kit and restrained scene palette across the Hero, all analogy cards, and life-metaphor body modules. Keep the color semantics in `contract.md` §5 stable across chapters.
15. Use technical graphics as compact, active evidence. Curves, distributions, feature views, bars, dimensions, and architecture nodes must update from the learner-controlled state and remain visually subordinate to one clear operation.
16. Present the old-method limitation before introducing the paper's solution.
17. Reveal chapters progressively. Do not show replay copy or next-section instructional copy inside the page.
18. **Bilibili videos are optional** (per `contract.md` §7). Use real `bvid`s (e.g. `BV1xx...`) in `tutorial.bilibili`. If no relevant video exists at all, omit the `bilibili` array; if any relevant video is found, **always include and display it** (video + cover + views) even when Bilibili API verification fails — verification is not a gate.
19. Continue directly from Phase 1 to Phase 2.
20. Remove the temporary paperSkill on success or failure, unless `PAPER_SKILL_DEBUG=true`. Confirm that its exact resolved path no longer exists before responding (or, in debug mode, that it is preserved and its path is returned).
21. Deliver only the final `<paper-short-name>_output/` folder; do not list or describe the temporary paperSkill.

## Resource Map

```text
paper-skill/
|-- SKILL.md
|-- contract.md                  <- single source of truth for numbers + colors
|-- assets/
|   `-- react-template/          <- Vite + React + TS scaffold copied into the output folder
|       |-- index.html
|       |-- package.json
|       |-- vite.config.ts / tsconfig*.json
|       |-- src/
|       |   |-- main.tsx, App.tsx, types.ts
|       |   |-- components/      <- framework UI (NOT edited by generator)
|       |   |-- lib/             <- canvasKit, hooks (NOT edited by generator)
|       |   |-- modules/         <- widget registry + paper-specific widgets
|       |   |-- data/tutorial.ts <- the ONLY data file the generator rewrites
|       |   `-- styles/          <- tokens.css, components.css, paper.css
|       `-- public/images/       <- optional original figures
|-- references/
|   |-- philosophy.md
|   |-- metaphor-library.md
|   |-- animation-library.md
|   |-- interaction-patterns.md
|   |-- visual-interaction-standard.md
|   `-- intermediate-skill-standard.md
|-- scripts/
|   |-- generation-pipeline.md
|   |-- chapter-template.md
|   |-- validation-checklist.md
|   |-- validate-output.js        <- automated structural validator (folder)
|   `-- scaffold.js               <- React+TS project scaffolder (copied beside assets/)
`-- templates/
    `-- skill-template.md
```

Treat the Markdown files as Agent instructions. Treat files under `assets/` as output
resources that must be copied into the temporary paperSkill and then scaffolded into the
final React+TS project folder.

## Intermediate PaperSkill Quality Contract

The temporary paperSkill is an implementation specification for Phase 2, not a short
outline. Use `references/intermediate-skill-standard.md` plus `templates/skill-template.md`
as the portable canonical version. Lock the paper-specific theme before reading the
exemplar; never transfer the exemplar's theme, objects, actions, labels, or mappings.

1. Preserve this top-level order: frontmatter and introduction; directory structure; paper metadata; unified life-theme mapping and color overrides; `chapterCount` fully expanded chapter plans; formula symbol table; verified Bilibili table (optional); Hero comparison design; five-step project-generation instructions.
2. Fully write every chapter. Do not use aggregate placeholders or shorthand such as "same as above", "follow the schema", or `complete-chapter-N-plan`.
3. Match the reference template's per-chapter order: core concept; chapter role; life-based animation scene; interaction patterns; analogy card; detailed Module N.1; insight bar when applicable; detailed Module N.2 when applicable; formula; three-item takeaway.
4. For every module, record the title, purpose, presentation mode, exact operation, initial state, controls and state space, Canvas composition, state transitions, immediate feedback wording and colors, and the judgment the learner should form.
5. Under the unified-theme section, include a three-candidate scoring record with paper-specific reasons, the selected theme, and rejection reasons. Selection cannot cite documentation order, example detail, a previous tutorial, or generic progress as justification.
6. Include a reusable Canvas drawing kit, restrained scene palette, and a `chapterCount`-row visual storyboard. For each chapter, name the analogy action, dominant module operation, main graphic, technical or mathematical evidence, shared state, and feedback transition.
7. Specify every module's named Canvas regions, back-to-front draw list, reusable primitives, state variables, initial/exploration/failure/success states, and synchronized outputs. Phase 2 must not invent the visual mapping.
8. **Detail floor is field-completeness, not raw length** (per `contract.md` §6): every required field filled, `chapterPlanMinChars` (soft) met per chapter, no global character minimum.
9. Plan at least `activeModulesMin` active modules total, with at least `dualModuleChaptersMin` chapters containing two modules (per `contract.md` §3). Tooltip-only, hover-only, and passive autoplay elements do not count as active modules.
10. Include exact Simplified Chinese labels and feedback copy where Phase 2 would otherwise need to invent them.
11. **Portability:** the intermediate skill must be self-sufficient. It must not instruct Phase 2 to read `contract.md`, `references/`, `scripts/*.md`, `templates/`, or the parent `SKILL.md`. Phase 1 inlines every needed general rule — visual grammar, interaction patterns, color semantics, chapter order, and hard thresholds — into the intermediate skill's own specs. Phase 2 reads only the intermediate `SKILL.md` and its `assets/`.

## Reference Template UI Contract

The bundled React components and CSS (`src/components/*`, `src/styles/*`) are a
paper-agnostic adaptation of the template tutorial reference UI. Treat them as the visual
source of truth rather than as optional starter styles; the generator fills only
`src/data/tutorial.ts`, `src/styles/paper.css`, and `src/modules/*`.

1. Keep the Hero outside `main`, with one centered `.hero-inner`, restrained metadata pills, and two bordered old-versus-new panels with compact header bands.
2. Keep `main` at the bundled width and spacing. Render every chapter as a white bordered surface with the numbered serif accent used by `.chap-title`.
3. Keep each `.module` as a framed interactive tool: muted header band, white body, subtle border, and no decorative gradient or paper-specific redesign.
4. Keep chapter bridges, analogy cards, formula explanations, takeaways, controls, tables, metrics, and feedback in the exact bundled component hierarchy.
5. Keep the Bilibili recommendations (when present) as `.dl-related-section`, outside the chapter count, with the horizontal four-item strip that becomes a two-item strip on narrow screens.
6. Preserve the enlarged type scale in the bundled CSS. Do not shrink component copy back to the smaller sizes in the original reference page.
7. Paper-specific CSS may map scene colors and Canvas backgrounds, but must not replace the reference template's spacing, typography, radii, borders, shadows, or component layout.
8. Phase 1 must apply `references/visual-interaction-standard.md` when generating the intermediate skill: one quiet scene field, one dominant operation, few labels, reusable drawing primitives, compact technical evidence, and immediate state-colored feedback. Each module's spec embeds these rules, so Phase 2 follows the embedded specs and does not read the original reference.

## Debug Mode

If the environment variable `PAPER_SKILL_DEBUG` is set to `true`:

- Preserve the temporary paperSkill directory after generation.
- Return its absolute path to the caller alongside the final folder path so a human can inspect Phase 1 output.
- The delivered project folder is identical to non-debug mode.

Otherwise, delete the temporary paperSkill as usual and never expose its path.
