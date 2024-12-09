import { getConfig } from './getConfig'

const collectionDefaultParams = {
  page_num: '1',
  page_size: getConfig('defaultPageSize'),
  consortium: 'EOSDIS'
}

export default collectionDefaultParams
