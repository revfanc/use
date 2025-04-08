interface InterceptorHandler<T = any> {
  resolved: (value: T) => T | Promise<T>
  rejected?: (error: any) => any
}

class Interceptor<T = any> {
  private interceptors: (InterceptorHandler<T> | null)[] = []

  use(resolved: (value: T) => T | Promise<T>, rejected?: (error: any) => any): number {
    this.interceptors.push({
      resolved,
      rejected,
    })
    return this.interceptors.length - 1
  }

  forEach(fn: (interceptor: InterceptorHandler<T>) => void): void {
    this.interceptors.forEach((interceptor) => {
      if (interceptor !== null) {
        fn(interceptor)
      }
    })
  }

  eject(id: number): void {
    if (this.interceptors[id]) {
      this.interceptors[id] = null
    }
  }

  clear(): void {
    this.interceptors = []
  }
}

export default class Interceptors<T = any> {
  before: Interceptor<T>
  after: Interceptor<T>

  constructor() {
    this.before = new Interceptor<T>()
    this.after = new Interceptor<T>()
  }

  execute(fn: (config: T) => Promise<T>, config: T = {} as T): Promise<T> {
    const chain: InterceptorHandler<T>[] = [{ resolved: fn, rejected: undefined }]

    this.before.forEach((interceptor) => {
      chain.unshift(interceptor)
    })

    this.after.forEach((interceptor) => {
      chain.push(interceptor)
    })

    let promise = Promise.resolve(config)

    while (chain.length) {
      const { resolved, rejected } = chain.shift()!
      promise = promise.then(resolved, rejected)
    }

    return promise
  }
} 