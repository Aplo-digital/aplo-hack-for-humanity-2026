# Aplo × Hack for Humanity Adelaide 2026

Our team's project for **Hack for Humanity Adelaide** (Friday 30 October 2026). We build a small
web app that uses real South Australian open data and Google's **Gemma 4** AI model to help people.

**You do not need to know how to code.** You tell an AI coding assistant what you want in plain
English, and it writes and runs the code for you. This repo is set up so the assistant already
knows the rules, the data and how to build the app.

## Start here (15 minutes)

1. **Get the repo onto your laptop.** Open your AI assistant (Claude Code, Cursor, Codex,
   Copilot or Gemini CLI) and paste:
   > Clone https://github.com/Aplo-digital/aplo-hack-for-humanity-2026 and open it. Then read
   > AGENTS.md and set up everything I need to run the project. Explain each step simply.
2. **Get a free Gemini API key** at <https://aistudio.google.com/apikey> (sign in with Google,
   click "Create API key"). Then ask your assistant:
   > Help me make my .env file from sample.env. I will paste the key into the file myself.

   Paste the key into the `.env` file yourself. **Never paste your key into a chat**, and never
   put it on GitHub.
3. **Check it works.** Ask your assistant:
   > Run hello_gemma.py and tell me if Gemma answered.

If Gemma answers with two sentences about aged care, you are ready.

## How we work today

- **Our idea** is in [docs/IDEA.md](docs/IDEA.md): film a room, and the app sorts your things to the right charities.
- **Pick a theme**: Health, Education or Sustainability. [docs/HACKATHON.md](docs/HACKATHON.md)
  explains each one and the challenges we can enter.
- **Pick the data**: [data/README.md](data/README.md) lists every dataset. Start with the ones
  marked ★.
- **Build by asking**: [docs/PROMPTS.md](docs/PROMPTS.md) has prompts to copy and paste, from
  "help us pick an idea" to "get it ready to submit".
- **Before the demo**: tick off [docs/SUBMISSION-CHECKLIST.md](docs/SUBMISSION-CHECKLIST.md).

## What is in this repo

| File or folder | What it is |
| --- | --- |
| `AGENTS.md` | Instructions for AI assistants. You don't need to read it; your assistant does |
| `CLAUDE.md`, `GEMINI.md` | Point Claude Code and Gemini CLI to `AGENTS.md` |
| `hello_gemma.py` | A short test that Gemma works with your key |
| `requirements.txt` | The Python packages the project needs |
| `sample.env` | A template for your Gemini key. Copy it to `.env` and fill it in |
| `data/` | Open data about South Australia, already downloaded, with licences |
| `docs/` | The hackathon guide, copy-paste prompts, submission checklist and the final README template |

## Working together on GitHub

Ask your assistant to do the Git steps for you:

- **Get your teammates' latest work:** "Pull the latest changes."
- **Share your work:** "Commit my changes with a clear message and push them."
- **If something clashes:** "We have a merge conflict. Explain it to me and fix it safely."

Push small changes often, so nobody's work gets lost.

## Help

- Organisers' Discord: <https://discord.gg/jDrSg56VJ>
- Organisers' starter repo, with a worked example app to learn from (don't copy its code):
  <https://github.com/klimhawk/h4h-adelaide-2026>

## Licence

Our code is under the MIT licence: see [LICENSE](LICENSE). Each dataset keeps its publisher's
licence: see [data/README.md](data/README.md).
