/// <reference types="vite/client" />

interface ImportMeta {
  readonly env: ImportMetaEnv;
  glob: (pattern: string, options?: any) => Record<string, unknown>;
}

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // more env variables...
}
