
import { render, screen } from '@testing-library/react'
import App from '../App'

describe('App Component', () => {
  test('renders Data Catalog component', () => {
    render(<App />);
    expect(screen.getByText('Data Catalog')).toBeInTheDocument()
  })
})
