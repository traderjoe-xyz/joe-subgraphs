import { BigInt, ethereum } from '@graphprotocol/graph-ts'
import { BIG_DECIMAL_ZERO, BIG_INT_ZERO } from 'const'
import { RJLaunchEventCreated } from '../../generated/RocketJoe/RJLaunchEventCreated'
import { LaunchEventDayData } from '../../../generated/schema'
import { LaunchEvent } from '../../generated/schema'

export function updateLaunchEventDayData(event: ethereum.Event): LaunchEventDayData {
  const timestamp = event.block.timestamp.toI32()
  const SECONDS_PER_DAY = 86400
  const day = timestamp / SECONDS_PER_DAY
  const date = day * 86400

  const id = event.address.toHex().concat('-').concat(BigInt.fromI32(day).toString())

  const launchEvent = LaunchEvent.load(event.address.toHex())
  
  let launchEventDayData = LaunchEventDayData.load(id)

  if (launchEventDayData === null) {
    launchEventDayData = new LaunchEventDayData(id)
    launchEventDayData.date = date
    launchEventDayData.launchEvent = launchEvent.id
    launchEventDayData.volumeToken0 = BIG_DECIMAL_ZERO
    launchEventDayData.volumeToken1 = BIG_DECIMAL_ZERO
    launchEventDayData.volumeUSD = BIG_DECIMAL_ZERO
    launchEventDayData.txCount = BIG_INT_ZERO
  }

  launchEvent.reserve0 = launchEvent.reserve0
  launchEvent.reserve1 = launchEvent.reserve1
  launchEvent.reserveUSD = launchEvent.reserveUSD
  launchEvent.txCount = launchEventDayData.txCount.plus(BigInt.fromI32(1))

  launchEventDayData.save()

  return launchEventDayData as LaunchEventDayData
}
