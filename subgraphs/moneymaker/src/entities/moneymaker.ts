import { MoneyMaker } from '../../generated/schema'
import { ethereum, Address } from '@graphprotocol/graph-ts'
import { BIG_DECIMAL_ZERO, BIG_INT_ZERO } from 'const'

export function getMoneyMaker(address: Address, block: ethereum.Block): MoneyMaker {
  const id = address.toHex()
  let maker = MoneyMaker.load(id)

  if (maker === null) {
    maker = new MoneyMaker(id)
    maker.tokenRemitted = BIG_DECIMAL_ZERO
    maker.usdRemitted = BIG_DECIMAL_ZERO
    maker.totalRemits = BIG_INT_ZERO
  }
  maker.timestamp = block.timestamp
  maker.block = block.number

  maker.save()
  return maker as MoneyMaker
}
