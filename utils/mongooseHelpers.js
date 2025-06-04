// utils/mongooseHelpers.js
function applyTransform(doc, schema = null) {
  if (!doc || typeof doc !== "object") return doc;

  const transformed = { ...doc };

  if (transformed._id) {
    transformed.id = transformed._id;
    delete transformed._id;
  }
  if (transformed.__v !== undefined) {
    delete transformed.__v;
  }

  return transformed;
}

module.exports = { applyTransform };
