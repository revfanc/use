/**
 * CSS Module Type Declarations
 */

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

declare module '*.scss' {
  const content: string
  export default content
}

declare module '*.less' {
  const content: string
  export default content
}

declare module '*.postcss' {
  const content: string
  export default content
}
