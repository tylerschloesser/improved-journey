export enum ItemType {
  Coal = 'coal',
  IronOre = 'iron-ore',
  IronPlate = 'iron-plate',
}

export interface ItemStack {
  type: ItemType
  count: number
}
