/**
 * Fix: Removed triple-slash reference to 'vite/client' which was causing a resolution error 
 * in the current environment.
 */

declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY?: string;
    [key: string]: any;
  }
}

/**
 * Fix: Added 'readonly' modifier to 'aistudio' to resolve the "identical modifiers" error.
 * This ensures compatibility when merging with the base Window interface declared by the host environment.
 */
interface Window {
  readonly aistudio: {
    hasSelectedApiKey(): Promise<boolean>;
    openSelectKey(): Promise<void>;
  };
}

/**
 * Fix: Updated @google/genai declarations to follow the latest developer guidelines.
 * Replaced deprecated types (SchemaType -> Type) and correctly defined the .text getter
 * on GenerateContentResponse. Added toolConfig and basic Live API support.
 */
declare module '@google/genai' {
  export enum Type {
    TYPE_UNSPECIFIED = 'TYPE_UNSPECIFIED',
    STRING = 'STRING',
    NUMBER = 'NUMBER',
    INTEGER = 'INTEGER',
    BOOLEAN = 'BOOLEAN',
    ARRAY = 'ARRAY',
    OBJECT = 'OBJECT',
    NULL = 'NULL',
  }

  export enum Modality {
    AUDIO = 'AUDIO',
    TEXT = 'TEXT',
    IMAGE = 'IMAGE',
  }

  export class GenerateContentResponse {
    /**
     * Returns the extracted string output.
     */
    get text(): string | undefined;
    candidates?: any[];
    functionCalls?: any[];
  }

  export interface GenerateContentParameters {
    model: string;
    contents: any;
    config?: GenerationConfig;
  }

  export interface Tool {
    googleSearch?: any;
    googleMaps?: any;
    functionDeclarations?: any[];
  }

  export interface GenerationConfig {
    systemInstruction?: string;
    temperature?: number;
    topP?: number;
    topK?: number;
    maxOutputTokens?: number;
    // DO NOT set responseMimeType for nano banana series models.
    responseMimeType?: string;
    // DO NOT set responseSchema for nano banana series models.
    responseSchema?: any;
    tools?: Tool[];
    toolConfig?: any;
    thinkingConfig?: { thinkingBudget: number };
  }

  export class Chat {
    sendMessage(params: { message: string }): Promise<GenerateContentResponse>;
    sendMessageStream(params: { message: string }): AsyncIterable<GenerateContentResponse>;
  }

  export class GoogleGenAI {
    constructor(options: { apiKey: string | undefined });
    models: {
      generateContent(params: GenerateContentParameters): Promise<GenerateContentResponse>;
      generateContentStream(params: GenerateContentParameters): AsyncIterable<GenerateContentResponse>;
      generateImages(params: any): Promise<any>;
      generateVideos(params: any): Promise<any>;
    };
    chats: {
      create(options: { model: string; config?: GenerationConfig }): Chat;
    };
    live: {
      connect(options: any): any;
    };
    operations: {
      getVideosOperation(options: any): Promise<any>;
    };
  }
}

// Khai báo module cho các thư viện không có sẵn types
declare module 'xlsx-js-style' {
  const XLSX: any;
  export default XLSX;
}

declare module 'recharts' {
    export const ResponsiveContainer: any;
    export const BarChart: any;
    export const Bar: any;
    export const XAxis: any;
    export const YAxis: any;
    export const CartesianGrid: any;
    export const Tooltip: any;
    export const Cell: any;
    export const PieChart: any;
    export const Pie: any;
    export const Legend: any;
    export const AreaChart: any;
    export const Area: any;
}