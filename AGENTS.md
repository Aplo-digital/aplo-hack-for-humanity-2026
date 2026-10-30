# Instructions for AI coding assistants

This is a one-day hackathon project for Hack for Humanity Adelaide (30 October 2026). The team
is mostly non-technical and builds by talking to you. Read this whole file before you act.

## Our idea

Read `docs/IDEA.md` before building anything. It has the idea, what we tested with Gemma and
video, the build order and the charity data plan. Follow its build order unless the team
changes it, and update that file when they do.

## How to work with this team

- Explain what you are doing in plain English, one step at a time. No jargon without a
  one-line explanation.
- Run commands yourself. Don't ask the person to edit code or type commands unless there is
  no other way, and then give the exact text to paste.
- Make small changes, run the app, and show the result before moving on.
- When something fails, read the error, fix the cause, and say in one sentence what went wrong.
- Ask before deleting files, rewriting Git history or doing anything you can't undo.

## Setup (first time on a laptop)

1. Check `node --version` is 20 or newer. If not, help the person install Node from nodejs.org.
2. Run `npm install`.
3. If `.env` doesn't exist, copy `sample.env` to `.env`. The person pastes their Gemini key
   into `.env` themselves. Never ask for the key in chat, never print it, never commit it.
4. Run `npm run dev` and open the localhost address it prints.

## The app (Looped)

A Vite + React 19 + TypeScript web app at the repo root, styled with Tailwind v4 and shadcn/ui
(base-nova style), adapted from Aplo's figmaplugins.co design system. No login, no database:
it's an MVP that runs on one laptop.

| Where | What lives there |
| --- | --- |
| `src/App.tsx` | The page and its steps: welcome, situation, rooms, upload, analysing, review, plan, error (one state union). Holds the rooms list and the optional "what's happening" answers |
| `src/lib/rooms.ts` | The default rooms, and saving rooms plus the "what's happening" answers in the browser (localStorage) so a reload doesn't lose them |
| `src/components/steps/` | One component per step |
| `src/components/ui/` | shadcn components. Add more with `npx shadcn@latest add <name>`, then check the `cn` import is `@/lib/utils` |
| `src/components/design-system/` | `TYPE` text scale, `ICON` sizes, `IconBox`. Use these, not ad-hoc classes |
| `src/styles/globals.css` | Colour tokens (incl. sage, peach, pine, terracotta, taupe), radius, DM Sans and Fraunces. Change colours here, not per component |
| `src/lib/types.ts` | `Item`, `Category`, `Condition`, `CharityRule`, `Destination` |
| `src/lib/route.ts` | `routeItems`: where each item goes. Keep it pure and keep `route.test.ts` passing |
| `data/charities.csv` | Charity rules the team edits in Excel: charity, category, accepted (yes/some), notes, source link |
| `server/gemma.ts` | Every Gemma call. Shrinks videos with ffmpeg-static first |
| `vite.config.ts` | Wires `POST /api/analyse`, `POST /api/analyse-photos` and `POST /api/plan` into the dev server |

Rules:
- The Gemini key is read on the server only (`loadEnv` in `vite.config.ts`). Never use
  `import.meta.env` or a `VITE_` variable for it, and never call Gemini from `src/`.
- The API routes run under `npm run dev` and `npm run preview`. Public hosting would need
  serverless functions and is out of scope for the MVP.
- Before saying a change is done: `npm run typecheck && npm test && npm run build`, then load
  the page and try it.
- Python files (`hello_gemma.py`, `requirements.txt`, `scripts/fetch_charity_data.py`) are
  optional tools, not part of the app.

## Gemma 4 (required for the "Best Use of Gemma 4" challenge)

- Model `gemma-4-26b-a4b-it` through the Gemini API with the `@google/genai` SDK, thinking
  level minimal. Don't switch to `gemma-4-31b-it`: we measured 30 to 50 seconds per answer.
- Keep the SDK retry options in `server/gemma.ts`. On 30 October about half of single calls
  failed with "500 INTERNAL"; with 5 retries, 10 of 10 succeeded in 2 to 7 seconds.
- Shrink before sending. A full-size photo took 84 to 97 seconds; shrunk to 1024 px
  (`src/lib/shrinkPhoto.ts`), one or two photos took 11 to 19. A shrunk video takes 15 to 20.
  People can send a video or up to 10 photos per room (`POST /api/analyse-photos`).
- Give Gemma only the facts it needs and tell it to use only those. If a call fails, show a
  friendly message and a "Try again" button; the app must not crash.

## Data

- All data is in `data/`. Read `data/README.md` first. It lists every dataset, the keys that
  link them (postcode, SA2, LGA, ANZSCO) and the credit line each one needs.
- Many government XLSX files have title rows above the real header. Open the file, list its
  sheet names and print the first 15 rows before choosing `sheet_name` and `skiprows`.
  `openpyxl` is installed for reading XLSX.
- Map shapes (F12) are not in this repo. If the app needs a map, follow the steps in
  `data/4_foundation/F12_asgs-edition3-boundaries/README.md`: download one zip, keep only SA,
  and commit a small GeoJSON. The F13 correspondences zip is only for converting between
  areas, such as postcode to SA2.
- Datasets marked ↗ in the data guide are not in this repo. If the team needs one, follow the
  "Get it yourself" steps. Where the terms say "own use", keep the file out of Git: add its
  name to `.gitignore`.
- Present health and death figures with care. Small numbers are suppressed for privacy.

## Hackathon rules you must follow

- The project is built today, by this team. Don't copy code from the organisers' worked
  example (Battery Race) or anywhere else. Learning from it is fine.
- The licence stays MIT (`LICENSE`).
- Every dataset the app uses gets its credit line in `README.md` and on the final slide.
- Before submission, rewrite `README.md` using `docs/README-template.md`. Fill in every
  section, including the model, data credits and "AI tools we used". Keep a short "How to run
  it" section.
- The Snowflake challenge is optional. Only add the "How CoCo helped" section if the team used
  Cortex Code with a Snowflake Marketplace dataset.

## Git

- Several people push to this repo. Pull before you start and before you push.
- Commit small working steps with a clear message, for example "Add postcode search box".
- Never force-push, and never commit `.env`, `.venv/` or data marked "own use".
- On a merge conflict, explain it in plain English, keep both people's work where possible,
  and run the app before committing the fix.

## Done means

`npm run dev` starts with no errors, the page loads, and a test video produces an item list
and a plan. Check this yourself before you say a change is finished.
