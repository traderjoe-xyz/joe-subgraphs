import { Address, BigDecimal, BigInt, dataSource, ethereum, log } from '@graphprotocol/graph-ts'
import {
  BIG_DECIMAL_1E12,
  BIG_DECIMAL_1E18,
  BIG_DECIMAL_ZERO,
  BIG_INT_ONE,
  BIG_INT_ONE_DAY_SECONDS,
  BIG_INT_ZERO,
  BOOSTED_MASTER_CHEF_ADDRESS,
  VEJOE_TOKEN_ADDRESS,
  MASTER_CHEF_START_BLOCK,
  ADDRESS_ZERO,
} from 'const'
import {
  Add as AddEvent,
  BoostedMasterChef,
  Deposit as DepositEvent,
  EmergencyWithdraw as EmergencyWithdrawEvent,
  Set as SetEvent,
  Withdraw as WithdrawEvent
} from "../generated/BoostedMasterChef/BoostedMasterChef"
import { MasterChef, Pool, PoolHistory, Rewarder, User } from '../generated/schema'

import { getJoePrice, getUSDRate } from 'pricing'

import { ERC20 as ERC20Contract } from '../generated/boostedMasterChef/ERC20'
import { Pair as PairContract } from '../generated/BoostedMasterChef/Pair'
import { Rewarder as RewarderContract } from '../generated/BoostedMasterChef/Rewarder'
import { VeJoeToken as VeJoeTokenContract } from '../generated/BoostedMasterChef/VeJoeToken'

/*
 * Event handler, called after masterchef adds new LP pool
 * We get the pool and add this to graph
 */
export function handleAdd(event: AddEvent): void {
  const boostedMasterChef = getMasterChef(event.block)
  const allocPoint = event.params.allocPoint
  // get getPool to create pool
  const pool = getPool(boostedMasterChef.poolCount, event.block)
  pool.allocPoint = allocPoint
  pool.save()
  log.debug('[add] poolcount: {}, allocPoint: {}', [boostedMasterChef.poolCount.toString(), allocPoint.toString()])
  // Update MasterChef.
  boostedMasterChef.totalAllocPoint = boostedMasterChef.totalAllocPoint.plus(allocPoint)
  boostedMasterChef.poolCount = boostedMasterChef.poolCount.plus(BIG_INT_ONE)
  boostedMasterChef.save()
}

/*
 * Event handler, called after masterchef sets liquidity to LP pool
 * We get the pool and update to graph
 */
export function handleSet(event: SetEvent): void {
  const boostedMasterChef = getMasterChef(event.block)
  const pool = getPool(event.params.pid, event.block)
  const allocPoint = event.params.allocPoint
  // Update masterchef
  boostedMasterChef.totalAllocPoint = boostedMasterChef.totalAllocPoint.plus(allocPoint.minus(pool.allocPoint))
  boostedMasterChef.save()
  // Update pool
  pool.allocPoint = allocPoint
  if (event.params.overwrite) {
    const rewarder = getRewarder(event.params.rewarder, event.block)
    pool.rewarder = rewarder ? rewarder.id : null
  }
  log.debug('[set] pool: {}, alloc: {}, rewarder: {}', [
    pool.id,
    allocPoint.toString(),
    event.params.rewarder.toString(),
  ])
  pool.save()
}

/*
 * Event handler, called after user deposits liquidity
 * We update pool, histories and user jlp balances
 *
 * event params: {user, pid, amount}
 */
export function handleDeposit(event: DepositEvent): void {
  const amount = event.params.amount.divDecimal(BIG_DECIMAL_1E18)
  const boostedMasterChefContract = BoostedMasterChef.bind(BOOSTED_MASTER_CHEF_ADDRESS)
  // update pool
  const poolInfoResult = boostedMasterChefContract.try_poolInfo(event.params.pid)
  if (poolInfoResult.reverted) {
    log.info('[deposit] poolInfo reverted', [])
    return
  }
  const poolInfo = poolInfoResult.value
  const pool = getPool(event.params.pid, event.block)
  const poolHistory = getPoolHistory(pool, event.block)
  const pairContract = PairContract.bind(poolInfo.value0)
  pool.balance = pairContract.balanceOf(BOOSTED_MASTER_CHEF_ADDRESS)
  pool.lastRewardTimestamp = poolInfo.value2
  pool.accJoePerShare = poolInfo.value3
  const poolDays = event.block.timestamp.minus(pool.updatedAt).divDecimal(BigDecimal.fromString('86400'))
  pool.jlpAge = pool.jlpAge.plus(poolDays.times(pool.jlpBalance))
  pool.jlpDeposited = pool.jlpDeposited.plus(amount)
  pool.jlpBalance = pool.jlpBalance.plus(amount)
  pool.updatedAt = event.block.timestamp
  // get user
  const userInfo = boostedMasterChefContract.userInfo(event.params.pid, event.params.user)
  const user = getUser(event.params.pid, event.params.user, event.block)
  // If not currently in pool and depositing JLP
  if (!user.pool && event.params.amount.gt(BIG_INT_ZERO)) {
    user.pool = pool.id
    pool.userCount = pool.userCount.plus(BIG_INT_ONE)
    log.info('[deposit] user {} entered pool {}', [user.id, pool.id])
  }
  // Calculate JOE being paid out
  // NOTE: currently using pricing via JOE/USDT while exchange subgraph is based on JOE/AVAX
  // this results in some small discrepancy in JOE price, and therefore joeHarvestedUSD
  // we live with this data point has no impact to front end experience, only analytics
  if (event.block.number.gt(MASTER_CHEF_START_BLOCK) && user.amount.gt(BIG_INT_ZERO)) {
    const pending = user.amount
      .toBigDecimal()
      .times(pool.accJoePerShare.toBigDecimal())
      .div(BIG_DECIMAL_1E12)
      .minus(user.rewardDebt.toBigDecimal())
      .div(BIG_DECIMAL_1E18)
    log.info('[deposit] pending: {}', [pending.toString()])
    if (pending.gt(BIG_DECIMAL_ZERO)) {
      const joeHarvestedUSD = pending.times(getJoePrice(event.block))
      log.info('[deposit] joeHarvestedUSD: {}', [joeHarvestedUSD.toString()])
      user.joeHarvested = user.joeHarvested.plus(pending)
      user.joeHarvestedUSD = user.joeHarvestedUSD.plus(joeHarvestedUSD)
      pool.joeHarvested = pool.joeHarvested.plus(pending)
      pool.joeHarvestedUSD = pool.joeHarvestedUSD.plus(joeHarvestedUSD)
      poolHistory.joeHarvested = pool.joeHarvested
      poolHistory.joeHarvestedUSD = pool.joeHarvestedUSD
    }
  }
  // update user
  user.amount = userInfo.value0
  user.rewardDebt = userInfo.value1
  user.factor = userInfo.value2

  if (event.params.amount.gt(BIG_INT_ZERO)) {
    const reservesResult = pairContract.try_getReserves()
    if (!reservesResult.reverted) {
      const veJoeContract = VeJoeTokenContract.bind(VEJOE_TOKEN_ADDRESS)
      const totalSupply = pairContract.totalSupply()
      const share = amount.div(totalSupply.toBigDecimal())
      const token0Amount = reservesResult.value.value0.toBigDecimal().times(share)
      const token1Amount = reservesResult.value.value1.toBigDecimal().times(share)
      const token0PriceUSD = getUSDRate(pairContract.token0(), event.block)
      const token1PriceUSD = getUSDRate(pairContract.token1(), event.block)
      const token0USD = token0Amount.times(token0PriceUSD)
      const token1USD = token1Amount.times(token1PriceUSD)
      const entryUSD = token0USD.plus(token1USD)
      user.entryUSD = user.entryUSD.plus(entryUSD)
      pool.entryUSD = pool.entryUSD.plus(entryUSD)
      user.veJoeStaked = new BigDecimal(veJoeContract.balanceOf(user.address as Address))
      pool.veJoeStaked = new BigDecimal(veJoeContract.balanceOf(poolInfo.value0))
      poolHistory.entryUSD = pool.entryUSD
      poolHistory.veJoeStaked = new BigDecimal(veJoeContract.balanceOf(user.address as Address))
    } else {
      log.info("Deposit couldn't get reserves for pair {}", [poolInfo.value0.toHex()])
    }
  }
  user.save()
  pool.save()
  // update masterchef
  const boostedMasterChef = getMasterChef(event.block)
  const boostedMasterChefDays = event.block.timestamp
    .minus(boostedMasterChef.updatedAt)
    .divDecimal(BigDecimal.fromString('86400'))
  boostedMasterChef.jlpAge = boostedMasterChef.jlpAge.plus(boostedMasterChefDays.times(boostedMasterChef.jlpBalance))
  boostedMasterChef.jlpDeposited = boostedMasterChef.jlpDeposited.plus(amount)
  boostedMasterChef.jlpBalance = boostedMasterChef.jlpBalance.plus(amount)
  boostedMasterChef.updatedAt = event.block.timestamp
  boostedMasterChef.save()

  // update pool history
  poolHistory.jlpAge = pool.jlpAge
  poolHistory.jlpBalance = pool.balance.divDecimal(BIG_DECIMAL_1E18)
  poolHistory.jlpDeposited = poolHistory.jlpDeposited.plus(amount)
  poolHistory.userCount = pool.userCount
  poolHistory.save()
}

/*
 * Event handler, called after user withdraws liquidity
 * We update pool, histories and user jlp balances
 *
 * event params: {user, pid, amount}
 */
export function handleWithdraw(event: WithdrawEvent): void {
  const amount = event.params.amount.divDecimal(BIG_DECIMAL_1E18)
  const boostedMasterChefContract = BoostedMasterChef.bind(BOOSTED_MASTER_CHEF_ADDRESS)
  // update pool
  const poolInfoResult = boostedMasterChefContract.try_poolInfo(event.params.pid)
  if (poolInfoResult.reverted) {
    log.info('[withdraw] poolInfo reverted', [])
    return
  }
  const poolInfo = poolInfoResult.value
  const pool = getPool(event.params.pid, event.block)
  const poolHistory = getPoolHistory(pool, event.block)
  const pairContract = PairContract.bind(poolInfo.value0)
  pool.balance = pairContract.balanceOf(BOOSTED_MASTER_CHEF_ADDRESS)
  pool.lastRewardTimestamp = poolInfo.value2
  pool.accJoePerShare = poolInfo.value3
  const poolDays = event.block.timestamp.minus(pool.updatedAt).divDecimal(BigDecimal.fromString('86400'))
  const poolAge = pool.jlpAge.plus(poolDays.times(pool.jlpBalance))
  const poolAgeRemoved = poolAge.div(pool.jlpBalance).times(amount)
  pool.jlpAge = poolAge.minus(poolAgeRemoved)
  pool.jlpAgeRemoved = pool.jlpAgeRemoved.plus(poolAgeRemoved)
  pool.jlpWithdrawn = pool.jlpWithdrawn.plus(amount)
  pool.jlpBalance = pool.jlpBalance.minus(amount)
  pool.updatedAt = event.block.timestamp
  // get user
  const user = getUser(event.params.pid, event.params.user, event.block)
  const userInfo = boostedMasterChefContract.userInfo(event.params.pid, event.params.user)

  // calculate JOE owed
  if (event.block.number.gt(MASTER_CHEF_START_BLOCK) && user.amount.gt(BIG_INT_ZERO)) {
    const pending = user.amount
      .toBigDecimal()
      .times(pool.accJoePerShare.toBigDecimal())
      .div(BIG_DECIMAL_1E12)
      .minus(user.rewardDebt.toBigDecimal())
      .div(BIG_DECIMAL_1E18)
    log.info('[withdraw] pending: {}', [pending.toString()])
    if (pending.gt(BIG_DECIMAL_ZERO)) {
      const joeHarvestedUSD = pending.times(getJoePrice(event.block))
      log.info('[withdraw] harvested: {}', [joeHarvestedUSD.toString()])
      user.joeHarvested = user.joeHarvested.plus(pending)
      user.joeHarvestedUSD = user.joeHarvestedUSD.plus(joeHarvestedUSD)
      pool.joeHarvested = pool.joeHarvested.plus(pending)
      pool.joeHarvestedUSD = pool.joeHarvestedUSD.plus(joeHarvestedUSD)
      poolHistory.joeHarvested = pool.joeHarvested
      poolHistory.joeHarvestedUSD = pool.joeHarvestedUSD
    }
  }
  // update user
  user.amount = userInfo.value0
  user.rewardDebt = userInfo.value1
  if (event.params.amount.gt(BIG_INT_ZERO)) {
    const reservesResult = pairContract.try_getReserves()
    if (!reservesResult.reverted) {
      const totalSupply = pairContract.totalSupply()
      const share = amount.div(totalSupply.toBigDecimal())
      const token0Amount = reservesResult.value.value0.toBigDecimal().times(share)
      const token1Amount = reservesResult.value.value1.toBigDecimal().times(share)
      const token0PriceUSD = getUSDRate(pairContract.token0(), event.block)
      const token1PriceUSD = getUSDRate(pairContract.token1(), event.block)
      const token0USD = token0Amount.times(token0PriceUSD)
      const token1USD = token1Amount.times(token1PriceUSD)
      const exitUSD = token0USD.plus(token1USD)
      pool.exitUSD = pool.exitUSD.plus(exitUSD)
      poolHistory.exitUSD = pool.exitUSD
      user.exitUSD = user.exitUSD.plus(exitUSD)
    } else {
      log.info("Withdraw couldn't get reserves for pair {}", [poolInfo.value0.toHex()])
    }
  }
  // If JLP amount equals zero, remove from pool and reduce userCount
  if (user.amount.equals(BIG_INT_ZERO)) {
    const veJoeContract = VeJoeTokenContract.bind(VEJOE_TOKEN_ADDRESS)
    const userVeJoeBalance = new BigDecimal(veJoeContract.balanceOf(user.address as Address))
    user.pool = null
    user.veJoeStaked = BIG_DECIMAL_ZERO
    pool.userCount = pool.userCount.minus(BIG_INT_ONE)
    pool.veJoeStaked = pool.veJoeStaked.minus(userVeJoeBalance)
    poolHistory.veJoeStaked = poolHistory.veJoeStaked.minus(userVeJoeBalance)
  }
  user.save()
  pool.save()
  // update masterchef
  const boostedMasterChef = getMasterChef(event.block)
  const days = event.block.timestamp.minus(boostedMasterChef.updatedAt).divDecimal(BigDecimal.fromString('86400'))
  const jlpAge = boostedMasterChef.jlpAge.plus(days.times(boostedMasterChef.jlpBalance))
  const jlpAgeRemoved = jlpAge.div(boostedMasterChef.jlpBalance).times(amount)
  boostedMasterChef.jlpAge = jlpAge.minus(jlpAgeRemoved)
  boostedMasterChef.jlpAgeRemoved = boostedMasterChef.jlpAgeRemoved.plus(jlpAgeRemoved)
  boostedMasterChef.jlpWithdrawn = boostedMasterChef.jlpWithdrawn.plus(amount)
  boostedMasterChef.jlpBalance = boostedMasterChef.jlpBalance.minus(amount)
  boostedMasterChef.updatedAt = event.block.timestamp
  boostedMasterChef.save()

  // update pool history
  poolHistory.jlpAge = pool.jlpAge
  poolHistory.jlpAgeRemoved = poolHistory.jlpAgeRemoved.plus(jlpAgeRemoved)
  poolHistory.jlpBalance = pool.balance.divDecimal(BIG_DECIMAL_1E18)
  poolHistory.jlpWithdrawn = poolHistory.jlpWithdrawn.plus(amount)
  poolHistory.userCount = pool.userCount
  poolHistory.save()
}

/*
 * Event handler for emergencyWithdraw
 *
 */
export function handleEmergencyWithdraw(event: EmergencyWithdrawEvent): void {
  log.info('User {} emergancy withdrawal of {} from pool #{}', [
    event.params.user.toHex(),
    event.params.amount.toString(),
    event.params.pid.toString(),
  ])
  const pool = getPool(event.params.pid, event.block)
  const pairContract = PairContract.bind(pool.pair as Address)
  pool.balance = pairContract.balanceOf(BOOSTED_MASTER_CHEF_ADDRESS)
  pool.save()
  // Update user
  const user = getUser(event.params.pid, event.params.user, event.block)
  user.amount = BIG_INT_ZERO
  user.rewardDebt = BIG_INT_ZERO
  user.veJoeStaked = BIG_DECIMAL_ZERO
  user.save()
}

// UTILITY FUNCTIONS

/*
 * get or create masterchef
 */
function getMasterChef(block: ethereum.Block): MasterChef {
  let boostedMasterChef = MasterChef.load(BOOSTED_MASTER_CHEF_ADDRESS.toHex())

  if (boostedMasterChef === null) {
    log.info('[getMasterChef] creating new master chef', [])

    const contract = BoostedMasterChef.bind(BOOSTED_MASTER_CHEF_ADDRESS)
    boostedMasterChef = new MasterChef(BOOSTED_MASTER_CHEF_ADDRESS.toHex())
    boostedMasterChef.owner = contract.owner()
    boostedMasterChef.masterPid = contract.MASTER_PID().toI32()
    // poolInfo ...
    boostedMasterChef.startTimestamp = block.timestamp
    boostedMasterChef.joe = contract.JOE()
    boostedMasterChef.joePerSec = contract.joePerSec()
    boostedMasterChef.totalAllocPoint = BIG_INT_ZERO
    // userInfo ...
    boostedMasterChef.poolCount = BIG_INT_ZERO

    boostedMasterChef.jlpBalance = BIG_DECIMAL_ZERO
    boostedMasterChef.jlpAge = BIG_DECIMAL_ZERO
    boostedMasterChef.jlpAgeRemoved = BIG_DECIMAL_ZERO
    boostedMasterChef.jlpDeposited = BIG_DECIMAL_ZERO
    boostedMasterChef.jlpWithdrawn = BIG_DECIMAL_ZERO

    boostedMasterChef.updatedAt = block.timestamp

    boostedMasterChef.save()
  }

  return boostedMasterChef as MasterChef
}

/*
 * get or create pool
 */
export function getPool(id: BigInt, block: ethereum.Block): Pool {
  let pool = Pool.load(id.toString())
  const boostedMasterChef = getMasterChef(block)
  const boostedMasterChefContract = BoostedMasterChef.bind(BOOSTED_MASTER_CHEF_ADDRESS)
  const poolInfoResult = boostedMasterChefContract.try_poolInfo(id)
  if (poolInfoResult.reverted) {
    log.info('[masterchef getPool] poolInfo reverted', [])
    return null
  }
  const poolInfo = poolInfoResult.value

  if (pool === null) {
    // Create new pool.
    pool = new Pool(id.toString())
    log.info('[getPool] creating new pool, {}', [id.toString()])

    // Set relation
    pool.owner = boostedMasterChef.id
    pool.pair = poolInfo.value0
    pool.allocPoint = poolInfo.value1
    pool.lastRewardTimestamp = poolInfo.value2
    pool.accJoePerShare = poolInfo.value3
    pool.rewarder = null
    // Total supply of LP tokens
    pool.balance = BIG_INT_ZERO
    pool.userCount = BIG_INT_ZERO

    pool.jlpBalance = BIG_DECIMAL_ZERO
    pool.jlpAge = BIG_DECIMAL_ZERO
    pool.jlpAgeRemoved = BIG_DECIMAL_ZERO
    pool.jlpDeposited = BIG_DECIMAL_ZERO
    pool.jlpWithdrawn = BIG_DECIMAL_ZERO

    pool.timestamp = block.timestamp
    pool.block = block.number

    pool.updatedAt = block.timestamp
    pool.entryUSD = BIG_DECIMAL_ZERO
    pool.exitUSD = BIG_DECIMAL_ZERO
    pool.joeHarvested = BIG_DECIMAL_ZERO
    pool.joeHarvestedUSD = BIG_DECIMAL_ZERO
    pool.veJoeStaked = BIG_DECIMAL_ZERO
    pool.save()
  }
  // Update rewarder again outside of scope as it may be updated anytime during lifecycle
  // of a pool.
  const rewarder = getRewarder(poolInfo.value5, block)
  pool.rewarder = rewarder ? rewarder.id : null
  pool.save()

  return pool as Pool
}

function getRewarder(rewarderAddress: Address, block: ethereum.Block): Rewarder {
  if (rewarderAddress == ADDRESS_ZERO || rewarderAddress == null) {
    return null
  }

  let rewarder = Rewarder.load(rewarderAddress.toHex())
  if (rewarder == null) {
    log.info('[getRewarder] Creating new rewarder {}', [rewarderAddress.toHexString()])
    rewarder = new Rewarder(rewarderAddress.toHex())
  }
  const rewarderContract = RewarderContract.bind(rewarderAddress)
  const tokenAddressCall = rewarderContract.try_rewardToken()
  const tokenAddress = tokenAddressCall.reverted ? ADDRESS_ZERO : tokenAddressCall.value
  rewarder.rewardToken = tokenAddress

  const tokenPerSecCall = rewarderContract.try_tokenPerSec()
  rewarder.tokenPerSec = tokenPerSecCall.reverted ? BIG_INT_ZERO : tokenPerSecCall.value

  const tokenContract = ERC20Contract.bind(tokenAddress)
  const tokenNameCall = tokenContract.try_name()
  rewarder.name = tokenNameCall.reverted ? '' : tokenNameCall.value

  const tokenSymbolCall = tokenContract.try_symbol()
  rewarder.symbol = tokenSymbolCall.reverted ? '' : tokenSymbolCall.value

  const tokenDecimalsCall = tokenContract.try_decimals()
  rewarder.decimals = tokenDecimalsCall.reverted ? 0 : tokenDecimalsCall.value

  const currentBalanceCall = tokenContract.try_balanceOf(rewarderAddress)
  const currentBalance = currentBalanceCall.reverted ? BIG_INT_ZERO : currentBalanceCall.value
  const secondsLeft = rewarder.tokenPerSec == BIG_INT_ZERO ? BIG_INT_ZERO : currentBalance.div(rewarder.tokenPerSec)
  rewarder.endTimestamp = block.timestamp.plus(secondsLeft)
  rewarder.save()

  return rewarder as Rewarder
}

/*
 * get or create poolHistory
 */
function getPoolHistory(pool: Pool, block: ethereum.Block): PoolHistory {
  const day = block.timestamp.div(BIG_INT_ONE_DAY_SECONDS)

  const id = pool.id.concat(day.toString())

  let history = PoolHistory.load(id)

  if (history === null) {
    log.info('[getPoolHistory] creating new pool history, pool: {}, day: {}', [pool.id, day.toString()])
    history = new PoolHistory(id)
    history.pool = pool.id
    history.jlpBalance = BIG_DECIMAL_ZERO
    history.jlpAge = BIG_DECIMAL_ZERO
    history.jlpAgeRemoved = BIG_DECIMAL_ZERO
    history.jlpDeposited = BIG_DECIMAL_ZERO
    history.jlpWithdrawn = BIG_DECIMAL_ZERO
    history.userCount = BIG_INT_ZERO
    history.timestamp = block.timestamp
    history.block = block.number
    history.entryUSD = BIG_DECIMAL_ZERO
    history.exitUSD = BIG_DECIMAL_ZERO
    history.joeHarvested = BIG_DECIMAL_ZERO
    history.joeHarvestedUSD = BIG_DECIMAL_ZERO
    history.veJoeStaked = BIG_DECIMAL_ZERO
  }

  return history as PoolHistory
}

/*
 * get or create user
 */
export function getUser(pid: BigInt, address: Address, block: ethereum.Block): User {
  const uid = address.toHex()
  const id = pid.toString().concat('-').concat(uid)

  let user = User.load(id)

  if (user === null) {
    log.info('[getUser] creating new user : {}, pid: {}', [address.toString(), pid.toString()])
    user = new User(id)
    user.pool = null
    user.poolId = pid.toString()
    user.address = address
    user.amount = BIG_INT_ZERO
    user.rewardDebt = BIG_INT_ZERO
    user.joeHarvested = BIG_DECIMAL_ZERO
    user.joeHarvestedUSD = BIG_DECIMAL_ZERO
    user.entryUSD = BIG_DECIMAL_ZERO
    user.exitUSD = BIG_DECIMAL_ZERO
    user.veJoeStaked = BIG_DECIMAL_ZERO
    user.factor = BIG_INT_ZERO
    user.timestamp = block.timestamp
    user.block = block.number
    user.save()
  }

  return user as User
}
