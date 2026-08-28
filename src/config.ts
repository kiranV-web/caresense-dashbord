/** Centralised reads of build-time env config (Vite statically replaces
 * import.meta.env.VITE_* at build time, so keep these as simple constants). */

/** Show the coloured dot + emotion label on each transcript bubble in Call
 * detail. Defaults to on when unset. */
export const SHOW_TRANSCRIPT_TONE: boolean = import.meta.env.VITE_SHOW_TRANSCRIPT_TONE !== "false";
