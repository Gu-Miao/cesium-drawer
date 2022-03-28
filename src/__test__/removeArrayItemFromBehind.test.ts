import { removeArrayItemFromBehind } from '../utils'

test('removeArrayItemFromBehind()', () => {
  expect(removeArrayItemFromBehind([1, 2, 3, 4, 5], 5).join('')).toEqual('1234')
  expect(removeArrayItemFromBehind([true, 2, 'sadf'], 5).length).toEqual(3)
  expect(removeArrayItemFromBehind([10], 5).length).toEqual(1)
})
