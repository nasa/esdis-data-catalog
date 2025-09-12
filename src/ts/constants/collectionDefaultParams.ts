import { getConfig } from '../utils/getConfig'

interface CollectionDefaultParams {
  page_num: string;
  page_size: string | number;
  consortium: string;
  sort_key: string[];
}

const collectionDefaultParams: CollectionDefaultParams = {
  page_num: '1',
  page_size: getConfig('defaultPageSize'),
  consortium: 'EOSDIS',
  sort_key: ['-score', '-create-data-date']
}

export default collectionDefaultParams
