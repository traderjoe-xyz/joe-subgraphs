import { BigInt, ethereum } from '@graphprotocol/graph-ts'
import { BIG_DECIMAL_ZERO, BIG_INT_ZERO } from 'const'
import { LaunchEventHourData } from '../../../generated/schema'
import { LaunchEvent } from '../../generated/schema'

export function updateLaunchEventHourData(event: ethereum.Event): LaunchEventHourData {
  const timestamp = event.block.timestamp.toI32()

  const hour = timestamp / 3600

  const date = hour * 3600

  const id = event.address.toHex().concat('-').concat(BigInt.fromI32(hour).toString())

  const launchEvent = LaunchEvent.load(event.address.toHex())
  
  let launchEventHourData = LaunchEventHourData.load(id)

  if (launchEventHourData === null) {
    launchEventHourData = new LaunchEventHourData(id)
    launchEventHourData.date = date
    launchEventHourData.launchEvent = launchEvent.id
    launchEventHourData.volumeToken0 = BIG_DECIMAL_ZERO
    launchEventHourData.volumeToken1 = BIG_DECIMAL_ZERO
    launchEventHourData.volumeUSD = BIG_DECIMAL_ZERO
    launchEventHourData.untrackedVolumeUSD = BIG_DECIMAL_ZERO
    launchEventHourData.txCount = BIG_INT_ZERO
  }

  launchEvent.reserve0 = launchEvent.reserve0
  launchEvent.reserve1 = launchEvent.reserve1
  launchEvent.reserveUSD = launchEvent.reserveUSD
  launchEvent.txCount = launchEventHourData.txCount.plus(BigInt.fromI32(1))

  launchEventHourData.save()

  return launchEventHourData as LaunchEventHourData
}
