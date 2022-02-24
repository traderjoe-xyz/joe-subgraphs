import { StableJoeDayData } from '../../generated/schema'
import { BIG_DECIMAL_ZERO } from 'const'
import { ethereum, BigInt } from '@graphprotocol/graph-ts'

export function getStableJoeDayData(block: ethereum.Block): StableJoeDayData {
  const SECONDS_PER_DAY = 86400
  const day = block.timestamp.toI32() / SECONDS_PER_DAY
  const id = BigInt.fromI32(day).toString()

  let dayData = StableJoeDayData.load(id)

  if (dayData === null) {
    dayData = new StableJoeDayData(id)
    dayData.date = day
    dayData.joeStaked = BIG_DECIMAL_ZERO
    dayData.joeStakedUSD = BIG_DECIMAL_ZERO
    dayData.joeUnstaked = BIG_DECIMAL_ZERO
    dayData.joeUnstakedUSD = BIG_DECIMAL_ZERO
    dayData.usdHarvested = BIG_DECIMAL_ZERO
    dayData.depositFeeJOE = BIG_DECIMAL_ZERO
    dayData.depositFeeUSD = BIG_DECIMAL_ZERO
  }

  dayData.save()
  return dayData as StableJoeDayData
}
