// Postman path variables come out as ":paramName" segments; canonicalize them to "id"
// so the key stays stable even if the parameter gets renamed in the spec.
export function canonicalKey(method, urlPathSegments) {
  const segments = urlPathSegments.map((segment) => (segment.startsWith(':') ? 'id' : segment))
  return [method.toLowerCase(), ...segments].join('_')
}
