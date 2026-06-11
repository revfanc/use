declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<object, object, any>
  export default component
}

declare module '*.css' {
  const content: string
  export default content
}

declare module '*.css?inline' {
  const content: string
  export default content
}

declare module '*.css?url' {
  const url: string
  export default url
}
