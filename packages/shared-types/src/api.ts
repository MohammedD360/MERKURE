export interface ApiResponse<T> {
  data: T
  meta?: {
    total?: number
    page?: number
    pageSize?: number
  }
}

export interface ApiError {
  statusCode: number
  error: string
  message: string
}

export interface PaginationParams {
  page?: number
  pageSize?: number
}

// WebSocket events
export type WsEventType =
  | 'position:update'
  | 'position:close'
  | 'alert:triggered'
  | 'sync:complete'
  | 'sync:error'

export interface WsEvent<T = unknown> {
  type: WsEventType
  payload: T
  timestamp: string
}
