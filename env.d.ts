
// Augment NodeJS.ProcessEnv to include API_KEY
// This handles the case where @types/node or similar library defines 'process' global
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY?: string;
    [key: string]: any;
  }
}

// Khai báo module @google/genai để sửa lỗi "Cannot find module"
// Giúp TypeScript hiểu import từ CDN/ImportMap
declare module '@google/genai' {
  export class GoogleGenAI {
    constructor(options: { apiKey: string | undefined });
    models: {
      generateContent(params: {
        model: string;
        contents: any;
        config?: any;
      }): Promise<{
        text: string;
        candidates?: Array<{
          content: {
            parts: Array<{ text: string }>;
          };
        }>;
      }>;
    };
  }
}

// Khai báo module xlsx-js-style để sửa lỗi build TS2307
declare module 'xlsx-js-style' {
  const XLSX: any;
  export default XLSX;
}
