export type Options<T, Required extends keyof T = never> =
  {
    // optional fields
    readonly [P in keyof T]?: T[P]
  } & {
    // required fields
    readonly [P in Required]-?: T[P]
  }

export function assign<T1, T2>(a: T1, b: T2): T1 & T2
export function assign<T1, T2, T3>(a: T1, b: T2, c: T3): T1 & T2 & T3
export function assign<T1, T2, T3, T4>(a: T1, b: T2, c: T3, d: T4): T1 & T2 & T3 & T4
export function assign(...partials: any[]): any {
  const result: any = {}

  for (const partial of partials) {
    if (!partial) {
      continue
    }

    for (const key of Object.keys(partial)) {
      const newVal = partial[key]
      if (typeof newVal != 'undefined') {
        result[key] = partial[key]
      }
    }
  }

  return result
}

export function required<TOpts, Keys extends keyof TOpts>(
  options: TOpts, ...keys: Keys[]
): { [k in keyof TOpts]-?: k extends Keys ? Exclude<TOpts[k], undefined | null> : TOpts[k] } {
  keys.forEach((k) => {
    if (!present(options[k])) {
      throw new Error(`Please set ${k}`)
    }
  })
  return options as any
}

export async function wait(ms: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(() => { resolve() }, ms)
  })
}

export function present<T>(value: T | null | undefined | false): value is T {
  if (typeof value == 'string') {
    return value && /\S/.test(value)
  }
  return !!value
}

export type XmlArray<T> = T | T[] | null | undefined

export function xmlArrayToJsonArray<T>(arr: XmlArray<T>): T[] {
  if (Array.isArray(arr)) {
    return arr
  }

  if (typeof arr == 'undefined' || arr == null) {
    return []
  }
  return [arr]
}

import readline from 'readline'
let rl: readline.Interface | undefined
export async function prompt(line: string): Promise<string> {
  if (!rl) {
    rl = readline.createInterface({
      input: process.stdin,
      output: process.stderr,
    })
  }

  return new Promise<string>((resolve) => {
    rl!.question(line, (answer) => {
      resolve(answer)
      rl!.close()
      rl = undefined
    })
  })
}
