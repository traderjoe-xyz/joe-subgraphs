import {
  ADDRESS_ZERO,
  BIG_DECIMAL_1E18,
  BIG_DECIMAL_1E6,
  BIG_DECIMAL_ZERO,
  BIG_INT_ZERO,
  JOE_BAR_ADDRESS,
  JOE_TOKEN_ADDRESS,
  JOE_USDT_PAIR_ADDRESS,
} from 'const'
import { Address, BigDecimal, BigInt, dataSource, ethereum, log } from '@graphprotocol/graph-ts'
import { Bar, History, User } from '../generated/schema'
import { Bar as BarContract, Transfer as TransferEvent } from '../generated/JoeBar/Bar'

import { Pair as PairContract } from '../generated/JoeBar/Pair'
import { JoeToken as JoeTokenContract } from '../generated/JoeBar/JoeToken'

// TODO: Get averages of multiple joe stablecoin pairs
function getJoePrice(): BigDecimal {
  const pair = PairContract.bind(JOE_USDT_PAIR_ADDRESS)
  const reservesResult = pair.try_getReserves()
  if (reservesResult.reverted) {
    log.info('[getAvaxRate] getReserves reverted', [])
    return BIG_DECIMAL_ZERO
  }
  const reserves = reservesResult.value
  return reserves.value1.toBigDecimal().times(BIG_DECIMAL_1E18).div(reserves.value0.toBigDecimal()).div(BIG_DECIMAL_1E6)
}

function createBar(block: ethereum.Block): Bar {
  const contract = BarContract.bind(dataSource.address())
  const bar = new Bar(dataSource.address().toHex())
  bar.decimals = contract.decimals()
  bar.name = contract.name()
  bar.joe = contract.joe()
  bar.symbol = contract.symbol()
  bar.totalSupply = BIG_DECIMAL_ZERO
  bar.joeStaked = BIG_DECIMAL_ZERO
  bar.joeStakedUSD = BIG_DECIMAL_ZERO
  bar.joeHarvested = BIG_DECIMAL_ZERO
  bar.joeHarvestedUSD = BIG_DECIMAL_ZERO
  bar.xJoeMinted = BIG_DECIMAL_ZERO
  bar.xJoeBurned = BIG_DECIMAL_ZERO
  bar.xJoeAge = BIG_DECIMAL_ZERO
  bar.xJoeAgeDestroyed = BIG_DECIMAL_ZERO
  bar.ratio = BIG_DECIMAL_ZERO
  bar.updatedAt = block.timestamp
  bar.save()

  return bar as Bar
}

function getBar(block: ethereum.Block): Bar {
  let bar = Bar.load(dataSource.address().toHex())

  if (bar === null) {
    bar = createBar(block)
  }

  return bar as Bar
}

function createUser(address: Address, block: ethereum.Block): User {
  const user = new User(address.toHex())

  // Set relation to bar
  user.bar = dataSource.address().toHex()

  user.xJoe = BIG_DECIMAL_ZERO
  user.xJoeMinted = BIG_DECIMAL_ZERO
  user.xJoeBurned = BIG_DECIMAL_ZERO

  user.joeStaked = BIG_DECIMAL_ZERO
  user.joeStakedUSD = BIG_DECIMAL_ZERO

  user.joeHarvested = BIG_DECIMAL_ZERO
  user.joeHarvestedUSD = BIG_DECIMAL_ZERO

  // In/Out
  user.xJoeOut = BIG_DECIMAL_ZERO
  user.joeOut = BIG_DECIMAL_ZERO
  user.usdOut = BIG_DECIMAL_ZERO

  user.xJoeIn = BIG_DECIMAL_ZERO
  user.joeIn = BIG_DECIMAL_ZERO
  user.usdIn = BIG_DECIMAL_ZERO

  user.xJoeAge = BIG_DECIMAL_ZERO
  user.xJoeAgeDestroyed = BIG_DECIMAL_ZERO

  user.xJoeOffset = BIG_DECIMAL_ZERO
  user.joeOffset = BIG_DECIMAL_ZERO
  user.usdOffset = BIG_DECIMAL_ZERO
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

function getHistory(block: ethereum.Block): History {
  const day = block.timestamp.toI32() / 86400

  const id = BigInt.fromI32(day).toString()

  let history = History.load(id)

  if (history === null) {
    const date = day * 86400
    history = new History(id)
    history.date = date
    history.timeframe = 'Day'
    history.joeStaked = BIG_DECIMAL_ZERO
    history.joeStakedUSD = BIG_DECIMAL_ZERO
    history.joeHarvested = BIG_DECIMAL_ZERO
    history.joeHarvestedUSD = BIG_DECIMAL_ZERO
    history.xJoeAge = BIG_DECIMAL_ZERO
    history.xJoeAgeDestroyed = BIG_DECIMAL_ZERO
    history.xJoeMinted = BIG_DECIMAL_ZERO
    history.xJoeBurned = BIG_DECIMAL_ZERO
    history.xJoeSupply = BIG_DECIMAL_ZERO
    history.ratio = BIG_DECIMAL_ZERO
  }

  return history as History
}

export function transfer(event: TransferEvent): void {
  // Convert to BigDecimal with 18 places, 1e18.
  const value = event.params.value.divDecimal(BIG_DECIMAL_1E18)

  // If value is zero, do nothing.
  if (value.equals(BIG_DECIMAL_ZERO)) {
    log.warning('Transfer zero value! Value: {} Tx: {}', [
      event.params.value.toString(),
      event.transaction.hash.toHex(),
    ])
    return
  }

  const bar = getBar(event.block)
  const barContract = BarContract.bind(JOE_BAR_ADDRESS)

  const joePrice = getJoePrice()

  bar.totalSupply = barContract.totalSupply().divDecimal(BIG_DECIMAL_1E18)
  bar.joeStaked = JoeTokenContract.bind(JOE_TOKEN_ADDRESS).balanceOf(JOE_BAR_ADDRESS).divDecimal(BIG_DECIMAL_1E18)
  bar.ratio = bar.joeStaked.div(bar.totalSupply)

  const what = value.times(bar.ratio)
  log.debug('joePrice: {}, bar.ratio: {}, what: {}', [joePrice.toString(), bar.ratio.toString(), what.toString()])

  // Minted xJoe
  if (event.params.from == ADDRESS_ZERO) {
    const user = getUser(event.params.to, event.block)

    log.info('{} minted {} xJoe in exchange for {} joe - joeStaked before {} joeStaked after {}', [
      event.params.to.toHex(),
      value.toString(),
      what.toString(),
      user.joeStaked.toString(),
      user.joeStaked.plus(what).toString(),
    ])

    if (user.xJoe == BIG_DECIMAL_ZERO) {
      log.info('{} entered the bar', [user.id])
      user.bar = bar.id
    }

    user.xJoeMinted = user.xJoeMinted.plus(value)

    const joeStakedUSD = what.times(joePrice)

    user.joeStaked = user.joeStaked.plus(what)
    user.joeStakedUSD = user.joeStakedUSD.plus(joeStakedUSD)

    const days = event.block.timestamp.minus(user.updatedAt).divDecimal(BigDecimal.fromString('86400'))

    const xJoeAge = days.times(user.xJoe)

    user.xJoeAge = user.xJoeAge.plus(xJoeAge)

    // Update last
    user.xJoe = user.xJoe.plus(value)

    user.updatedAt = event.block.timestamp

    user.save()

    const barDays = event.block.timestamp.minus(bar.updatedAt).divDecimal(BigDecimal.fromString('86400'))
    const barXJoe = bar.xJoeMinted.minus(bar.xJoeBurned)
    bar.xJoeMinted = bar.xJoeMinted.plus(value)
    bar.xJoeAge = bar.xJoeAge.plus(barDays.times(barXJoe))
    bar.joeStaked = bar.joeStaked.plus(what)
    bar.joeStakedUSD = bar.joeStakedUSD.plus(joeStakedUSD)
    bar.updatedAt = event.block.timestamp

    const history = getHistory(event.block)
    history.xJoeAge = bar.xJoeAge
    history.xJoeMinted = history.xJoeMinted.plus(value)
    history.xJoeSupply = bar.totalSupply
    history.joeStaked = history.joeStaked.plus(what)
    history.joeStakedUSD = history.joeStakedUSD.plus(joeStakedUSD)
    history.ratio = bar.ratio
    history.save()
  }

  // Burned xJoe
  if (event.params.to == ADDRESS_ZERO) {
    log.info('{} burned {} xJoe', [event.params.from.toHex(), value.toString()])

    const user = getUser(event.params.from, event.block)

    user.xJoeBurned = user.xJoeBurned.plus(value)

    user.joeHarvested = user.joeHarvested.plus(what)

    const joeHarvestedUSD = what.times(joePrice)

    user.joeHarvestedUSD = user.joeHarvestedUSD.plus(joeHarvestedUSD)

    const days = event.block.timestamp.minus(user.updatedAt).divDecimal(BigDecimal.fromString('86400'))

    const xJoeAge = days.times(user.xJoe)

    user.xJoeAge = user.xJoeAge.plus(xJoeAge)

    const xJoeAgeDestroyed = user.xJoeAge.div(user.xJoe).times(value)

    user.xJoeAgeDestroyed = user.xJoeAgeDestroyed.plus(xJoeAgeDestroyed)

    // remove xJoeAge
    user.xJoeAge = user.xJoeAge.minus(xJoeAgeDestroyed)
    // Update xJoe last
    user.xJoe = user.xJoe.minus(value)

    if (user.xJoe == BIG_DECIMAL_ZERO) {
      log.info('{} left the bar', [user.id])
      user.bar = null
    }

    user.updatedAt = event.block.timestamp

    user.save()

    const barDays = event.block.timestamp.minus(bar.updatedAt).divDecimal(BigDecimal.fromString('86400'))
    const barXJoe = bar.xJoeMinted.minus(bar.xJoeBurned)
    bar.xJoeBurned = bar.xJoeBurned.plus(value)
    bar.xJoeAge = bar.xJoeAge.plus(barDays.times(barXJoe)).minus(xJoeAgeDestroyed)
    bar.xJoeAgeDestroyed = bar.xJoeAgeDestroyed.plus(xJoeAgeDestroyed)
    bar.joeHarvested = bar.joeHarvested.plus(what)
    bar.joeHarvestedUSD = bar.joeHarvestedUSD.plus(joeHarvestedUSD)
    bar.updatedAt = event.block.timestamp

    const history = getHistory(event.block)
    history.xJoeSupply = bar.totalSupply
    history.xJoeBurned = history.xJoeBurned.plus(value)
    history.xJoeAge = bar.xJoeAge
    history.xJoeAgeDestroyed = history.xJoeAgeDestroyed.plus(xJoeAgeDestroyed)
    history.joeHarvested = history.joeHarvested.plus(what)
    history.joeHarvestedUSD = history.joeHarvestedUSD.plus(joeHarvestedUSD)
    history.ratio = bar.ratio
    history.save()
  }

  // If transfer from address to address and not known xJoe pools.
  if (event.params.from != ADDRESS_ZERO && event.params.to != ADDRESS_ZERO) {
    log.info('transfered {} xJoe from {} to {}', [value.toString(), event.params.from.toHex(), event.params.to.toHex()])

    const fromUser = getUser(event.params.from, event.block)

    const fromUserDays = event.block.timestamp.minus(fromUser.updatedAt).divDecimal(BigDecimal.fromString('86400'))

    // Recalc xJoe age first
    fromUser.xJoeAge = fromUser.xJoeAge.plus(fromUserDays.times(fromUser.xJoe))
    // Calculate xJoeAge being transfered
    const xJoeAgeTranfered = fromUser.xJoeAge.div(fromUser.xJoe).times(value)
    // Subtract from xJoeAge
    fromUser.xJoeAge = fromUser.xJoeAge.minus(xJoeAgeTranfered)
    fromUser.updatedAt = event.block.timestamp

    fromUser.xJoe = fromUser.xJoe.minus(value)
    fromUser.xJoeOut = fromUser.xJoeOut.plus(value)
    fromUser.joeOut = fromUser.joeOut.plus(what)
    fromUser.usdOut = fromUser.usdOut.plus(what.times(joePrice))

    if (fromUser.xJoe == BIG_DECIMAL_ZERO) {
      log.info('{} left the bar by transfer OUT', [fromUser.id])
      fromUser.bar = null
    }

    fromUser.save()

    const toUser = getUser(event.params.to, event.block)

    if (toUser.bar === null) {
      log.info('{} entered the bar by transfer IN', [fromUser.id])
      toUser.bar = bar.id
    }

    // Recalculate xJoe age and add incoming xJoeAgeTransfered
    const toUserDays = event.block.timestamp.minus(toUser.updatedAt).divDecimal(BigDecimal.fromString('86400'))

    toUser.xJoeAge = toUser.xJoeAge.plus(toUserDays.times(toUser.xJoe)).plus(xJoeAgeTranfered)
    toUser.updatedAt = event.block.timestamp

    toUser.xJoe = toUser.xJoe.plus(value)
    toUser.xJoeIn = toUser.xJoeIn.plus(value)
    toUser.joeIn = toUser.joeIn.plus(what)
    toUser.usdIn = toUser.usdIn.plus(what.times(joePrice))

    const difference = toUser.xJoeIn.minus(toUser.xJoeOut).minus(toUser.xJoeOffset)

    // If difference of joe in - joe out - offset > 0, then add on the difference
    // in staked joe based on xJoe:Joe ratio at time of reciept.
    if (difference.gt(BIG_DECIMAL_ZERO)) {
      const joe = toUser.joeIn.minus(toUser.joeOut).minus(toUser.joeOffset)
      const usd = toUser.usdIn.minus(toUser.usdOut).minus(toUser.usdOffset)

      log.info('{} recieved a transfer of {} xJoe from {}, joe value of transfer is {}', [
        toUser.id,
        value.toString(),
        fromUser.id,
        what.toString(),
      ])

      toUser.joeStaked = toUser.joeStaked.plus(joe)
      toUser.joeStakedUSD = toUser.joeStakedUSD.plus(usd)

      toUser.xJoeOffset = toUser.xJoeOffset.plus(difference)
      toUser.joeOffset = toUser.joeOffset.plus(joe)
      toUser.usdOffset = toUser.usdOffset.plus(usd)
    }

    toUser.save()
  }

  bar.save()
}
