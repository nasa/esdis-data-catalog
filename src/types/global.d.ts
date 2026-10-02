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

/** Parameters used to query and represent CMR collection searches. */
export interface Params {
  /** Geographic bounding box used to filter collections. */
  bounding_box?: string
  /** Whether to limit results to collections with granules or CWIC records. */
  has_granules_or_cwic?: boolean
  /** Whether to include non-operational collections in the results. */
  include_non_operational?: boolean
  /** Free-text search term applied to collections. */
  keyword?: string
  /** Page number of collection results to return. */
  page_num?: number
  /** Maximum number of collection results to return per page. */
  page_size?: number
  /** Processing-level identifiers used to filter collections. */
  processing_level_id_h?: string[]
  /** Hierarchical science keywords used to filter collections. */
  science_keywords_h?: string[]
  /** Sort order for collection results. */
  sort_key?: string
  /** Temporal range as start/end values or a comma-separated string. */
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
