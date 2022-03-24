
export function present(value: string | undefined | null | ''): value is string {
  if (!value) { return false }

  if (!/\S/.test(value)) {
    return false
  }
  return true
}

export function rewriteContentfulUrl(url: string): string {
  return url.replace(/^(https?\:)?\/\//, 'https://')
}

export function parseName(name: string): { first: string, last?: string } {
  if (!present(name)) {
    return { first: '', last: '' }
  }

  const [first, ...remainder] = name.split(/\s+/)
  const last = remainder[remainder.length - 1] // Handle "Timothy (TA) Ateek"

  return {
    first,
    last
  }
}
