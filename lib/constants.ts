/** Version stamp for the consent text shown at capture time (bump when wording changes). */
export const CONSENT_TEXT_VERSION = '2026-06-16'

/** Neutral messages shown for each capture action (identical across all branches). */
export const MESSAGES = {
  subscribe: "Thanks! If that address is new, check your inbox to confirm.",
  idea: "Thanks for the idea! Check your inbox to confirm, then it'll go to review.",
  comment: "Thanks! Check your inbox to confirm your comment.",
  vote: 'Thanks for the vote!',
} as const

/** Confirmation/unsubscribe token lifetime is enforced in SQL; this is for copy only. */
export const TOKEN_TTL_HOURS = 24
