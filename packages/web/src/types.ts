import { Entity, EntityId, RobotId } from './entity-types.js'
import { ItemType } from './item-types.js'
import { SimpleVec2 } from './vec2.js'

export type ChunkId = string
export type NodeId = string
export type CellId = string
export type ConnectionId = string

export interface Node {
  entityId: EntityId
}

export interface Cell {
  entityId: EntityId | null
}

export interface Chunk {
  id: ChunkId
  cells: (Cell | null)[]
}

export interface Robot {
  position: SimpleVec2
  stationId: EntityId | null
}

export interface World {
  start: number

  version: number
  tick: number

  chunks: Record<ChunkId, Chunk>
  entities: Record<EntityId, Entity>
  robots: Record<RobotId, Robot>

  research: Partial<Record<ItemType, number>>

  nextEntityId: number
}

export interface Client {
  position: SimpleVec2
  zoom: number
}

export enum WorkerMessageType {
  TickRequest = 'tick-request',
  TickResponse = 'tick-response',

  FastForwardRequest = 'fast-forward-request',
  FastForwardResponse = 'fast-forward-response',
}

export interface TickRequest {
  type: WorkerMessageType.TickRequest
  world: World
}

export interface TickStats {
  satisfaction: number
}

export interface TickResponse {
  type: WorkerMessageType.TickResponse
  world: World
  stats: TickStats
}

export interface FastForwardRequest {
  type: WorkerMessageType.FastForwardRequest
  world: World
}

export interface FastForwardResponse {
  type: WorkerMessageType.FastForwardResponse
  world: World
  ticks: number
}

export type WorkerMessage =
  | TickRequest
  | TickResponse
  | FastForwardRequest
  | FastForwardResponse
