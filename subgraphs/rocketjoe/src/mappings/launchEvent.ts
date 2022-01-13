import { LaunchEvent, Withdraw, Deposit } from '../../generated/schema'
import { 
ADDRESS_ZERO,
BIG_DECIMAL_1E18,
BIG_DECIMAL_1E6,
BIG_DECIMAL_ZERO,
BIG_INT_ZERO
} from 'const'
import {
  UserWithdrawn as UserWithdrawnEvent,
  UserParticipated as UserParticipatedEvent,
  UserLiquidityWithdrawn as UserLiquidityWithdrawnEvent,
  IssuerLiquidityWithdrawn as IssuerLiquidityWithdrawnEvent,
} from '../../../generated/templates/RocketJoe/LaunchEvent'
import {
  getLaunchEvent,
  updateLaunchEventDayData,
  updateLaunchEventHourData
} from '../entities'
import { Entity } from '@graphprotocol/graph-ts'


export function onUserWithdrawn(event: UserWithdrawnEvent) { 
  const launchEvent = getLaunchEvent(event.address)

  const withdraws = launchEvent.withdraws

  const withdraw = Withdraw.load(withdraws[withdraws.length - 1])

  withdraw.userAddress = event.params.user 
  withdraw.launchEvent = launchEvent 
  withdraw.timestamp = event.block.timestamp
  withdraw.amount = event.params.AVAXamount
  withdraw.penalty = launchEvent.withdrawalPenalty
  withdraw.save()
}

export function onUserParticipated(event: UserParticipatedEvent) { 
  const launchEvent = getLaunchEvent(event.address)

  const deposits = launchEvent.deposits

  const deposit = Deposit.load(deposits[deposits.length - 1])

  deposit.userAddress = event.params.user 
  deposit.launchEvent = launchEvent 
  deposit.timestamp = event.block.timestamp
  deposit.amount = event.params.AVAXamount
  deposit.save()
}

export function onUserLiquidityWithdrawn(event: UserLiquidityWithdrawnEvent) { 
  const launchEvent = getLaunchEvent(event.address)

}

export function onIssuerLiquidityWithdrawn(event: IssuerLiquidityWithdrawnEvent) { 
  const launchEvent = getLaunchEvent(event.address)

}
