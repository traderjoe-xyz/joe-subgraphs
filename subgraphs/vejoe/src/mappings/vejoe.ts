import { Address, BigDecimal, BigInt, dataSource, ethereum, log } from '@graphprotocol/graph-ts'
import {
  BIG_INT_ZERO,
  BIG_INT_ONE,
  BIG_DECIMAL_1E18,
  BIG_DECIMAL_1E6,
  BIG_DECIMAL_ZERO,
  JOE_USDT_PAIR_ADDRESS
} from 'const'
import {
  Claim as ClaimEvent,
  Deposit as DepositEvent,
  Withdraw as WithdrawEvent
} from "../../generated/VeJoeStaking/VeJoeStaking"
import {
  VeJoe,
  User
} from "../../generated/schema"
import { Pair as PairContract } from '../../generated/VeJoeStaking/Pair'
import { getVeJoeDayData } from '../entities'

function getJoePrice(): BigDecimal {
  const pair = PairContract.bind(JOE_USDT_PAIR_ADDRESS)
  const reservesResult = pair.try_getReserves()
  if (reservesResult.reverted) {
    log.info('[getJoePrice] getReserves reverted', [])
    return BIG_DECIMAL_ZERO
  }
  const reserves = reservesResult.value
  if (reserves.value0.toBigDecimal().equals(BigDecimal.fromString('0'))) {
    log.error('[getJoePrice] USDT reserve 0', [])
    return BIG_DECIMAL_ZERO
  }
  return reserves.value1.toBigDecimal().times(BIG_DECIMAL_1E18).div(reserves.value0.toBigDecimal()).div(BIG_DECIMAL_1E6)
}

export function convertAmountToDecimal(tokenAmount: BigInt): BigDecimal {
  return tokenAmount.toBigDecimal().div(exponentToBigDecimal(BigInt.fromString('18')))
}

export function exponentToBigDecimal(decimals: BigInt): BigDecimal {
  let bd = BigDecimal.fromString('1')
  for (let i = BigInt.fromI32(0); i.lt(decimals as BigInt); i = i.plus(BigInt.fromI32(1))) {
    bd = bd.times(BigDecimal.fromString('10'))
  }
  return bd
}

function createVeJoe(block: ethereum.Block): VeJoe {
  log.debug('[createVeJoe] from {}', [dataSource.address().toHex()])

  const veJoe = new VeJoe(dataSource.address().toHex())
  veJoe.joeStaked = BIG_DECIMAL_ZERO
  veJoe.joeStakedUSD = BIG_DECIMAL_ZERO
  veJoe.totalVeJoeMinted = BIG_DECIMAL_ZERO
  veJoe.totalVeJoeBurned = BIG_DECIMAL_ZERO
  veJoe.activeUserCount = BIG_INT_ZERO
  veJoe.updatedAt = block.timestamp
  veJoe.save()

  return veJoe as VeJoe
}

function createUser(address: Address, block: ethereum.Block): User {
  const user = new User(address.toHex())

  user.veJoe = dataSource.address().toHex()
  user.joeStaked = BIG_DECIMAL_ZERO
  user.joeStakedUSD = BIG_DECIMAL_ZERO
  user.totalVeJoeMinted = BIG_DECIMAL_ZERO
  user.totalVeJoeBurned = BIG_DECIMAL_ZERO
  user.veJoeBalance = BIG_DECIMAL_ZERO
  user.updatedAt = block.timestamp

  return user as User
}

function getUser(address: Address, block: ethereum.Block): User {
  let user = User.load(address.toHex())

  if (user === null) {
    user = createUser(address, block)
  }

  return user as User
}

function getVeJoe(block: ethereum.Block): VeJoe {
  log.debug('[getVeJoe] from {}', [dataSource.address().toHex()])

  let veJoe = VeJoe.load(dataSource.address().toHex())

  if (veJoe === null) {
    veJoe = createVeJoe(block)
  }

  return veJoe as VeJoe
}

export function handleClaim(event: ClaimEvent): void {
  const veJoe = getVeJoe(event.block)
  const user = getUser(event.params.user, event.block)
  const amountClaimed = convertAmountToDecimal(event.params.amount)
  const userBalancePreviouslyZero = user.veJoeBalance.equals(BIG_DECIMAL_ZERO)

  user.totalVeJoeMinted = user.totalVeJoeMinted.plus(amountClaimed)
  user.veJoeBalance = user.veJoeBalance.plus(amountClaimed)
  user.updatedAt = event.block.timestamp
  user.save()

  veJoe.totalVeJoeMinted = veJoe.totalVeJoeMinted.plus(amountClaimed)
  veJoe.updatedAt = event.block.timestamp
  if (userBalancePreviouslyZero && amountClaimed.notEqual(BIG_DECIMAL_ZERO)) {
    veJoe.activeUserCount = veJoe.activeUserCount.plus(BIG_INT_ONE)
  }
  veJoe.save()

  // update day data
  let stableJoeDayData = getVeJoeDayData(event.address, event.block)
  stableJoeDayData.veJoeMinted = stableJoeDayData.veJoeMinted.plus(convertAmountToDecimal(event.params.amount))
  stableJoeDayData.save()
}

export function handleDeposit(event: DepositEvent): void {
  log.debug('[handleDeposit] from {}', [dataSource.address().toHex()])

  const veJoe = getVeJoe(event.block)
  let user = getUser(event.params.user, event.block)
  const joePrice = getJoePrice()

  user.joeStaked = user.joeStaked.plus(convertAmountToDecimal(event.params.amount))
  user.joeStakedUSD = user.joeStaked.times(joePrice)
  user.updatedAt = event.block.timestamp
  user.save()

  log.debug('[handleDeposit] updating veJoe and saving {}', [event.address.toHexString()])

  veJoe.joeStaked = veJoe.joeStaked.plus(convertAmountToDecimal(event.params.amount))
  veJoe.joeStakedUSD = veJoe.joeStaked.times(joePrice)
  veJoe.updatedAt = event.block.timestamp
  veJoe.save()

  log.debug('[handleDeposit] update day data {}', [event.address.toHexString()])
  // update day data
  let veJoeDayData = getVeJoeDayData(event.address, event.block)
  veJoeDayData.totalJoeStaked = veJoe.joeStaked
  veJoeDayData.joeStaked = veJoeDayData.joeStaked.plus(convertAmountToDecimal(event.params.amount))
  veJoeDayData.joeStakedUSD = veJoeDayData.joeStaked.times(joePrice)

  veJoeDayData.save()
}

export function handleWithdraw(event: WithdrawEvent): void {
  const veJoe = getVeJoe(event.block)
  const user = getUser(event.params.user, event.block)
  const joePrice = getJoePrice()

  user.joeStaked = user.joeStaked.minus(convertAmountToDecimal(event.params.withdrawAmount))
  user.joeStakedUSD = user.joeStaked.times(joePrice)
  user.veJoeBalance = BIG_DECIMAL_ZERO
  user.updatedAt = event.block.timestamp
  user.save()

  veJoe.joeStaked = veJoe.joeStaked.minus(convertAmountToDecimal(event.params.withdrawAmount))
  veJoe.joeStakedUSD = veJoe.joeStaked.times(joePrice)
  veJoe.totalVeJoeBurned = veJoe.totalVeJoeBurned.plus(convertAmountToDecimal(event.params.burnAmount))
  veJoe.activeUserCount = veJoe.activeUserCount.minus(BIG_INT_ONE)
  veJoe.updatedAt = event.block.timestamp
  veJoe.save()

  // update day data
  let veJoeDayData = getVeJoeDayData(event.address, event.block)
  veJoeDayData.totalJoeStaked = veJoe.joeStaked
  veJoeDayData.joeUnstaked = veJoeDayData.joeUnstaked.plus(convertAmountToDecimal(event.params.withdrawAmount))
  veJoeDayData.joeUnstakedUSD = veJoeDayData.joeUnstaked.times(joePrice)
  veJoeDayData.veJoeBurned = veJoeDayData.veJoeBurned.plus(convertAmountToDecimal(event.params.burnAmount))

  veJoeDayData.save()
}
