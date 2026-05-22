# Basis Conference Speaker Planner

## Writing style
No em dashes or en dashes anywhere (—, –). Use commas, colons, center dots (·), or restructure the sentence instead. This applies to code, comments, copy, and data.

## Canvas logo usage
Two logo files exist in `public/`. Always pick based on background color:

- `canvas-logo-dark.png`: dark/black backgrounds only. Has white "by Franklin Templeton" text. Used in: attendee guide header, landing page "Presented by" section, landing page footer.
- `canvas-logo-light.webp`: light/cream backgrounds only. Has dark "by Franklin Templeton" text. Used in: attendee guide footer, nav bar.

Never use `canvas-logo.webp` directly. It is the same file as `canvas-logo-light.webp` and kept only for legacy reference. Never add `background: #fff` or padding to a logo element to work around a wrong logo choice. Fix the src instead.
