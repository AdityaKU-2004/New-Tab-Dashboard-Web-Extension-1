/// <reference types="chrome"/>

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.png' {
  const value: string;
  export default value;
}

declare global {
  interface Window {
    chrome?: typeof chrome;
  }
}

export {};
