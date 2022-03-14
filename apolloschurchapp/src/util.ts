
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
