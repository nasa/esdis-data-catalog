import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: 'test-setup.ts',
    clearMocks: true,
    fileParallelism: false,
    coverage: {
      enabled: true,
      include: [
        'src/**/*.ts',
        'src/**/*.tsx'
      ],
      provider: 'istanbul',
      reporter: ['text', 'lcov', 'clover', 'json'],
      reportOnFailure: true
    }
  }
})
