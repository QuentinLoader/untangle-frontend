# LeaseCheck family-specific terminology

## Goal
Keep the existing Summary, Full details, and Ask experience unchanged while making LeaseCheck wording fit residential, commercial, vehicle, equipment/plant, and unknown lease families.

## Changes
- Add a small presentation-only family mapper in `src/routes/result.tsx` that converts backend family values into natural customer wording without displaying raw codes.
- Use family-aware document descriptions while keeping the original document title on its own line.
- Adapt Summary and Full details responsibility headings to “Your responsibilities” plus the correct other-party wording.
- Adapt payment labels for vehicle and equipment/plant results, including “Hire charge” and “Periodic hire payment,” without changing values.
- Use family-appropriate headings for supported equipment/plant problem clauses, while retaining existing wording as the fallback.

## Validation
- Confirm the existing three-tab structure and all data/API behaviour remain unchanged.
- Visually test mocked residential, commercial, and equipment/plant result payloads at mobile width.
- Confirm the equipment Summary contains Owner/Hire wording and no property-specific party or payment labels.
- Check current diagnostics and publish the passing result to the existing production site.
