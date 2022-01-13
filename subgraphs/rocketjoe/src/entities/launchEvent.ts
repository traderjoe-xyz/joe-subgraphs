import { Address, ethereum } from '@graphprotocol/graph-ts'
import { BIG_DECIMAL_ZERO, BIG_INT_ZERO } from 'const'

import { LaunchEvent } from '../../../generated/schema'

export function getLaunchEvent(address: Address, block: ethereum.Block = null): LaunchEvent | null {
  let launchEvent = LaunchEvent.load(address.toHex())

  if (launchEvent === null) {

    launchEvent = new LaunchEvent(address.toHex())
    launchEvent.liquidityProviderCount = BIG_INT_ZERO

    launchEvent.txCount = BIG_INT_ZERO
    launchEvent.reserve0 = BIG_DECIMAL_ZERO
    launchEvent.reserve1 = BIG_DECIMAL_ZERO
    launchEvent.volumeToken0 = BIG_DECIMAL_ZERO
    launchEvent.volumeToken1 = BIG_DECIMAL_ZERO
    launchEvent.volumeUSD = BIG_DECIMAL_ZERO
    launchEvent.untrackedVolumeUSD = BIG_DECIMAL_ZERO
    launchEvent.token0Price = BIG_DECIMAL_ZERO
    launchEvent.token1Price = BIG_DECIMAL_ZERO

    launchEvent.timestamp = block.timestamp
    launchEvent.block = block.number
  }

  return launchEvent as LaunchEvent
}

