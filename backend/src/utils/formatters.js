
export function toFrontendFormat(doc) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  const { _id, __v, ...rest } = obj;
  return { ...rest, id: _id.toString() };
}

export function toFrontendFormatArray(docs) {
  return docs.map(doc => toFrontendFormat(doc));
}

export function sanitizeProductBody(body) {
  const { id, _id, __v, ...rest } = body;
  return rest;
}
