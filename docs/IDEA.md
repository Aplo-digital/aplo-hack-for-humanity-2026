# Our idea: film your room, find where everything should go

Working name: **Pass It On** (change it any time).

**Who it helps.** Someone moving out who wants their things to reach people who need them, not
landfill. And the charities, who get goods they can actually use instead of items they have to
throw away.

**What a person does.** Films a quick walk around a room on their phone and uploads it. The app
lists everything it sees, they tick what they're giving away, and they get a plan: what goes to
which charity, what goes to recycling, and where to drop it off.

## How it works

```
phone video ──► Gemma 4 watches it and lists the items (name, category, how many, condition)
                       │
                       ▼
             person checks the list: untick, fix, add
                       │
                       ▼
     our charity table matches each item to who accepts it ──► nearest charity shops (ACNC)
                       │
                       ▼
     Gemma 4 writes a friendly donation plan: what goes where, and what to recycle instead
```

## What we tested on 30 October

| Test | Result |
| --- | --- |
| Gemma 4 lists items from a photo of a living room | 17 items, all correct (sofas, CRT TV, laptop, lamps, rugs), but **84 to 97 s** per photo |
| Gemma 4 lists items from a video (`video/mp4` sent directly) | Works: 14 items across two rooms in **14 s** |
| 40 s phone-style video, 1080p, 53 MB | Works in 37 s |
| Same video shrunk to 480p, 2 frames a second (560 KB) | Works in **21 s**, nearly the same list |
| Condition ("good", "worn", "broken") | Gemma says "good" for almost everything. Let the person set it |

So: **take video, not photos**, shrink it before sending, and let the person correct the list.

## Build order (each step should work before the next)

1. **Upload and list.** Streamlit page: upload a video, show it, send it to Gemma, show the item
   list as an editable table (`st.data_editor`). Ask Gemma for JSON
   (`response_mime_type="application/json"`).
2. **Match to charities.** A small table we write ourselves, `data/charities.csv`: charity, item
   category, accepted (yes / selected stores / no), notes, source link. Match items to it with
   pandas, not with if-statements.
3. **The plan.** Group items by charity, then Gemma writes a short, friendly plan using only the
   matched rows.
4. **Nearest shop** (stretch). Filter the ACNC charity register to SA and the person's postcode.
5. **Impact line for the pitch** (stretch). Use the waste data (S10 in `data/extras/`) to say how
   much SA sends to landfill.

## The charity table: what we know so far

Check each charity's own donation page before the demo and put the link in the `source` column.

- **Salvos Stores** take clean, working clothing, shoes, homewares, toys, books, CDs, DVDs and
  small electricals. They don't take damaged or faulty items, computer monitors, printers,
  scanners, building materials, car parts or weapons. Furniture and white goods only at bigger
  stores; call 13 SALVOS (13 72 58) for furniture pick-up.
  [Donation guide](https://salvosstores.com.au/Donation-Guide.pdf),
  [clothing and goods](https://salvationarmy.org.au/donate/clothing-and-goods)
- **Vinnies SA** take furniture at selected stores only, in good condition. They don't take
  ripped, soiled or stained clothing, cracked homewares, company, military or embroidered school
  uniforms, playground sets, lawnmowers, alcohol, or gas, oil and kerosene heaters.
  [Vinnies SA donation guide](https://vinnies.org.au/sa/vinnies-shops-sa/donation-guide)
- **Add more:** Red Cross, Good Sammy, Uniting SA, animal welfare op shops, and e-waste
  recycling for broken electronics. Ask your assistant to read each one's donation page.
- **Never donate:** broken or unsafe items. The plan should send these to recycling or council
  hard rubbish, not to a charity.

## Data

| Dataset | Source | Licence | Credit line |
| --- | --- | --- | --- |
| ACNC Register of Australian charities (CSV, updated weekly) | [data.gov.au](https://data.gov.au/data/dataset/acnc-register) | CC BY 3.0 AU | Check the dataset page for the exact wording |
| Our charity table (`data/charities.csv`) | Each charity's donation guide, linked per row | Our own, MIT | Made by our team from each charity's public donation guide |
| S10 National Waste and Resource Recovery (optional) | `data/extras/3_sustainability/S10_nwrr-database-2026/` | See its README | See `data/README.md` |

## Watch out for

- **Privacy.** Room videos show people's homes. Don't save uploads; process them and throw them
  away. Say so on the page.
- **Big phone videos.** A minute of 4K video can be hundreds of MB. Shrink it first
  (`imageio-ffmpeg` installs ffmpeg through pip, so nobody needs a separate install).
- **Wrong items.** Gemma can mislabel things. The person always confirms the list before the plan.
- **Charity rules change and vary by store.** Every plan should say "check with the store
  before you drop off".

## Theme and challenges

- **Theme:** Sustainability (reuse instead of landfill), with a social side (goods reach people
  in need).
- **Best Use of Gemma 4:** Gemma does the two hard parts: seeing the items in a video and
  writing the plan. That's a strong use of a multimodal model.
