export enum ItemType {
  Coal = 'coal',
  IronOre = 'iron-ore',
  IronPlate = 'iron-plate',

  CopperOre = 'copper-ore',
  CopperPlate = 'copper-plate',
}

export interface ItemStack {
  type: ItemType
  count: number
}
