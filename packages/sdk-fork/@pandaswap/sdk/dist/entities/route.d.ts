import { ChainId } from '@pandaswap/sdk/dist/constants';
import { Currency } from '@pandaswap/sdk/dist/entities/currency';
import { Token } from '@pandaswap/sdk/dist/entities/token';
import { Pair } from '@pandaswap/sdk/dist/entities/pair';
import { Price } from '@pandaswap/sdk/dist/entities/fractions/price';
export declare class Route {
    readonly pairs: Pair[];
    readonly path: Token[];
    readonly input: Currency;
    readonly output: Currency;
    readonly midPrice: Price;
    constructor(pairs: Pair[], input: Currency, output?: Currency);
    get chainId(): ChainId;
}
