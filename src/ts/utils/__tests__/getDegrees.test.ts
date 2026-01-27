import { getDegrees } from '../getDegrees'

describe('getDegrees', () => {
  test('should return the correct value for a valid number', () => {
    expect(getDegrees(1.5)).toBe('1.5°')
  })

  test('should return the correct value for an integer', () => {
    expect(getDegrees(1)).toBe('1.0°')
  })

  test('should return the correct value for a negative number', () => {
    expect(getDegrees(-1.5)).toBe('-1.5°')
  })
})
