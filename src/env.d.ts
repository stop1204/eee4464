// env.d.ts
declare module '*.html' {
    const content: string;
    export default content;
}
// src/typings.d.ts
declare module "*.js" {
    const content: string;
    export default content;
}
