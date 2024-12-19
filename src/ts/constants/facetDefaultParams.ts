export interface FacetDefaultParams {
  include_facets: string;
  page_size: string;
  consortium: string;
}

const facetDefaultParams : FacetDefaultParams = {
  include_facets: 'v2',
  page_size: '0',
  consortium: 'EOSDIS'
}

export default facetDefaultParams
