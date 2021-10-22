import { BigInt } from '@graphprotocol/graph-ts'
import { BIG_DECIMAL_ZERO, BIG_INT_ZERO } from 'const'
import { LogConvert } from '../../generated/JoeMaker/JoeMaker'
import { ServingDayData } from '../../generated/schema'

export function getServingDayData(event: LogConvert): ServingDayData {
  const SECONDS_PER_DAY = 86400
  const day = event.block.timestamp.toI32() / SECONDS_PER_DAY
  const id = BigInt.fromI32(day).toString()

  let servingDayData = ServingDayData.load(id)

  if (servingDayData === null) {
    servingDayData = new ServingDayData(id)
    servingDayData.date = day * SECONDS_PER_DAY
    servingDayData.joeServed = BIG_DECIMAL_ZERO
    servingDayData.joeServedUSD = BIG_DECIMAL_ZERO
    servingDayData.totalServings = BIG_INT_ZERO
  }

  servingDayData.save()

  return servingDayData as ServingDayData
}
