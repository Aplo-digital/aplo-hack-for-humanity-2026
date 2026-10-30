# The hackathon in one page

**Hack for Humanity Adelaide** is a Hacktoberfest Hack Day with MLH on Friday 30 October 2026.
Teams build an app in an afternoon that uses South Australian open data and Gemma 4 to help
people. Updates come through the organisers' [Discord](https://discord.gg/jDrSg56VJ).

## The three themes

Pick one. Each has data ready in `data/` and a few starter ideas.

| Theme | The Adelaide problem | Starter ideas | Data to start with |
| --- | --- | --- | --- |
| **1. Health** | Aged care support; health care access in rural and regional SA | *Getting help at home*: where aged care demand is highest. *Distance should not decide*: country SA against Adelaide | A2, A3, H2 |
| **2. Education** | Reskilling SA's manufacturing and defence workers for new careers | *Next job, next skill*: which jobs are short of workers and hiring. *Filling the trade pipeline* | R1, R2, R4 |
| **3. Sustainability** | Households moving to clean energy; water security; regional farming | *Power to the people*: who has solar and batteries. *Every drop counts*: reservoir levels. *Rain to harvest* | S1, W1, G1, G2 |

Any theme gets stronger when you add the "works with every theme" data: population, income,
disadvantage (SEIFA), jobs and maps. A number per suburb or per person beats a raw total.

The full list, with what each dataset holds, is in [data/README.md](../data/README.md).

## The challenges we can enter

The organisers check parts of the README for these. Our `AGENTS.md` already tells the AI
assistant how to meet each one.

| Challenge | What it needs from us |
| --- | --- |
| **Best Use of Gemma 4** | Gemma 4 does something useful in the app. The README names the model and its Apache 2.0 licence |
| **Open-source challenges (two)** | MIT licence in the repo, and the model section in the README |
| **Snowflake (optional)** | We used Cortex Code (CoCo) with a Snowflake Marketplace dataset, and the README has a "How CoCo helped" section with evidence |

## The rules that matter

- **Build it today.** The project must be built during the event, by our team.
- **Don't copy the worked example.** The organisers' Battery Race app is there to learn from
  only. You can read it at <https://github.com/klimhawk/h4h-adelaide-2026/tree/main/worked-example>.
- **Credit the data.** Every dataset we use gets its credit line in the README and on the final
  slide.
- **Keep secrets secret.** The Gemini key lives in `.env`, which never goes on GitHub.

## What makes a good project

- It helps a specific person, and you can say who in one sentence.
- It joins two datasets to show something neither shows alone, such as solar uptake against
  income by postcode.
- Gemma explains the numbers so anyone can understand them, using only the real figures.
- The demo works every time. A small app that works beats a big one that crashes.
