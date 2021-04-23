import {
  Add,
  Set,
  Deposit,
  EmergencyWithdraw,
  MasterChef as MasterChefContract,
  OwnershipTransferred,
  Withdraw,
} from '../generated/MasterChef/MasterChef'
import { Address, BigDecimal, BigInt, dataSource, ethereum, log } from '@graphprotocol/graph-ts'
import {
  BIG_DECIMAL_1E12,
  BIG_DECIMAL_1E18,
  BIG_DECIMAL_ZERO,
  BIG_INT_ONE,
  BIG_INT_ONE_DAY_SECONDS,
  BIG_INT_ZERO,
  MASTER_CHEF_ADDRESS,
  MASTER_CHEF_START_BLOCK,
} from 'const'
import { History, MasterChef, Pool, PoolHistory, User } from '../generated/schema'
import { getJoePrice, getUSDRate } from 'pricing'

import { ERC20 as ERC20Contract } from '../generated/MasterChef/ERC20'
import { Pair as PairContract } from '../generated/MasterChef/Pair'



/*
 * Event handler, called after masterchef adds new LP pool
 * We get the pool and add this to graph
 */ 
export function add(event: Add): void {
  const masterChef = getMasterChef(event.block)
  const allocPoint = event.params.allocPoint
  
  // get getPool to create pool
  getPool(masterChef.poolCount, event.block)

  // Update MasterChef.
  masterChef.totalAllocPoint = masterChef.totalAllocPoint.plus(allocPoint)
  masterChef.poolCount = masterChef.poolCount.plus(BIG_INT_ONE)
  masterChef.save()
}

/*
 * Event handler, called after masterchef sets liquidity to LP pool
 * We get the pool and update to graph
 */ 
export function set(event: Set): void {
  const masterChef = getMasterChef(event.block)
  const pool = getPool(event.params.pid, event.block)
  const allocPoint = event.params.allocPoint

  // Update masterchef
  masterChef.totalAllocPoint = masterChef.totalAllocPoint.plus(allocPoint.minus(pool.allocPoint))
  masterChef.save()

  // Update pool
  pool.allocPoint = allocPoint
  pool.save()
}


/*
 * Event handler, called after user deposits liquidity
 * We update pool, histories and user jlp balances
 * 
 * event params: {user, pid, amount}
 */ 
export function deposit(event: Deposit): void {
  const amount = event.params.amount.divDecimal(BIG_DECIMAL_1E18)
  const masterChefContract = MasterChefContract.bind(MASTER_CHEF_ADDRESS)

  // update pool
  const poolInfoResult = masterChefContract.try_poolInfo(event.params.pid)
  if (poolInfoResult.reverted) {
    log.info('[masterchef deposit] poolInfo reverted', [])
    return
  }
  const poolInfo = poolInfoResult.value
  const pool = getPool(event.params.pid, event.block)
  const poolHistory = getPoolHistory(pool, event.block)
  const pairContract = PairContract.bind(poolInfo.value0)
  pool.balance = pairContract.balanceOf(MASTER_CHEF_ADDRESS)
  pool.lastRewardTimestamp = poolInfo.value2
  pool.accJoePerShare = poolInfo.value3
  const poolDays = event.block.timestamp.minus(pool.updatedAt).divDecimal(BigDecimal.fromString('86400'))
  pool.jlpAge = pool.jlpAge.plus(poolDays.times(pool.jlpBalance))
  pool.jlpDeposited = pool.jlpDeposited.plus(amount)
  pool.jlpBalance = pool.jlpBalance.plus(amount)
  pool.updatedAt = event.block.timestamp

  // get user
  const userInfo = masterChefContract.userInfo(event.params.pid, event.params.user)
  const user = getUser(event.params.pid, event.params.user, event.block)

  // If not currently in pool and depositing JLP
  if (!user.pool && event.params.amount.gt(BIG_INT_ZERO)) {
    user.pool = pool.id
    pool.userCount = pool.userCount.plus(BIG_INT_ONE)
  }

  // Calculate JOE being paid out
  if (event.block.number.gt(MASTER_CHEF_START_BLOCK) && user.amount.gt(BIG_INT_ZERO)) {
    const pending = user.amount
      .toBigDecimal()
      .times(pool.accJoePerShare.toBigDecimal())
      .div(BIG_DECIMAL_1E12)
      .minus(user.rewardDebt.toBigDecimal())
      .div(BIG_DECIMAL_1E18)
    if (pending.gt(BIG_DECIMAL_ZERO)) {
      const joeHarvestedUSD = pending.times(getJoePrice(event.block))
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

      const entryUSD = token0USD.plus(token1USD)

      user.entryUSD = user.entryUSD.plus(entryUSD)

      pool.entryUSD = pool.entryUSD.plus(entryUSD)

      poolHistory.entryUSD = pool.entryUSD
    }
  }

  user.save()
  pool.save()

  // update masterchef
  const masterChef = getMasterChef(event.block)
  const masterChefDays = event.block.timestamp.minus(masterChef.updatedAt).divDecimal(BigDecimal.fromString('86400'))
  masterChef.jlpAge = masterChef.jlpAge.plus(masterChefDays.times(masterChef.jlpBalance))
  masterChef.jlpDeposited = masterChef.jlpDeposited.plus(amount)
  masterChef.jlpBalance = masterChef.jlpBalance.plus(amount)
  masterChef.updatedAt = event.block.timestamp
  masterChef.save()

  // update masterchef history
  const history = getHistory(MASTER_CHEF_ADDRESS.toHex(), event.block)
  history.jlpAge = masterChef.jlpAge
  history.jlpBalance = masterChef.jlpBalance
  history.jlpDeposited = history.jlpDeposited.plus(amount)
  history.save()

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
export function withdraw(event: Withdraw): void {
  const amount = event.params.amount.divDecimal(BIG_DECIMAL_1E18)
  const masterChefContract = MasterChefContract.bind(MASTER_CHEF_ADDRESS)

  // update pool
  const poolInfoResult = masterChefContract.try_poolInfo(event.params.pid)
  if (poolInfoResult.reverted) {
    log.info('[masterchef withdraw] poolInfo reverted', [])
    return
  }
  const poolInfo = poolInfoResult.value
  const pool = getPool(event.params.pid, event.block)
  const poolHistory = getPoolHistory(pool, event.block)
  const pairContract = PairContract.bind(poolInfo.value0)
  pool.balance = pairContract.balanceOf(MASTER_CHEF_ADDRESS)
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
  const userInfo = masterChefContract.userInfo(event.params.pid, event.params.user)

  // calculate JOE owed
  if (event.block.number.gt(MASTER_CHEF_START_BLOCK) && user.amount.gt(BIG_INT_ZERO)) {
    const pending = user.amount
      .toBigDecimal()
      .times(pool.accJoePerShare.toBigDecimal())
      .div(BIG_DECIMAL_1E12)
      .minus(user.rewardDebt.toBigDecimal())
      .div(BIG_DECIMAL_1E18)
    if (pending.gt(BIG_DECIMAL_ZERO)) {
      const joeHarvestedUSD = pending.times(getJoePrice(event.block))
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
    user.pool = null
    pool.userCount = pool.userCount.minus(BIG_INT_ONE)
  }

  user.save()
  pool.save()

  // update masterchef
  const masterChef = getMasterChef(event.block)
  const days = event.block.timestamp.minus(masterChef.updatedAt).divDecimal(BigDecimal.fromString('86400'))
  const jlpAge = masterChef.jlpAge.plus(days.times(masterChef.jlpBalance))
  const jlpAgeRemoved = jlpAge.div(masterChef.jlpBalance).times(amount)
  masterChef.jlpAge = jlpAge.minus(jlpAgeRemoved)
  masterChef.jlpAgeRemoved = masterChef.jlpAgeRemoved.plus(jlpAgeRemoved)
  masterChef.jlpWithdrawn = masterChef.jlpWithdrawn.plus(amount)
  masterChef.jlpBalance = masterChef.jlpBalance.minus(amount)
  masterChef.updatedAt = event.block.timestamp
  masterChef.save()

  // update masterchef history
  const history = getHistory(MASTER_CHEF_ADDRESS.toHex(), event.block)
  history.jlpAge = masterChef.jlpAge
  history.jlpAgeRemoved = history.jlpAgeRemoved.plus(jlpAgeRemoved)
  history.jlpBalance = masterChef.jlpBalance
  history.jlpWithdrawn = history.jlpWithdrawn.plus(amount)
  history.save()

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
export function emergencyWithdraw(event: EmergencyWithdraw): void {
  log.info('User {} emergancy withdrawal of {} from pool #{}', [
    event.params.user.toHex(),
    event.params.amount.toString(),
    event.params.pid.toString(),
  ])

  const pool = getPool(event.params.pid, event.block)

  const pairContract = PairContract.bind(pool.pair as Address)
  pool.balance = pairContract.balanceOf(MASTER_CHEF_ADDRESS)
  pool.save()

  // Update user
  const user = getUser(event.params.pid, event.params.user, event.block)
  user.amount = BIG_INT_ZERO
  user.rewardDebt = BIG_INT_ZERO

  user.save()
}

/*
 * Event handler for ownershipTransferred
 * 
 */ 
export function ownershipTransferred(event: OwnershipTransferred): void {
  log.info('Ownership transfered from previous owner: {} to new owner: {}', [
    event.params.previousOwner.toHex(),
    event.params.newOwner.toHex(),
  ])
}


// UTILITY FUNCTIONS

/*
 * get or create masterchef
 */
function getMasterChef(block: ethereum.Block): MasterChef {
  let masterChef = MasterChef.load(MASTER_CHEF_ADDRESS.toHex())

  if (masterChef === null) {
    const contract = MasterChefContract.bind(MASTER_CHEF_ADDRESS)
    masterChef = new MasterChef(MASTER_CHEF_ADDRESS.toHex())
    masterChef.bonusMultiplier = contract.BONUS_MULTIPLIER()
    // masterChef.bonusEndBlock = contract.bonusEndBlock()
    masterChef.devaddr = contract.devaddr()
    masterChef.treasuryaddr = contract.treasuryaddr()
    // masterChef.migrator = contract.migrator()
    masterChef.owner = contract.owner()
    // poolInfo ...
    masterChef.startTimestamp = contract.startTimestamp()
    masterChef.joe = contract.joe()
    masterChef.joePerSec = contract.joePerSec()
    masterChef.totalAllocPoint = contract.totalAllocPoint()
    // userInfo ...
    masterChef.poolCount = BIG_INT_ZERO

    masterChef.jlpBalance = BIG_DECIMAL_ZERO
    masterChef.jlpAge = BIG_DECIMAL_ZERO
    masterChef.jlpAgeRemoved = BIG_DECIMAL_ZERO
    masterChef.jlpDeposited = BIG_DECIMAL_ZERO
    masterChef.jlpWithdrawn = BIG_DECIMAL_ZERO

    masterChef.updatedAt = block.timestamp

    masterChef.save()
  }

  return masterChef as MasterChef
}

/*
 * get or create pool
 */
export function getPool(id: BigInt, block: ethereum.Block): Pool {
  let pool = Pool.load(id.toString())

  if (pool === null) {
    const masterChef = getMasterChef(block)

    const masterChefContract = MasterChefContract.bind(MASTER_CHEF_ADDRESS)

    // Create new pool.
    pool = new Pool(id.toString())

    // Set relation
    pool.owner = masterChef.id

    const poolInfoResult = masterChefContract.try_poolInfo(masterChef.poolCount)
    if (poolInfoResult.reverted) {
      log.info('[masterchef getPool] poolInfo reverted', [])
      return null
    }
    const poolInfo = poolInfoResult.value

    pool.pair = poolInfo.value0
    pool.allocPoint = poolInfo.value1
    pool.lastRewardTimestamp = poolInfo.value2
    pool.accJoePerShare = poolInfo.value3

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
    pool.save()
  }

  return pool as Pool
}

/*
 * get or create history
 */
function getHistory(owner: string, block: ethereum.Block): History {
  const day = block.timestamp.div(BIG_INT_ONE_DAY_SECONDS)

  const id = owner.concat(day.toString())

  let history = History.load(id)

  if (history === null) {
    history = new History(id)
    history.owner = owner
    history.jlpBalance = BIG_DECIMAL_ZERO
    history.jlpAge = BIG_DECIMAL_ZERO
    history.jlpAgeRemoved = BIG_DECIMAL_ZERO
    history.jlpDeposited = BIG_DECIMAL_ZERO
    history.jlpWithdrawn = BIG_DECIMAL_ZERO
    history.timestamp = block.timestamp
    history.block = block.number
  }

  return history as History
}

/*
 * get or create poolHistory
 */
function getPoolHistory(pool: Pool, block: ethereum.Block): PoolHistory {
  const day = block.timestamp.div(BIG_INT_ONE_DAY_SECONDS)

  const id = pool.id.concat(day.toString())

  let history = PoolHistory.load(id)

  if (history === null) {
    history = new PoolHistory(id)
    history.pool = pool.id
    history.jlpBalance = BIG_DECIMAL_ZERO
    history.jlpAge = BIG_DECIMAL_ZERO
    history.jlpAgeRemoved = BIG_DECIMAL_ZERO
    history.jlpDeposited = BIG_DECIMAL_ZERO
    history.jlpWithdrawn = BIG_DECIMAL_ZERO
    history.timestamp = block.timestamp
    history.block = block.number
    history.entryUSD = BIG_DECIMAL_ZERO
    history.exitUSD = BIG_DECIMAL_ZERO
    history.joeHarvested = BIG_DECIMAL_ZERO
    history.joeHarvestedUSD = BIG_DECIMAL_ZERO
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
    user = new User(id)
    user.pool = null
    user.address = address
    user.amount = BIG_INT_ZERO
    user.rewardDebt = BIG_INT_ZERO
    user.joeHarvested = BIG_DECIMAL_ZERO
    user.joeHarvestedUSD = BIG_DECIMAL_ZERO
    user.entryUSD = BIG_DECIMAL_ZERO
    user.exitUSD = BIG_DECIMAL_ZERO
    user.timestamp = block.timestamp
    user.block = block.number
    user.save()
  }

  return user as User
}
