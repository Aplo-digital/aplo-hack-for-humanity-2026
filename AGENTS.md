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

1. Check `python3 --version` is 3.10 or newer. If not, help the person install Python from
   python.org.
2. Create a virtual environment in `.venv` and install `requirements.txt` into it. On Windows
   the activate script is `.venv\Scripts\activate`; on Mac and Linux it is
   `source .venv/bin/activate`.
3. If `.env` doesn't exist, copy `sample.env` to `.env`. The person pastes their Gemini key
   into `.env` themselves. Never ask for the key in chat, never print it, never commit it.
4. Run `python hello_gemma.py` to prove the key and model work.

## The app

- One Streamlit app in `app.py`, run with `streamlit run app.py`. Add helper files only when
  `app.py` gets hard to read.
- Use pandas to load data and Plotly for charts and maps. Add a package to
  `requirements.txt` whenever you start using it.
- Load data with `@st.cache_data` so the app stays fast.
- Keep the interface simple: a title, one sentence saying who the app helps, the inputs, then
  the results.

## Gemma 4 (required for the "Best Use of Gemma 4" challenge)

- Model `gemma-4-26b-a4b-it` through the Gemini API with the `google-genai` SDK. Copy the
  pattern in `hello_gemma.py`: `load_dotenv()`, a client with retries, and
  `thinking_level="minimal"`. Without "minimal", answers take 20 to 60 seconds. Don't switch
  to `gemma-4-31b-it`: we measured 30 to 50 seconds per answer.
- Keep the retry options from `hello_gemma.py`. On 30 October, about half of single calls
  failed with "500 INTERNAL"; with 5 retries, 10 of 10 succeeded in 2 to 7 seconds.
- Store the client in a variable (in Streamlit, create it once with `@st.cache_resource`).
  `genai.Client().models.generate_content(...)` on one line fails with "client has been
  closed".
- Gemma should do something useful for the user each time: explain the numbers in plain
  language, answer a question about the data, or turn figures into advice to act on.
- Give Gemma the facts it needs in the prompt and tell it to use only those facts. Don't
  let it invent numbers.
- Cache answers per input with `@st.cache_data`. If a call fails, show a friendly message and
  a "Try again" button; the app must not crash.

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

The app starts with `streamlit run app.py` with no errors, the main screen loads, and a Gemma
answer appears. Check this yourself before you say a change is finished.
