import { useParams } from 'react-router-dom'
import invariant from 'tiny-invariant'
import { EntityId } from '../game-state.js'

export function useEntityId() {
  const params = useParams<{ id: EntityId }>()
  invariant(params.id)
  return params.id
}
