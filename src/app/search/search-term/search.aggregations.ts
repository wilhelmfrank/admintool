export const user_aggs = {
  select: {},
  creationDate: { size: 0, aggs: { name1: { date_histogram: { field: "creationDate", interval: "year", min_doc_count: 1 } } } },
  organization: { size: 0, aggs: { name1: { terms: { field: "affiliations.title.sorted", size: 100, order: { _count: "desc" } } } } },
}

export const item_aggs = {
  select: {},
  creationDate: { size: 0, aggs: { name1: { date_histogram: { field: "creationDate", interval: "year", min_doc_count: 1 } } } },
  genre: { size: 0, aggs: { name1: { terms: { field: "metadata.genre", size: 100, order: { _count: "desc" } } } } },
  publisher: { size: 0, aggs: { name1: { nested: { path: "metadata.sources" }, aggs: { name2: { terms: { field: "metadata.sources.publishingInfo.publisher.sorted", size: 100 } } } } } }
}