import { Rounding } from '@pandaswap/sdk/dist/constants';
import { Fraction } from '@pandaswap/sdk/dist/entities/fractions/fraction';
export declare class Percent extends Fraction {
    toSignificant(significantDigits?: number, format?: object, rounding?: Rounding): string;
    toFixed(decimalPlaces?: number, format?: object, rounding?: Rounding): string;
}
