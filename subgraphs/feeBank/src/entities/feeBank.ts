import { FeeBank } from '../../generated/schema'
import { BIG_DECIMAL_ZERO, JOE_FEE_BANK } from 'const'
import { Address, ethereum } from '@graphprotocol/graph-ts'

export function loadFeeBank(address: Address, block: ethereum.Block): FeeBank | null {
  if (address != JOE_FEE_BANK) {
    return null
  }

  const id = JOE_FEE_BANK.toHex()
  let feeBank = FeeBank.load(id)

  if (feeBank === null) {
    feeBank = new FeeBank(id)
    feeBank.usdRemitted = BIG_DECIMAL_ZERO
  }
  feeBank.timestamp = block.timestamp
  feeBank.block = block.number

  feeBank.save()
  return feeBank
}
