const path = require("path");
const parse = require("node-gyp-build")(path.resolve(__dirname, ".."));

const r = parse(`
MATCH (project:PROJECT { id: $event.payload.project_id })
SET project.updated_at = datetime({ epochMillis: toInteger($event.payload.created_at) })

// create draft node
CREATE (draft:PRODUCT_DRAFT {
  id: $event.payload.id,
  modelCode: $event.payload.model_code,
  name: $event.payload.name,
  gender: $event.payload.gender,
  availableSizes: $availableSizes,
  created_at: datetime({epochMillis:toInteger($event.payload.created_at)})
})-[:APPEARS_IN]->(project)

WITH draft, range(0, size($event.payload.dimensions) - 1) as ix
UNWIND ix AS dimIndex
WITH $event.payload.dimensions[dimIndex] as dimension, dimIndex, draft

CREATE (dim:DRAFT_DIMENSION {
  name: dimension.name,
  sizeNames: dimension.size_names,
  baseSize: dimension.base_size,
  created_at: datetime({epochMillis:toInteger($event.payload.created_at)})
})<-[:HAS_DIMENSION { index: dimIndex }]-(draft)

WITH dimension, dim
UNWIND dimension.measurements as mmt
CREATE (dim)-[:HAS_MEASUREMENT]->(m:DRAFT_MEASUREMENT {
  rawAttr: mmt.raw_attr,
  description: mmt.description
})
`).errors;

console.log(require("util").inspect(r, { depth: null, colors: true }));
