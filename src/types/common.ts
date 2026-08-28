export type Id = string;
export type IsoDateString = string;

// The semantic tones defined in theme.colors.tone — shared by status pills,
// sentiment chips, rule pass/fail marks and waveform spans. "mild" is a
// low-intensity green for calm/neutral moments, distinct from "neutral"
// (true grey, no signal) and "positive" (a genuinely good moment).
export type ToneKey = "neutral" | "mild" | "positive" | "caution" | "attention" | "critical";
