import Papa from "papaparse"
import { z } from "zod"
import charitiesCsv from "../../data/charities.csv?raw"
import { CATEGORIES, type CharityRule } from "./types"

const lowercase = z.string().trim().toLowerCase()

const CharityRow = z.object({
  charity: z.string().trim().min(1),
  category: lowercase.pipe(z.enum(CATEGORIES)),
  accepted: lowercase.pipe(z.enum(["yes", "some"])),
  notes: z.string().trim().default(""),
  source: z.string().trim().default(""),
})

// The team edits the CSV in Excel, so a bad or "no" row is skipped instead of breaking the app.
export function parseCharityRules(csv: string): CharityRule[] {
  const { data } = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim().toLowerCase(),
  })
  return data.flatMap((row) => {
    const parsed = CharityRow.safeParse(row)
    return parsed.success ? [parsed.data] : []
  })
}

export const CHARITY_RULES = parseCharityRules(charitiesCsv)
