import { combineLatest, map } from 'rxjs'
import { InitArgs } from './init-args.js'
import { connection$, entities$ } from './game-state.js'

export function initConnection(args: InitArgs) {
  const entity$ = combineLatest([connection$, entities$]).pipe(
    map(([connection, entities]) =>
      connection ? entities[connection.entityId] : null,
    ),
  )

  entity$.subscribe((entity) => {
    if (entity === null) return

    console.log('render connection for', entity)
  })
}
