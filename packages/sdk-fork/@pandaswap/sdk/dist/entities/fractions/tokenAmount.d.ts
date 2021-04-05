import { CurrencyAmount } from '@pandaswap/sdk/dist/entities/fractions/currencyAmount';
import { Token } from '@pandaswap/sdk/dist/entities/token';
import { BigintIsh } from '@pandaswap/sdk/dist/constants';
export declare class TokenAmount extends CurrencyAmount {
    readonly token: Token;
    constructor(token: Token, amount: BigintIsh);
    add(other: TokenAmount): TokenAmount;
    subtract(other: TokenAmount): TokenAmount;
}
