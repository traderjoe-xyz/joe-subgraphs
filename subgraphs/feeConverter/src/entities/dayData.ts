import { DayData } from '../../generated/schema'
import { ethereum, BigInt } from '@graphprotocol/graph-ts'
import { BIG_DECIMAL_ZERO, BIG_INT_ZERO } from 'const'

export function loadDayData(block: ethereum.Block): DayData {
  const SECONDS_PER_DAY = 86400
  const day = block.timestamp.toI32() / SECONDS_PER_DAY
  const id = BigInt.fromI32(day).toString()

  let dayData = DayData.load(id)

  if (dayData === null) {
    dayData = new DayData(id)
    dayData.date = day * SECONDS_PER_DAY
    dayData.usdRemitted = BIG_DECIMAL_ZERO
  }

  dayData.save()

  return dayData as DayData
}
