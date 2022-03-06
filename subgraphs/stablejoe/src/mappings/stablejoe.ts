import { Address, BigDecimal, BigInt, dataSource, ethereum, log } from '@graphprotocol/graph-ts'
import {
  BIG_DECIMAL_1E18,
  BIG_DECIMAL_1E6,
  BIG_DECIMAL_ZERO,
  JOE_USDT_PAIR_ADDRESS,
  USDC_ADDRESS,
  USDC_E_ADDRESS,
} from 'const'
import {
  ClaimReward as ClaimRewardEvent,
  Deposit as DepositEvent,
  DepositFeeChanged as DepositFeeChangedEvent,
  Withdraw as WithdrawEvent,
} from '../../generated/StableJoeStaking/StableJoeStaking'
import { StableJoe, User } from '../../generated/schema'
import { Pair as PairContract } from '../../generated/StableJoeStaking/Pair'
import { getStableJoeDayData } from '../entities'

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

function createStableJoe(block: ethereum.Block): StableJoe {
  log.debug('[createStableJoe] from {}', [dataSource.address().toHex()])

  const stableJoe = new StableJoe(dataSource.address().toHex())
  stableJoe.joeStaked = BIG_DECIMAL_ZERO
  stableJoe.joeStakedUSD = BIG_DECIMAL_ZERO
  stableJoe.usdHarvested = BIG_DECIMAL_ZERO
  stableJoe.depositFee = BIG_DECIMAL_ZERO
  stableJoe.depositFeeJOE = BIG_DECIMAL_ZERO
  stableJoe.depositFeeUSD = BIG_DECIMAL_ZERO
  stableJoe.updatedAt = block.timestamp
  stableJoe.save()

  return stableJoe as StableJoe
}

function getStableJoe(block: ethereum.Block): StableJoe {
  log.debug('[getStableJoe] from {}', [dataSource.address().toHex()])

  let stableJoe = StableJoe.load(dataSource.address().toHex())

  if (stableJoe === null) {
    stableJoe = createStableJoe(block)
  }

  return stableJoe as StableJoe
}

function createUser(address: Address, block: ethereum.Block): User {
  const user = new User(address.toHex())

  user.stableJoe = dataSource.address().toHex()
  user.joeStaked = BIG_DECIMAL_ZERO
  user.joeStakedUSD = BIG_DECIMAL_ZERO
  user.usdHarvested = BIG_DECIMAL_ZERO
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

export function handleClaimReward(event: ClaimRewardEvent): void {
  const stableJoe = getStableJoe(event.block)
  const user = getUser(event.params.user, event.block)

  user.usdHarvested = user.usdHarvested.plus(convertAmountToDecimal(event.params.amount))
  user.updatedAt = event.block.timestamp
  user.save()

  stableJoe.usdHarvested = stableJoe.usdHarvested.plus(convertAmountToDecimal(event.params.amount))
  stableJoe.updatedAt = event.block.timestamp
  stableJoe.save()

  // update day data
  if (USDC_ADDRESS === event.params.rewardToken || USDC_E_ADDRESS === event.params.rewardToken) {
    let stableJoeDayData = getStableJoeDayData(event.address, event.block)
    stableJoeDayData.usdHarvested = stableJoeDayData.usdHarvested.plus(convertAmountToDecimal(event.params.amount))
    stableJoeDayData.save()
  }
}

export function handleDeposit(event: DepositEvent): void {
  log.debug('[handleDeposit] from {}', [dataSource.address().toHex()])

  const stableJoe = getStableJoe(event.block)
  let user = getUser(event.params.user, event.block)

  user.joeStaked = user.joeStaked.plus(convertAmountToDecimal(event.params.amount))
  user.joeStakedUSD = user.joeStakedUSD.plus(convertAmountToDecimal(event.params.amount).times(getJoePrice()))
  user.updatedAt = event.block.timestamp
  user.save()

  log.debug('[handleDeposit] updating stableJoe and saving {}', [event.address.toHexString()])
  stableJoe.joeStaked = stableJoe.joeStaked.plus(convertAmountToDecimal(event.params.amount))
  stableJoe.joeStakedUSD = stableJoe.joeStakedUSD.plus(convertAmountToDecimal(event.params.amount).times(getJoePrice()))
  stableJoe.updatedAt = event.block.timestamp
  stableJoe.save()

  log.debug('[handleDeposit] update deposit fees {}', [event.address.toHexString()])
  // update deposit fees
  if (stableJoe.depositFee) {
    stableJoe.depositFeeJOE = stableJoe.depositFeeJOE.plus(stableJoe.depositFee)
    stableJoe.depositFeeUSD = stableJoe.depositFeeUSD.plus(stableJoe.depositFee).times(getJoePrice())
  }

  log.debug('[handleDeposit] update day data {}', [event.address.toHexString()])
  // update day data
  let stableJoeDayData = getStableJoeDayData(event.address, event.block)
  stableJoeDayData.totalJoeStaked = stableJoe.joeStaked
  stableJoeDayData.joeStaked = stableJoeDayData.joeStaked.plus(convertAmountToDecimal(event.params.amount))
  stableJoeDayData.joeStakedUSD = stableJoeDayData.joeStakedUSD.plus(
    convertAmountToDecimal(event.params.amount).times(getJoePrice())
  )
  if (stableJoe.depositFee) {
    stableJoeDayData.depositFeeJOE = stableJoeDayData.depositFeeJOE.plus(stableJoe.depositFee)
    stableJoeDayData.depositFeeUSD = stableJoeDayData.depositFeeUSD.plus(stableJoe.depositFee).times(getJoePrice())
  }

  stableJoeDayData.save()
}

export function handleDepositFeeChanged(event: DepositFeeChangedEvent): void {
  const stableJoe = getStableJoe(event.block)

  stableJoe.depositFee = convertAmountToDecimal(event.params.newFee)
  stableJoe.updatedAt = event.block.timestamp
  stableJoe.save()
}

export function handleWithdraw(event: WithdrawEvent): void {
  const stableJoe = getStableJoe(event.block)
  const user = getUser(event.params.user, event.block)

  user.joeStaked = user.joeStaked.minus(convertAmountToDecimal(event.params.amount))
  user.joeStakedUSD = user.joeStakedUSD.minus(convertAmountToDecimal(event.params.amount).times(getJoePrice()))
  user.updatedAt = event.block.timestamp
  user.save()

  const joePrice = getJoePrice()
  stableJoe.joeStaked = stableJoe.joeStaked.minus(convertAmountToDecimal(event.params.amount))
  stableJoe.joeStakedUSD = stableJoe.joeStakedUSD.minus(
    convertAmountToDecimal(event.params.amount).times(getJoePrice())
  )
  stableJoe.updatedAt = event.block.timestamp
  stableJoe.save()

  // update day data
  let stableJoeDayData = getStableJoeDayData(event.address, event.block)
  stableJoeDayData.totalJoeStaked = stableJoe.joeStaked
  stableJoeDayData.joeUnstaked = stableJoeDayData.joeUnstaked.plus(convertAmountToDecimal(event.params.amount))
  stableJoeDayData.joeUnstakedUSD = stableJoeDayData.joeUnstakedUSD.plus(
    convertAmountToDecimal(event.params.amount).times(joePrice)
  )

  stableJoeDayData.save()
}
