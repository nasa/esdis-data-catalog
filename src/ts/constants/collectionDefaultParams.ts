import { getConfig } from '../utils/getConfig'

interface CollectionDefaultParams {
  page_num: string;
  page_size: string | number;
  has_granules_or_cwic?: boolean,
  consortium: string;
  sort_key: string[];
}

const collectionDefaultParams: CollectionDefaultParams = {
  page_num: '1',
  page_size: getConfig('defaultPageSize'),
  consortium: 'EOSDIS',
  has_granules_or_cwic: true,
  sort_key: ['-score', '-create-data-date']
}

export default collectionDefaultParams
