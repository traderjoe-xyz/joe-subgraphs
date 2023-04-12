import { FeeConverter } from '../../generated/schema'
import { JOE_FEE_CONVERTER } from 'const'
import { Address, ethereum } from '@graphprotocol/graph-ts'

export function loadFeeConverter(address: Address, block: ethereum.Block): FeeConverter | null {
  if (address != JOE_FEE_CONVERTER) {
    return null
  }

  const id = JOE_FEE_CONVERTER.toHex()
  let feeConverter = FeeConverter.load(id)

  if (feeConverter === null) {
    feeConverter = new FeeConverter(id)
  }
  feeConverter.timestamp = block.timestamp
  feeConverter.block = block.number

  feeConverter.save()
  return feeConverter
}
