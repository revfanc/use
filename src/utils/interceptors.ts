export interface InterceptorHandler<T> {
  resolved: (value: T) => T | Promise<T>;
  rejected?: (error: any) => any;
}

export class Interceptor<T = any> {
  private handlers: Array<InterceptorHandler<T> | null> = [];

  use(
    resolved: (value: T) => T | Promise<T>,
    rejected?: (error: any) => any
  ): number {
    this.handlers.push({ resolved, rejected });
    return this.handlers.length - 1;
  }

  forEach(fn: (interceptor: InterceptorHandler<T>) => void): void {
    this.handlers.forEach((interceptor) => {
      if (interceptor) fn(interceptor);
    });
  }

  eject(id: number): void {
    if (this.handlers[id]) this.handlers[id] = null;
  }

  clear(): void {
    this.handlers = [];
  }
}

export default class Interceptors<TBefore = any, TAfter = any> {
  readonly before = new Interceptor<TBefore>();
  readonly after = new Interceptor<TAfter>();

  execute(
    fn: (config: TBefore) => Promise<TAfter>,
    config: TBefore
  ): Promise<TAfter> {
    const chain: Array<{
      resolved: (value: any) => any;
      rejected?: (error: any) => any;
    }> = [{ resolved: fn }];

    // Preserve the existing LIFO order for before interceptors.
    this.before.forEach((interceptor) => chain.unshift(interceptor));
    // Preserve the existing FIFO order for after interceptors.
    this.after.forEach((interceptor) => chain.push(interceptor));

    let promise: Promise<any> = Promise.resolve(config);
    while (chain.length) {
      const { resolved, rejected } = chain.shift()!;
      promise = promise.then(resolved, rejected);
    }

    return promise;
  }
}
