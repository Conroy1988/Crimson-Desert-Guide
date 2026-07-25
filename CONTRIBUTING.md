# Contributing

Contributions are welcome when they improve accuracy, reproducibility or usability.

## Before submitting

1. Check the current official patch in `data/current-patch.json`.
2. Search existing issues and pull requests.
3. Identify the evidence grade and spoiler level.
4. Separate confirmed facts from interpretation.
5. Avoid uploading copyrighted material unless it is necessary, limited and permitted.

## Content requirements

Every page must include the frontmatter fields enforced by `scripts/content-audit.mjs`.

Gameplay claims should provide either:

- an official source;
- repeatable test steps;
- multiple independent corroborating reports; or
- an explicit `provisional` label.

Run:

```bash
npm install
npm run check:all
```

## Style

Use direct UK English. Prefer precise instructions, short paragraphs and tables where comparison matters. Do not pad pages with generic prose or imitate official marketing copy.

## Licensing

By contributing code, you agree that it is licensed under MIT. By contributing original guide prose, you agree that it is licensed under CC BY-SA 4.0.
