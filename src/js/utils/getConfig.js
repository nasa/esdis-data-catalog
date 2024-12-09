import config from '../../../static.config.json'

let mergedConfig = { ...config }

export function mergeConfig() {
  const configScript = document.getElementById('config-data')
  if (configScript) {
    try {
      const userConfig = JSON.parse(configScript.textContent)
      mergedConfig = {
        ...mergedConfig,
        ...userConfig
      }
    } catch (error) {
      console.error('Error parsing user configuration:', error)
    }
  }
}

export function getConfig(key) {
  return mergedConfig[key]
}

export function set(newConfig) {
  mergedConfig = {
    ...mergedConfig,
    ...newConfig
  }
}

// Apply user settings on module load
mergeConfig()
