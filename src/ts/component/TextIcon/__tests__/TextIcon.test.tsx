import { render, screen } from '@testing-library/react'
import TextIcon from '../TextIcon'

const setup = ({ overrideProps = {} } = {}) => {
  const defaultProps = {
    className: 'custom-class',
    field: 'Sample Field',
    iconName: 'test-icon',
    title: 'Test Title',
    ...overrideProps
  }

  return render(<TextIcon {...defaultProps} />)
}

describe('TextIcon', () => {
  test('renders correctly with all props', () => {
    setup()

    const container = screen.getByText('Sample Field').closest('div')
    expect(container).toHaveClass('hzn-text-icon custom-class')

    const icon = screen.getByTitle('Test Title')
    expect(icon).toHaveClass('hzn-icon hzn-icon-test-icon hzn-text-icon__icon')

    const field = screen.getByText('Sample Field')
    expect(field).toHaveClass('hzn-text-icon__field')
  })

  test('does not render when field is null', () => {
    const { container } = setup({ overrideProps: { field: null } })
    expect(container.firstChild).toBeNull()
  })

  test('does not render when field is an empty string', () => {
    const { container } = setup({ overrideProps: { field: '' } })
    expect(container.firstChild).toBeNull()
  })

  test('applies default empty string for className when not provided', () => {
    const { container } = setup({ overrideProps: { className: undefined } })

    const textIconDiv = container.firstChild as HTMLElement
    expect(textIconDiv).toHaveClass('hzn-text-icon')
    expect(textIconDiv).not.toHaveClass('custom-class')
    expect(textIconDiv).not.toHaveClass('undefined')
  })

  test('uses provided className', () => {
    const { container } = setup({ overrideProps: { className: 'new-class' } })

    const textIconDiv = container.firstChild as HTMLElement
    expect(textIconDiv).toHaveClass('hzn-text-icon new-class')
    expect(textIconDiv).not.toHaveClass('custom-class')
  })
})
