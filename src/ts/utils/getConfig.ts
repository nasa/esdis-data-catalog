import config from '../../../static.config.json'

interface Config {
  [key: string]: string | number
}

let mergedConfig: Config = { ...config }

/**
* 1. The static.config.json file contains default configuration values.
* 2. During the server-side rendering process, environment-specific configuration
*    is generated and inserted into the HTML as a script tag with id 'config-data'.
* 3. When this module is loaded in the browser, it first imports the static config.
* 4. The mergeConfig function then looks for the 'config-data' script tag and, if found,
*    merges its content with the static config.
*
* This approach allows for a flexible configuration system that can be partially defined
* at build time and partially at runtime, accommodating different deployment environments
*/
export function mergeConfig() {
  const configScript = document.getElementById('config-data')
  if (configScript && configScript.textContent) {
    try {
      const userConfig: Config = JSON.parse(configScript.textContent)
      mergedConfig = {
        ...mergedConfig,
        ...userConfig
      }
    } catch (error) {
      console.error('Error parsing user configuration:', error)
    }
  }
}

export function getConfig(key: string | number) {
  return mergedConfig[key]
}

export function set(newConfig: Config) {
  mergedConfig = {
    ...mergedConfig,
    ...newConfig
  }
}

// Apply user settings on module load
mergeConfig()
