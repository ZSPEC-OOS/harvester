export type SSEChunkEvent = { chunk: string; error?: never };
export type SSESourceEvent = { type: "source"; source: unknown; counts: { total: number; journal: number; preprint: number; web: number } };
export type SSEProgressEvent = { type: "log"; message: string };
export type SSECitationEvent = { type: "verified"; item: unknown };
export type SSECompleteEvent = { type: "done"; ranked?: unknown; total?: number };
export type SSEErrorEvent = { type?: "error"; error: string };
export type SSETokenEvent = { type: "token"; token: string };

export type SSEEvent = SSEChunkEvent | SSESourceEvent | SSEProgressEvent | SSECitationEvent | SSECompleteEvent | SSEErrorEvent | SSETokenEvent;
