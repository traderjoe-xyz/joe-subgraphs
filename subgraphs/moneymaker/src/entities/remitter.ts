import { Remitter } from '../../generated/schema'
import { ethereum, Address } from '@graphprotocol/graph-ts'
import { BIG_DECIMAL_ZERO, BIG_INT_ZERO } from 'const'

export function getRemitter(moneyMakerAddress: Address, remitterAddress: Address, block: ethereum.Block): Remitter {
  let remitter = Remitter.load(remitterAddress.toHex())

  if (remitter === null) {
    remitter = new Remitter(remitterAddress.toHex())
    remitter.moneyMaker = moneyMakerAddress.toHex()
    remitter.tokenRemitted = BIG_DECIMAL_ZERO
    remitter.usdRemitted = BIG_DECIMAL_ZERO
    remitter.totalRemits = BIG_INT_ZERO
  }

  remitter.timestamp = block.timestamp
  remitter.block = block.number
  remitter.save()

  return remitter as Remitter
}