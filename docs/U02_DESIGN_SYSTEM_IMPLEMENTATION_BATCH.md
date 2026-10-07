# U02 Implementation Batch — Shared Professional Design System

Status: READY

## Goal

Introduce the new Untangle South Africa professional UX primitives without changing current production result behaviour.

## Files to add

- `src/components/untangle/v2/ResultWorkspace.tsx`
- `src/components/untangle/v2/ResultPrimitives.tsx`
- `src/components/untangle/v2/PortfolioBrand.tsx`
- `src/components/untangle/v2/ResultSidebar.tsx`
- `src/components/untangle/v2/ResultContextRail.tsx`

## Files to update

- `src/styles.css`
  - retain current brand colours;
  - add new report/workspace layout tokens only;
  - do not globally restyle legacy screens in this batch.

## Component contract

### ResultWorkspace
Responsive shell with:
- compact product header;
- left result navigation at desktop widths;
- central report column;
- optional right context/evidence rail;
- mobile section navigation fallback.

### PortfolioBrand
Displays:
- specialist product as primary identity;
- “Part of Untangle South Africa” as supporting identity;
- AddVision only as corporate trust/footer context.

### ResultPrimitives
Provide:
- status badge;
- key metric;
- section heading;
- fact rows;
- meaning/explanation block;
- responsibility list;
- warning panel;
- evidence disclosure;
- Ask starter prompt.

## Visual rules

- IBM Plex Sans dominates the application UI.
- Fraunces remains marketing/editorial only.
- Mono is reserved for identifiers/evidence metadata.
- Reduce pill/card overuse.
- Use dividers/spacing before boxes.
- Use red only for genuine critical/urgent states.
- Use amber for “Check this” / “Needs attention”.
- One primary CTA per view.
- 44px minimum touch target.

## Responsive targets

- 360px: no horizontal overflow.
- 768px: tablet reading layout.
- 1024px+: left report navigation.
- 1280px+: three-column report workspace.
- overall desktop report width approximately 1240–1360px.

## Acceptance

- existing routes remain visually unchanged unless they intentionally consume a new component;
- frontend build passes;
- no new backend dependency;
- no product activation changes.
