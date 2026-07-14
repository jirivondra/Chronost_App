// This collection addresses the host via literal variable placeholders baked into the path
// segments (e.g. "{{todo_id}}"), not Postman's ":param" path-variable feature, and the host
// array is a single "{{protocol}}{{host}}{{port}}" placeholder — not a real hostname. Only the
// path *segments* are spec-derived; host/raw prefix always comes from an existing request, so
// the result never depends on a "baseUrl" environment variable this collection doesn't define.
export function buildUrl(currentUrl, skeletonPathSegments) {
  const path = skeletonPathSegments.map((segment) =>
    segment.startsWith(':') ? `{{${segment.slice(1)}}}` : segment
  )
  const hostPrefix = currentUrl.host.join('')
  return { raw: `${hostPrefix}/${path.join('/')}`, host: currentUrl.host, path }
}
