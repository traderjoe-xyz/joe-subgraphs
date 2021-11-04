import { Maker } from '../../generated/schema'
import { BIG_INT_ZERO, BIG_DECIMAL_ZERO, JOE_MAKER_ADDRESS } from 'const'
import { ethereum } from '@graphprotocol/graph-ts'

export function getMaker(block: ethereum.Block): Maker {
  const id = JOE_MAKER_ADDRESS.toHex()
  let maker = Maker.load(id)

  if (maker === null) {
    maker = new Maker(id)
    maker.joeServed = BIG_DECIMAL_ZERO
    maker.joeServedUSD = BIG_DECIMAL_ZERO
    maker.totalServings = BIG_INT_ZERO
  }
  maker.timestamp = block.timestamp
  maker.block = block.number

  maker.save()
  return maker as Maker
}
