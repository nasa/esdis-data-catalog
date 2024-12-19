import React from 'react'
import { render, screen } from '@testing-library/react'
import TextIcon from '../TextIcon'

describe('TextIcon', () => {
  test('renders correctly with all props', () => {
    render(
      <TextIcon
        className="custom-class"
        field="Test Field"
        iconName="test-icon"
        title="Test Title"
      />
    )

    const iconElement = screen.getByTitle('Test Title')
    expect(iconElement).toBeInTheDocument()
    expect(iconElement).toHaveClass('hzn-icon-test-icon')

    const fieldElement = screen.getByText('Test Field')
    expect(fieldElement).toBeInTheDocument()
  })

  test('does not render when field is null', () => {
    render(
      <TextIcon
        iconName="test-icon"
        title="Test Title"
        field={null}
      />
    )

    const iconElement = screen.queryByTitle('Test Title')
    expect(iconElement).not.toBeInTheDocument()
  })

  test('does not render when field is undefined', () => {
    render(
      <TextIcon
        iconName="test-icon"
        title="Test Title"
      />
    )

    const iconElement = screen.queryByTitle('Test Title')
    expect(iconElement).not.toBeInTheDocument()
  })
})
