import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

const root = process.cwd()

export default defineConfig({
  resolve: {
    alias: {
      // `server-only` throws outside a server bundle; stub it for unit tests.
      'server-only': resolve(root, 'tests/server-only-stub.ts'),
      '@': root,
    },
  },
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
    // Dummy capture env so env.ts initializes as capture-enabled (hash needs IP_HMAC_KEY).
    env: {
      SUPABASE_URL: 'http://localhost',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-role',
      RESEND_API_KEY: 'test-resend',
      MAIL_FROM: 'Test <t@example.com>',
      OWNER_EMAIL: 'owner@example.com',
      SITE_URL: 'http://localhost:3000',
      TURNSTILE_SECRET_KEY: 'test-turnstile',
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: 'test-turnstile-site',
      IP_HMAC_KEY: 'test-hmac-key',
      RESEND_WEBHOOK_SECRET: 'whsec_test',
    },
  },
})
