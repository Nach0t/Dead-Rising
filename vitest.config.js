/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/frontend/**/*.test.js'], // 👈 Asegura que esta ruta sea exacta
    globals: true,
    environment: 'jsdom',
  }
})
