export interface Facet {
  applied: boolean;
  children?: Facet[];
  count: number;
  hasChildren?: boolean;
  links?: {
    apply?: string;
    remove?: string;
  };
  title: string;
  type: string;
}

export interface Params {
  bounding_box?: string
  keyword?: string
  page_num?: number
  page_size?: number
  processing_level_id_h?: string[]
  science_keywords_h?: string[]
  sort_key?: string
  temporal?: string[] | string
}

export interface QueryResult {
  data?: {
    items?: []
  }
  facetData?: {
    feed?: {
      facets?: []
    }
  };
  headers: Headers;
  message: string;
  query: string;
  status: number;
}
