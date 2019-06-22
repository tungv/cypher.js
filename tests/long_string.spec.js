const { parse } = require("..");

const query = /* cypher */ `MATCH (uploader:USER)-[:CREATED]->(draft:PRODUCT_DRAFT)-[draftAppearRel:APPEARS_IN]->(project:PROJECT)
  WHERE draft.id = $event.payload.draft.id

  SET project.updated_at = datetime({ epochMillis: toInteger($event.payload.draft.updated_at )})
  
  WITH project, draft, draftAppearRel, uploader
  MATCH (updater:USER { id: $event.payload.draft.updated_by })
  MERGE (project)-[:LAST_UPDATED_BY]->(updater)

  CREATE (project)-[:APPEARS_IN]->(product:PRODUCT {
    id: $event.payload.draft.product_id,
    name: $event.payload.draft.name,
    model_code: $event.payload.draft.model_code,
    gender: $event.payload.draft.gender
  })

  CREATE (updater)-[:CREATED]->(product)<-[:UPLOADED]-(uploader)

  DELETE draftAppearRel

  MERGE (cat:PRODUCT_CATEGORY { name: $event.payload.draft.category })<-[:CATEGORIZED]-(product)
  MERGE (draft)-[:SOURCE_OF]->(product)

  WITH product, draft, range(0, size($event.payload.draft.dimensions) - 1) as indexes
  UNWIND indexes AS dimIndex
  WITH $event.payload.draft.dimensions[dimIndex] as dimension, dimIndex, product, draft
  
  MATCH (draft)-[r { index: dimIndex }]->(dimNode:DRAFT_DIMENSION)
  CREATE (product)-[:HAS_DIMENSION { index: dimIndex }]->(dimNode)

  MATCH (draft:PRODUCT_DRAFT { id: $event.payload.draft.id }) DETACH DELETE draft
  `;

it("should work with long query", () => {
  const result = parse(query);
  expect(result.errors).toHaveLength(0);
});
