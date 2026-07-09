import { createClient } from '@blinkdotnew/sdk'

export const blink = createClient({
  projectId: import.meta.env.VITE_BLINK_PROJECT_ID || 'financecal-ultimate-0zidacoh',
  publishableKey: import.meta.env.VITE_BLINK_PUBLISHABLE_KEY || 'blnk_pk_-nkzDoei5zWonXBBwMOU32eJDqYjNzPN',
  authRequired: false,
  auth: { mode: 'managed' },
})
