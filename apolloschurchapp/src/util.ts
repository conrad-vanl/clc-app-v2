import URL from 'url';

export function present(value: string | undefined | null | ''): value is string {
  if (!value) { return false }

  if (!/\S/.test(value)) {
    return false
  }
  return true
}

export function rewriteContentfulUrl(url: string, query: Record<string, any> = {}): string {
  url = url.replace(/^(https?\:)?\/\//, 'https://')
  const parsed = URL.parse(url, true)
  Object.assign(parsed.query, query)

  return URL.format(parsed)
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
