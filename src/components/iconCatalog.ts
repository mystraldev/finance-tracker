export const selectableIcons = [
  'home', 'cart', 'shopping', 'utensils', 'coffee', 'car', 'bus', 'fuel',
  'plane', 'leisure', 'film', 'games', 'music', 'health', 'heart', 'gym',
  'education', 'book', 'pet', 'clothes', 'gift', 'phone', 'wifi', 'energy',
  'card', 'salary', 'piggy', 'package',
] as const

export type SelectableIcon = typeof selectableIcons[number]
