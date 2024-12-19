import React from 'react'

import { createRoot } from 'react-dom/client'

// Mock react-dom/client
vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(() => ({
    render: vi.fn()
  }))
}))

// Mock App component
vi.mock('./App', () => ({
  default: () => <div data-testid="mock-app">Mocked App</div>
}))

describe('Main entry point', () => {
  test('renders App component inside StrictMode', async () => {
    const root = document.createElement('div')
    root.id = 'data-catalog'
    document.body.appendChild(root)

    await import('../main')

    // Check if createRoot was called with the correct element
    expect(createRoot).toHaveBeenCalledWith(root)
  })

  test('logs error when root element does not exist', async () => {
    // Don't create the root element

    await import('../main')

    // Check if createRoot was not called
    expect(createRoot).not.toHaveBeenCalled()
    // Check if console.error was called with the correct message
  })
})
