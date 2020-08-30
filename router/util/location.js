
export function normalizeLocation(
  raw,
) {
  let next = typeof raw === 'string' ? { path: raw } : raw
  // named target
  if (next._normalized) {
    return next
  }
  next._normalized = true
  return next
}
