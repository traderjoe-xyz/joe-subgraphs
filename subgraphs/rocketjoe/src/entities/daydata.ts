import { RocketJoeDayData } from '../../generated/schema'
import { BIG_DECIMAL_ZERO } from 'const'
import { ethereum, BigInt, Address } from '@graphprotocol/graph-ts'

export function getRocketJoeDayData(eventAddress: Address, block: ethereum.Block): RocketJoeDayData {
  const SECONDS_PER_DAY = 86400
  const day = block.timestamp.toI32() / SECONDS_PER_DAY
  const id = eventAddress.toHex().concat('-').concat(BigInt.fromI32(day).toString())

  let dayData = RocketJoeDayData.load(id)

  if (dayData === null) {
    dayData = new RocketJoeDayData(id)
    dayData.date = day * SECONDS_PER_DAY
    dayData.totalJoeStaked = BIG_DECIMAL_ZERO
    dayData.joeStaked = BIG_DECIMAL_ZERO
    dayData.joeStakedUSD = BIG_DECIMAL_ZERO
    dayData.joeUnstaked = BIG_DECIMAL_ZERO
    dayData.joeUnstakedUSD = BIG_DECIMAL_ZERO
  }

  dayData.save()
  return dayData as RocketJoeDayData
}
