import config from '../../../static.config.json'


interface Config {
  [key: string]: string | number
}

let mergedConfig: Config = { ...config }

export function mergeConfig() {
  const configScript = document.getElementById('config-data');
  if (configScript && configScript.textContent) {
    try {
      const userConfig: Config = JSON.parse(configScript.textContent);
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
  return mergedConfig[key];
}

export function set(newConfig: Config) {
  mergedConfig = {
    ...mergedConfig,
    ...newConfig
  }
}

// Apply user settings on module load
mergeConfig()
