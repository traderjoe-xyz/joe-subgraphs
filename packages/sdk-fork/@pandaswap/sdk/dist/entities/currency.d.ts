import { ChainId } from '@pandaswap/sdk/dist/constants';
/**
 * A currency is any fungible financial instrument on Ethereum, including Ether and all ERC20 tokens.
 *
 * The only instance of the base class `Currency` is Ether.
 */
export declare class Currency {
    readonly decimals: number;
    readonly symbol?: string;
    readonly name?: string;
    static readonly ETHER: Currency;
    static readonly BNB: Currency;
    static readonly FTM: Currency;
    static readonly MATIC: Currency;
    static readonly XDAI: Currency;
    static readonly GLMR: Currency;
    static readonly AVAX: Currency;
    static readonly HT: Currency;
    static readonly NATIVE: {
        1: Currency;
        3: Currency;
        4: Currency;
        5: Currency;
        42: Currency;
        250: Currency;
        4002: Currency;
        137: Currency;
        80001: Currency;
        100: Currency;
        56: Currency;
        97: Currency;
        79377087078960: Currency;
        1287: Currency;
        43114: Currency;
        43113: Currency;
        128: Currency;
        256: Currency;
    };
    /**
     * Constructs an instance of the base class `Currency`. The only instance of the base class `Currency` is `Currency.ETHER`.
     * @param decimals decimals of the currency
     * @param symbol symbol of the currency
     * @param name of the currency
     */
    protected constructor(decimals: number, symbol?: string, name?: string);
    static getNativeCurrency(chainId?: ChainId): Currency;
    static getNativeCurrencySymbol(chainId?: ChainId): string | undefined;
    static getNativeCurrencyName(chainId?: ChainId): string | undefined;
    getSymbol(chainId?: ChainId): string | undefined;
    getName(chainId?: ChainId): string | undefined;
}
declare const ETHER: Currency;
export { ETHER };
