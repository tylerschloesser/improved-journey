import { LabEntity } from '../entity-types.js'
import { TickEntityFn } from './tick-types.js'

export const tickLab: TickEntityFn<LabEntity> = ({
  entity,
  world,
  satisfaction,
  moved,
}) => {}
