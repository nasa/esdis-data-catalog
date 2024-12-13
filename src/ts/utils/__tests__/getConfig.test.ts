import {
  getConfig,
  mergeConfig,
  set
} from '../getConfig'

vi.mock('../../../../../static.config.json', () => ({
  default: {
    testKey: 'testValue',
    overrideKey: 'originalValue'
  }
}))

describe('getConfig', () => {
  describe('when config data is present', () => {
    test('return the config data', () => {
      document.body.innerHTML = `
    <script id="config-data" type="application/json">
      {"userKey": "userValue", "overrideKey": "overriddenValue"}
    </script>
  `

      mergeConfig()
      expect(getConfig('testKey')).toBe('testValue')
      expect(getConfig('userKey')).toBe('userValue')
      expect(getConfig('overrideKey')).toBe('overriddenValue')
    })
  })

  describe('when config data has invalid data', () => {
    test('returns an error', () => {
      document.body.innerHTML = `
        <script id="config-data" type="application/json">
          {invalid json}
        </script>
      `

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mergeConfig()
      expect(consoleSpy).toHaveBeenCalledWith('Error parsing user configuration:', expect.any(Error))
      expect(getConfig('testKey')).toBe('testValue')
    })
  })

  describe('set', () => {
    test('should update the config with new values', () => {
      set({
        newKey: 'newValue',
        testKey: 'updatedValue'
      })

      expect(getConfig('newKey')).toBe('newValue')
      expect(getConfig('testKey')).toBe('updatedValue')
    })
  })
})
