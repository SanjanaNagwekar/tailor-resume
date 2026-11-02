# Tailor

Tailor is a browser-based resume tailoring tool for people who keep their resumes in LaTeX. I built it because most resume tools flatten carefully designed layouts, make broad rewrites, or optimize for keywords without showing what changed.

Tailor keeps the original LaTeX source as the formatting source of truth. It reads a pasted job description, proposes evidence-backed wording changes, asks before adding skills that are not already explicit, and compiles the revised source into a one-page PDF.

## What it does

- Maintains a local library of LaTeX base resumes
- Includes two attributed, MIT-licensed sample resumes for trying the workflow
- Compiles the original source for an accurate in-browser preview
- Analyzes a complete, pasted job description
- Shows every proposed wording change before it is included
- Requires confirmation before adding implied skills or experience wording
- Displays match scores before and after accepted edits
- Preserves the original section order and LaTeX layout
- Downloads `Resume_First_Last_Company.pdf`

## Privacy model

Tailor is a static application. Your profile, LaTeX sources, and saved tailoring history are stored in your browser using `localStorage`. There is no Tailor account server, password, analytics pipeline, or resume upload API.

The app loads PDF.js and LaTeX compiler resources from pinned external CDNs. Those resources are required to compile and preview PDFs, but Tailor does not send resume contents to them.

## Run locally

Requirements: Node.js 20 or newer.

```bash
npm run dev
```

Open `http://localhost:4174`.

## Run tests

```bash
npm test
```

The current tests cover role analysis, evidence-backed edits, unsupported-experience guardrails, approval candidates, and before-and-after scoring.

## Project structure

```text
public/                  Static application served by GitHub Pages
  examples/              MIT-licensed sample LaTeX resumes
  latex/                 LaTeX compatibility files used by the compiler
  vendor/                Browser LaTeX compiler runtime
tests/                   Tailoring-engine regression tests
scripts/serve.js         Dependency-free local development server
.github/workflows/       Tests and GitHub Pages deployment
```

## Current limitations

- Base resumes must be LaTeX `.tex` files.
- Job descriptions must be pasted into the application.
- Browser storage is local to one browser and device.
- Tailor supports common resume templates, but unusual custom LaTeX macros may need additional parsing support.
- The match score is an internal estimate, not a score from a specific applicant tracking system.

## Author

Created and maintained by Sanjana Nagwekar.

## License

Tailor is available under the MIT License. Third-party components retain their original licenses; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

