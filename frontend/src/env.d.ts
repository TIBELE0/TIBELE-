/// <reference types="vite/client" />

declare interface ImportMetaEnv {
  readonly REACT_APP_API_URL?: string;
  readonly VITE_API_URL?: string;
  readonly VITE_PROXY_TARGET?: string;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}
