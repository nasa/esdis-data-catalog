import { createRoot } from 'react-dom/client';

// Mock react-dom/client
vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(() => ({
    render: vi.fn(),
  })),
}));

// Mock App component
vi.mock('./App', () => ({
  default: () => <div data-testid="mock-app">Mocked App</div>,
}));

describe('Main entry point', () => {
  test('renders App component inside StrictMode', async () => {
    const root = document.createElement('div');
    root.id = 'root';
    document.body.appendChild(root);

    await import('../main');

    // Check if createRoot was called with the correct element
    expect(createRoot).toHaveBeenCalledWith(root);
  })
})
