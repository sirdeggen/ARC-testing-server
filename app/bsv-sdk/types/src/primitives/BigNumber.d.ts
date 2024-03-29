import ReductionContext from './ReductionContext.js';
/**
 * JavaScript numbers are only precise up to 53 bits. Since Bitcoin relies on
 * 256-bit cryptography, this BigNumber class enables operations on larger
 * numbers.
 *
 * @class BigNumber
 */
export default class BigNumber {
    /**
     * @privateinitializer
     */
    static zeros: string[];
    /**
     * @privateinitializer
     */
    static groupSizes: number[];
    /**
     * @privateinitializer
     */
    static groupBases: number[];
    /**
     * The word size of big number chunks.
     *
     * @property wordSize
     *
     * @example
     * console.log(BigNumber.wordSize);  // output: 26
     */
    static wordSize: number;
    /**
     * Negative flag. Indicates whether the big number is a negative number.
     * - If 0, the number is positive.
     * - If 1, the number is negative.
     *
     * @property negative
     *
     * @example
     * let num = new BigNumber("-10");
     * console.log(num.negative);  // output: 1
     */
    negative: number;
    /**
     * Array of numbers, where each number represents a part of the value of the big number.
     *
     * @property words
     *
     * @example
     * let num = new BigNumber(50000);
     * console.log(num.words);  // output: [ 50000 ]
     */
    words: number[];
    /**
     * Length of the words array.
     *
     * @property length
     *
     * @example
     * let num = new BigNumber(50000);
     * console.log(num.length);  // output: 1
     */
    length: number;
    /**
     * Reduction context of the big number.
     *
     * @property red
     */
    red: ReductionContext | null;
    /**
     * Checks whether a value is an instance of BigNumber. If not, then checks the features of the input to determine potential compatibility. Regular JS numbers fail this check.
     *
     * @method isBN
     * @param num - The value to be checked.
     * @returns - Returns a boolean value determining whether or not the checked num parameter is a BigNumber.
     *
     * @example
     * const validNum = new BigNumber(5);
     * BigNumber.isBN(validNum); // returns true
     *
     * const invalidNum = 5;
     * BigNumber.isBN(invalidNum); // returns false
     */
    static isBN(num: any): boolean;
    /**
     * Returns the bigger value between two BigNumbers
     *
     * @method max
     * @param left - The first BigNumber to be compared.
     * @param right - The second BigNumber to be compared.
     * @returns - Returns the bigger BigNumber between left and right.
     *
     * @example
     * const bn1 = new BigNumber(5);
     * const bn2 = new BigNumber(10);
     * BigNumber.max(bn1, bn2); // returns bn2
     */
    static max(left: BigNumber, right: BigNumber): BigNumber;
    /**
     * Returns the smaller value between two BigNumbers
     *
     * @method min
     * @param left - The first BigNumber to be compared.
     * @param right - The second BigNumber to be compared.
     * @returns - Returns the smaller value between left and right.
     *
     * @example
     * const bn1 = new BigNumber(5);
     * const bn2 = new BigNumber(10);
     * BigNumber.min(bn1, bn2); // returns bn1
     */
    static min(left: BigNumber, right: BigNumber): BigNumber;
    /**
     * @constructor
     *
     * @param number - The number (various types accepted) to construct a BigNumber from. Default is 0.
     *
     * @param base - The base of number provided. By default is 10.
     *
     * @param endian - The endianness provided. By default is 'big endian'.
     *
     * @example
     * import BigNumber from './BigNumber';
     * const bn = new BigNumber('123456', 10, 'be');
     */
    constructor(number?: number | string | number[], base?: number | 'be' | 'le' | 'hex', endian?: 'be' | 'le');
    /**
     * Asserts that a certain condition is true. If it is not, throws an error with the provided message.
     *
     * @method assert
     * @private
     * @param val - The condition to be checked.
     * @param msg - The error message to throw if the condition is not satisfied. Default is 'Assertion failed'.
     */
    private assert;
    /**
     * Function to initialize a BigNumber from a regular number. It also determines if the number is negative and sets the negative property accordingly.
     * If the endianness provided is little endian ('le'), it reverses the bytes.
     *
     * @method initNumber
     * @private
     * @param number - The number to initialize the BigNumber from.
     * @param base - The base of the number provided.
     * @param endian - The endianness ('be' for big-endian, 'le' for little-endian).
     * @returns The current BigNumber instance.
     */
    private initNumber;
    /**
     * Creates a new BigNumber from the provided number array and initializes it based on the base and endian provided.
     *
     * @method initArray
     * @private
     * @param number - The array of numbers to initialize the BigNumber from. Each number represents a part of the value of the big number.
     * @param endian - The endianness ('be' for big-endian, 'le' for little-endian).
     * @return The current BigNumber instance.
     */
    private initArray;
    /**
     * Function to extract the 4-bit number from a hexadecimal character
     *
     * @method parseHex4Bits
     * @private
     * @param string - The string containing the hexadecimal character.
     * @param index - The index of the hexadecimal character in the string.
     * @return The decimal value corresponding to the hexadecimal character.
     */
    private parseHex4Bits;
    /**
     * Function to extract the 8-bit number from two hexadecimal characters
     *
     * @method parseHexByte
     * @private
     * @param string - The string containing the hexadecimal characters.
     * @param lowerBound - The lower bound of the index to start parsing from.
     * @param index - The index of the second hexadecimal character in the string.
     * @return The decimal value corresponding to the two hexadecimal characters.
     */
    private parseHexByte;
    /**
     * Function to parse and convert a specific string portion into a big number in hexadecimal base.
     *
     * @method parseHex
     * @private
     * @param number - The string to parse.
     * @param start - The index to start parsing from.
     * @param endian - The endianness ('be', 'le').
     * @return The current BigNumber instance.
     */
    private parseHex;
    /**
     * Function to convert a particular string portion into a base word.
     *
     * @method parseBaseWord
     * @private
     * @param str - The string to parse.
     * @param start - The index to start parsing from.
     * @param end - The index to stop parsing at.
     * @param mul - The base to be used for the conversion.
     * @return The decimal value of the parsed base word.
     */
    private parseBaseWord;
    /**
     * Function to convert a string into a big number in a specific base.
     *
     * @method parseBase
     * @private
     * @param number - The string to be converted into a big number.
     * @param base - The base to be used for conversion.
     * @param start - The index to start conversion from.
     * @return The current BigNumber instance.
     */
    private parseBase;
    /**
     * The copy method creates and returns a separate identical copy of the BigNumber.
     *
     * @method copy
     * @param dest - The BigNumber instance that will be made into a copy.
     *
     * @example
     * const bn1 = new BigNumber('123456', 10, 'be');
     * const bn2 = new BigNumber();
     * bn1.cop(bn2);
     * // bn2 is now a BigNumber representing 123456
     */
    copy(dest: BigNumber): void;
    /**
     *
     * Directly transfers the attributes of the source BigNumber to the destination BigNumber.
     *
     * @method move
     * @param dest - The BigNumber that attributes will be moved into.
     * @param src - The BigNumber that attributes will be moved from.
     *
     * @example
     * const src = new BigNumber('123456', 10, 'be');
     * const dest = new BigNumber();
     * BigNumber.move(dest, src);
     * // dest is now a BigNumber representing 123456
     */
    static move(dest: BigNumber, src: BigNumber): void;
    /**
     * Creates a copy of the current BigNumber instance.
     *
     * @method clone
     * @returns A new BigNumber instance, identical to the original.
     *
     * @example
     * const bn = new BigNumber('123456', 10, 'be');
     * const bnClone = bn.clone();
     */
    clone(): BigNumber;
    /**
     * Increases the BigNumber length up to a certain size and initializes new elements with 0.
     *
     * @method expand
     * @param size - The desired size to grow the BigNumber length.
     * @returns The BigNumber instance after expansion.
     *
     * @example
     * const bn = new BigNumber('123456', 10, 'be');
     * bn.expand(10);
     */
    expand(size: any): BigNumber;
    /**
     * Removes leading zeros.
     *
     * @method strip
     * @returns - Returns the BigNumber after stripping leading zeros.
     *
     * @example
     * const bn = new BigNumber('000000", 2, "be");
     * bn.strip();
     * // bn now represents 0
     */
    strip(): BigNumber;
    /**
     * Normalizes the sign of the BigNumber. Changes -0 to 0.
     *
     * @method normSign
     * @returns The normalized BigNumber instance.
     *
     * @example
     * const bn = new BigNumber('-0', 10, 'be');
     * bn.normSign();
     */
    normSign(): BigNumber;
    /**
     * Utility for inspecting the current BigNumber instance. Accompanied with a prefix '<BN: ' or '<BN-R: '.
     *
     * @method inspect
     * @returns A string representation to inspect the BigNumber instance.
     *
     * @example
     * const bn = new BigNumber('123456', 10, 'be');
     * bn.inspect();
     */
    inspect(): string;
    /**
     * Converts the BigNumber instance to a string representation.
     *
     * @method toString
     * @param base - The base for representing number. Default is 10. Other accepted values are 16 and 'hex'.
     * @param padding - Represents the minimum number of digits to represent the BigNumber as a string. Default is 1.
     * @throws If base is not between 2 and 36.
     * @returns The string representation of the BigNumber instance
     *
     * @example
     * const bn = new BigNumber('123456', 10, 'be');
     * bn.toString(16); // Converts the BigNumber to a hexadecimal string.
     */
    toString(base?: number | 'hex', padding?: number): string;
    /**
     * Converts the BigNumber instance to a JavaScript number.
     * Please note that JavaScript numbers are only precise up to 53 bits.
     *
     * @method toNumber
     * @throws If the BigNumber instance cannot be safely stored in a JavaScript number
     * @returns The JavaScript number representation of the BigNumber instance.
     *
     * @example
     * const bn = new BigNumber('123456', 10, 'be');
     * bn.toNumber();
     */
    toNumber(): number;
    /**
     * Converts the BigNumber instance to a JSON-formatted string.
     *
     * @method toJSON
     * @returns The JSON string representation of the BigNumber instance.
     *
     * @example
     * const bn = new BigNumber('123456', 10, 'be');
     * bn.toJSON();
     */
    toJSON(): string;
    /**
     * An internal method to format the BigNumber instance into ArrayTypes of Little Endian Type.
     * This is a private method.
     *
     * @method toArrayLikeLE
     * @private
     * @param res - The resultant ArrayType instance
     * @param byteLength - The byte length to define the size of ArrayType
     */
    private toArrayLikeLE;
    /**
     * An internal method to format the BigNumber instance into ArrayTypes of Big Endian Type.
     * This is a private method.
     *
     * @method toArrayLikeBE
     * @private
     * @param res - The resultant ArrayType instance
     * @param byteLength - The byte length to define the size of ArrayType
     */
    private toArrayLikeBE;
    /**
     * Converts the BigNumber instance to a JavaScript number array.
     *
     * @method toArray
     * @param endian - The endian for converting BigNumber to array. Default value is 'be'.
     * @param length - The length for the resultant array. Default value is undefined.
     * @returns The JavaScript array representation of the BigNumber instance.
     *
     * @example
     * const bn = new BigNumber('123456', 10, 'be');
     * bn.toArray('be', 8);
     */
    toArray(endian?: 'le' | 'be', length?: number): number[];
    /**
     * A utility method to count the word bits.
     * This is a private method.
     *
     * @method countWordBits
     * @private
     * @param w - The input number to count the word bits.
     * @returns The number of word bits
     */
    private countWordBits;
    /**
     * A utility method to compute the number of zero bits.
     * This is a private method.
     *
     * @method zeroWordBits
     * @private
     * @param w - The input number to count the zero bits.
     * @returns The number of zero bits
     */
    private zeroWordBits;
    /**
     * Returns the number of used bits in this big number.
     *
     * @method bitLength
     * @returns The number of used bits
     */
    bitLength(): number;
    /**
     * Convert a big number to a boolean array representing
     * a binary number, where each array index is a bit.
     * @static
     * @method toBitArray
     * @param num - The big number to convert.
     * @returns Returns an array of booleans representing
     * a binary number, with each array index being a bit.
     * @example
     * const BigNumber = require("./BigNumber");
     * const bn = new BigNumber('6'); // binary: 110
     * const bits = BigNumber.toBitArray(bn); // [1,1,0]
     */
    static toBitArray(num: BigNumber): Array<0 | 1>;
    /**
     * Convert this big number to a boolean array representing
     * a binary number, where each array index is a bit.
     * @method toBitArray
     * @returns Returns an array of booleans representing a binary number.
     *
     * @example
     * const BigNumber = require("./BigNumber");
     * const bn = new BigNumber('6'); // binary: 110
     * const bits = bn.toBitArray(); // [ 1, 1, 0 ]
     */
    toBitArray(): Array<0 | 1>;
    /**
     * Returns the number of trailing zero bits in the big number.
     * @method zeroBits
     * @returns Returns the number of trailing zero bits
     * in the binary representation of the big number.
     * @example
     * const BigNumber = require("./BigNumber");
     * const bn = new BigNumber('8'); // binary: 1000
     * const zeroBits = bn.zeroBits(); // 3
     */
    zeroBits(): number;
    /**
     * Get the byte length of the BigNumber
     *
     * @method byteLength
     * @returns Returns the byte length of the big number.
     * @example
     * const BigNumber = require("./BigNumber");
     * const bn = new BigNumber('1234');
     * const byteLen = bn.byteLength();
     */
    byteLength(): number;
    /**
     * Converts this big number to two's complement with a specified bit width.
     * @method toTwos
     * @param width - The bit width.
     * @returns Returns the two's complement of the big number.
     *
     * @example
     * const BigNumber = require("./BigNumber");
     * const bn = new BigNumber('-1234');
     * const twosComp = bn.toTwos(16);
     */
    toTwos(width: number): BigNumber;
    /**
     * Converts this big number from two's complement with a specified bit width.
     * @method fromTwos
     * @param width - The bit width.
     * @returns Returns the big number converted from two's complement.
     *
     * @example
     * const BigNumber = require("./BigNumber");
     * const bn = new BigNumber('-1234');
     * const fromTwos = bn.fromTwos(16);
     */
    fromTwos(width: number): BigNumber;
    /**
     * Checks if the big number is negative.
     * @method isNeg
     * @returns Returns true if the big number is negative, otherwise false.
     *
     * @example
     * const BigNumber = require("./BigNumber");
     * const bn = new BigNumber('-1234');
     * const isNegative = bn.isNeg(); // true
     */
    isNeg(): boolean;
    /**
     * Negates the big number and returns a new instance.
     * @method neg
     * @returns Returns a new BigNumber that is the negation of this big number.
     *
     * @example
     * const BigNumber = require("./BigNumber");
     * const bn = new BigNumber('1234');
     * const neg = bn.neg(); // -1234
     */
    neg(): BigNumber;
    /**
     * Negates the big number in-place.
     * @method ineg
     * @returns Returns this big number as the negation of itself.
     *
     * @example
     * const BigNumber = require("./BigNumber");
     * const bn = new BigNumber('1234');
     * bn.ineg(); // bn is now -1234
     */
    ineg(): BigNumber;
    /**
     * Performs a bitwise OR operation with another BigNumber and stores
     * the result in this BigNumber.
     * @method iuor
     * @param num - The other BigNumber.
     * @returns Returns this BigNumber after performing the bitwise OR operation.
     *
     * @example
     * const BigNumber = require("./BigNumber");
     * const bn1 = new BigNumber('10'); // binary: 1010
     * const bn2 = new(num: BigNumber): BigNumber BigNumber('6'); // binary: 0110
     * bn1.iuor(bn2); // now, bn1 binary: 1110
     */
    iuor(num: BigNumber): BigNumber;
    /**
     * Performs a bitwise OR operation with another BigNumber, considering
     * that neither of the numbers can be negative. Stores the result in this BigNumber.
     * @method ior
     * @param num - The other BigNumber.
     * @returns Returns this BigNumber after performing the bitwise OR operation.
     *
     * @example
     * const BigNumber = require("./BigNumber");
     * const bn1 = new BigNumber('10'); // binary: 1010
     * const bn2 = new BigNumber('6'); // binary: 0110
     * bn1.ior(bn2); // now, bn1 binary: 1110
     */
    ior(num: BigNumber): BigNumber;
    /**
     * Performs a bitwise OR operation on the current instance and given
     * BigNumber and returns a new BigNumber, in such a way that if either
     * the corresponding bit in the first operand or the second operand is
     * 1, then the output is also 1.
     *
     * @method or
     * @param num - The BigNumber to perform the bitwise OR operation with.
     * @returns Returns a new BigNumber resulting from the bitwise OR operation.
     *
     * @example
     * const num1 = new BigNumber('10');
     * const num2 = new BigNumber('20');
     * console.log(num1.or(num2).toString());
     */
    or(num: BigNumber): BigNumber;
    /**
     * Performs a bitwise OR operation on the current instance and given
     * BigNumber without considering signed bit(no negative values) and returns a new BigNumber,
     * similar to the `or` method.
     *
     * @method uor
     * @param num - The BigNumber to perform the bitwise OR operation with.
     * @returns Returns a new BigNumber resulting from the bitwise OR operation without sign consideration.
     *
     * @example
     * const num1 = new BigNumber('10');
     * const num2 = new BigNumber('20');
     * console.log(num1.uor(num2).toString());
     */
    uor(num: BigNumber): BigNumber;
    /**
     * Performs a bitwise AND operation in-place(this method changes the calling object)
     * on the current instance and given BigNumber such that it modifies the current
     * instance and keeps the bits set in the result only if the corresponding bit is set
     * in both operands.
     *
     * @method iuand
     * @param num - The BigNumber to perform the bitwise AND operation with.
     * @returns Returns the current BigNumber instance after performing the bitwise AND operation.
     *
     * @example
     * const num1 = new BigNumber('10');
     * const num2 = new BigNumber('20');
     * console.log(num1.iuand(num2).toString());
     */
    iuand(num: BigNumber): BigNumber;
    /**
     * Performs an in-place operation that does a bitwise AND operation in-place,
     * on the current instance and given BigNumber such that it modifies the current
     * instance only if neither operand is negative. This method is similar to the iuand method but
     * checks for negative values before operation.
     *
     * @method iand
     * @param num - The BigNumber to perform the bitwise AND operation with.
     * @returns Returns the current BigNumber instance after performing the bitwise AND operation.
     *
     * @example
     * const num1 = new BigNumber('10');
     * const num2 = new BigNumber('20');
     * console.log(num1.iand(num2).toString());
     */
    iand(num: BigNumber): BigNumber;
    /**
     * Performs a bitwise AND operation that returns a new BigNumber, and keeps the bits
     * set in the result only if the corresponding bit is set in both operands.
     *
     * @method and
     * @param num - The BigNumber to perform the bitwise AND operation with.
     * @returns Returns new BigNumber resulting from the bitwise AND operation.
     *
     * @example
     * const num1 = new BigNumber('10');
     * const num2 = new BigNumber('20');
     * console.log(num1.and(num2).toString());
     */
    and(num: BigNumber): BigNumber;
    /**
     * Performs a bitwise AND operation without considering signed bit
     * (no negative values) which returns a new BigNumber, similar to the `and` method.
     *
     * @method uand
     * @param num - The BigNumber to perform the bitwise AND operation with.
     * @returns Returns new BigNumber resulting from the bitwise AND operation without sign consideration.
     *
     * @example
     * const num1 = new BigNumber('10');
     * const num2 = new BigNumber('20');
     * console.log(num1.uand(num2).toString());
     */
    uand(num: BigNumber): BigNumber;
    /**
     * Modifies the current instance by performing a bitwise XOR operation
     * in-place with the provided BigNumber. It keeps the bits set in the result only if the
     * corresponding bits in the operands are different.
     *
     * @method iuxor
     * @param num - The BigNumber to perform the bitwise XOR operation with.
     * @returns Returns the current BigNumber instance after performing the bitwise XOR operation.
     *
     * @example
     * const num1 = new BigNumber('10');
     * const num2 = new BigNumber('20');
     * console.log(num1.iuxor(num2).toString());
     */
    iuxor(num: BigNumber): BigNumber;
    /**
     * Performs an in-place operation that does a bitwise XOR operation in-place,
     * on the current instance and given BigNumber such that it modifies the current
     * instance only if neither operand is negative. This method is similar to the iuxor method but
     * checks for negative values before operation.
     *
     * @method ixor
     * @param num - The BigNumber to perform the bitwise XOR operation with.
     * @returns Returns the current BigNumber instance after performing the bitwise XOR operation.
     *
     * @example
     * const num1 = new BigNumber('10');
     * const num2 = new BigNumber('20');
     * console.log(num1.ixor(num2).toString());
     */
    ixor(num: BigNumber): BigNumber;
    /**
     * Performs a bitwise XOR operation which returns a new BigNumber, and keeps the bits
     * set in the result only if the corresponding bits in the operands are different.
     *
     * @method xor
     * @param num - The BigNumber to perform the bitwise XOR operation with.
     * @returns Returns a new BigNumber resulting from the bitwise XOR operation.
     *
     * @example
     * const num1 = new BigNumber('10');
     * const num2 = new BigNumber('20');
     * console.log(num1.xor(num2).toString());
     */
    xor(num: BigNumber): BigNumber;
    /**
     * Performs an unsigned XOR operation on this BigNumber with the supplied BigNumber. Returns a new BigNumber.
     *
     * @method uxor
     * @param num - The BigNumber with which the unsigned bitwise XOR operation is to be performed.
     * @returns Returns a new BigNumber resulting from the unsigned bitwise XOR operation.
     *
     * @example
     * const num1 = new BigNumber('30');
     * const num2 = new BigNumber('40');
     * console.log(num1.uxor(num2).toString()); // Output will be the result of unsigned XOR operation
     */
    uxor(num: BigNumber): BigNumber;
    /**
     * In-place method that performs a bitwise NOT operation on a BigNumber up to a specified bit width.
     *
     * @method inotn
     * @param width - The number of bits to perform the NOT operation on.
     * @returns Returns the BigNumber after performing the bitwise NOT operation.
     *
     * @example
     * const num = new BigNumber('42');
     * num.inotn(10);
     * console.log(num.toString());
     */
    inotn(width: number): BigNumber;
    /**
     * Performs a bitwise NOT operation on a BigNumber up to a specified bit width. Returns a new BigNumber.
     *
     * @method notn
     * @param width - The number of bits to perform the NOT operation on.
     * @returns Returns a new BigNumber resulting from the bitwise NOT operation.
     *
     * @example
     * const num = new BigNumber('42');
     * const notnResult = num.notn(10);
     * console.log(notnResult.toString());
     */
    notn(width: number): BigNumber;
    /**
     * Set `bit` of `this` BigNumber. The `bit` is a position in the binary representation,
     * and `val` is the value to be set at that position (`0` or `1`).
     *
     * @method setn
     * @param bit - The bit position to set.
     * @param val - The value to set at the bit position.
     * @returns Returns the BigNumber after setting the value at the bit position.
     *
     * @example
     * const num = new BigNumber('42');
     * num.setn(2, 1);
     * console.log(num.toString());
     */
    setn(bit: number, val: 0 | 1 | true | false): BigNumber;
    /**
     * Add `num` to `this` BigNumber in-place.
     *
     * @method iadd
     * @param num - The BigNumber to add to `this` BigNumber.
     * @returns Returns the BigNumber after performing the addition.
     *
     * @example
     * const num1 = new BigNumber('10');
     * num1.iadd(new BigNumber('20'));
     * console.log(num1.toString());
     */
    iadd(num: BigNumber): BigNumber;
    /**
     * Add `num` to `this` BigNumber.
     *
     * @method add
     * @param num - The BigNumber to add to `this` BigNumber.
     * @returns Returns a new BigNumber which is the result of the addition.
     *
     * @example
     * const num1 = new BigNumber('10');
     * const addResult = num1.add(new BigNumber('20'));
     * console.log(addResult.toString());
     */
    add(num: BigNumber): BigNumber;
    /**
     * Subtract `num` from `this` BigNumber in-place.
     *
     * @method isub
     * @param num - The BigNumber to be subtracted from `this` BigNumber.
     * @returns Returns the BigNumber after performing the subtraction.
     *
     * @example
     * const num1 = new BigNumber('20');
     * num1.isub(new BigNumber('10'));
     * console.log(num1.toString());
     */
    isub(num: BigNumber): BigNumber;
    /**
     * Subtract `num` from `this` BigNumber.
     *
     * @method sub
     * @param num - The BigNumber to be subtracted from `this` BigNumber.
     * @returns Returns a new BigNumber which is the result of the subtraction.
     *
     * @example
     * const num1 = new BigNumber('20');
     * const subResult = num1.sub(new BigNumber('10'));
     * console.log(subResult.toString());
     */
    sub(num: BigNumber): BigNumber;
    private smallMulTo;
    comb10MulTo(self: BigNumber, num: BigNumber, out: BigNumber): BigNumber;
    private bigMulTo;
    /**
     * Performs multiplication between the BigNumber instance and a given BigNumber.
     * It chooses the multiplication method based on the lengths of the numbers to optimize execution time.
     *
     * @method mulTo
     * @param num - The BigNumber multiply with.
     * @param out - The BigNumber where to store the result.
     * @returns The BigNumber resulting from the multiplication operation.
     *
     * @example
     * const bn1 = new BigNumber('12345');
     * const bn2 = new BigNumber('23456');
     * const output = new BigNumber();
     * bn1.mulTo(bn2, output);
     */
    mulTo(num: BigNumber, out: BigNumber): BigNumber;
    /**
     * Performs multiplication between the BigNumber instance and a given BigNumber.
     * It creates a new BigNumber to store the result.
     *
     * @method mul
     * @param num - The BigNumber to multiply with.
     * @returns The BigNumber resulting from the multiplication operation.
     *
     * @example
     * const bn1 = new BigNumber('12345');
     * const bn2 = new BigNumber('23456');
     * const result = bn1.mul(bn2);
     */
    mul(num: BigNumber): BigNumber;
    /**
     * Performs an in-place multiplication of the BigNumber instance by a given BigNumber.
     *
     * @method imul
     * @param num - The BigNumber to multiply with.
     * @returns The BigNumber itself after the multiplication.
     *
     * @example
     * const bn1 = new BigNumber('12345');
     * const bn2 = new BigNumber('23456');
     * bn1.imul(bn2);
     */
    imul(num: BigNumber): BigNumber;
    /**
     * Performs an in-place multiplication of the BigNumber instance by a number.
     * This method asserts the input to be a number less than 0x4000000 to prevent overflowing.
     * If negavtive number is provided, the resulting BigNumber will be inversely negative.
     *
     * @method imuln
     * @param num - The number to multiply with.
     * @returns The BigNumber itself after the multiplication.
     *
     * @example
     * const bn = new BigNumber('12345');
     * bn.imuln(23456);
     */
    imuln(num: number): BigNumber;
    /**
     * Performs multiplication between the BigNumber instance and a number.
     * It performs the multiplication operation in-place to a cloned BigNumber.
     *
     * @method muln
     * @param num - The number to multiply with.
     * @returns The resulting BigNumber from the multiplication operation.
     *
     * @example
     * const bn = new BigNumber('12345');
     * const result = bn.muln(23456);
     */
    muln(num: number): BigNumber;
    /**
     * Squares the BigNumber instance.
     *
     * @method sqr
     * @returns The BigNumber squared.
     *
     * @example
     * const bn = new BigNumber('12345');
     * const result = bn.sqr();
     */
    sqr(): BigNumber;
    /**
     * Performs in-place multiplication of the BigNumber instance by itself.
     *
     * @method isqr
     * @returns The result of multiplying the BigNumber instance by itself.
     *
     * @example
     * let myNumber = new BigNumber(4);
     * myNumber.isqr(); // Returns BigNumber of value 16
     */
    isqr(): BigNumber;
    /**
     * Raises the BigNumber instance to the power of the specified BigNumber.
     *
     * @method pow
     * @param num - The exponent to raise the BigNumber instance to.
     * @returns The result of raising the BigNumber instance to the power of num.
     *
     * @example
     * let base = new BigNumber(2);
     * let exponent = new BigNumber(3);
     * base.pow(exponent); // Returns BigNumber of value 8
     */
    pow(num: BigNumber): BigNumber;
    /**
     * Performs in-place bitwise left shift operation on the BigNumber instance.
     *
     * @method iushln
     * @param bits - The number of positions to shift.
     * @returns The BigNumber instance after performing the shift operation.
     *
     * @example
     * let myNumber = new BigNumber(4);
     * myNumber.iushln(2); // Returns BigNumber of value 16
     */
    iushln(bits: number): BigNumber;
    /**
     * Performs an in-place left shift operation on the BigNumber instance only if it is non-negative.
     *
     * @method ishln
     * @param bits - The number of positions to shift.
     * @returns The BigNumber instance after performing the shift operation.
     *
     * @example
     * let myNumber = new BigNumber(4);
     * myNumber.ishln(2); // Returns BigNumber of value 16
     */
    ishln(bits: number): BigNumber;
    /**
     * Performs an in-place unsigned bitwise right shift operation on the BigNumber instance.
     *
     * @method iushrn
     * @param bits - The number of positions to shift.
     * @param hint - Lowest bit before trailing zeroes.
     * @param extended - To be filled with the bits that are shifted out.
     * @returns The BigNumber instance after performing the shift operation.
     *
     * @example
     * let myNumber = new BigNumber(16);
     * myNumber.iushrn(2); // Returns BigNumber of value 4
     */
    iushrn(bits: number, hint?: number, extended?: BigNumber): BigNumber;
    /**
     * Performs an in-place right shift operation on the BigNumber instance only if it is non-negative.
     *
     * @method ishrn
     * @param bits - The number of positions to shift.
     * @param hint - Lowest bit before trailing zeroes.
     * @param extended - To be filled with the bits that are shifted out.
     * @returns The BigNumber instance after performing the shift operation.
     *
     * @example
     * let myNumber = new BigNumber(16);
     * myNumber.ishrn(2); // Returns BigNumber of value 4
     */
    ishrn(bits: any, hint?: any, extended?: any): BigNumber;
    /**
     * Performs a bitwise left shift operation on a clone of the BigNumber instance.
     *
     * @method shln
     * @param bits - The number of positions to shift.
     * @returns A new BigNumber, which is the result of the shift operation.
     *
     * @example
     * let myNumber = new BigNumber(4);
     * let shiftedNumber = myNumber.shln(2);
     * console.log(shiftedNumber.toString()); // Outputs "16"
     */
    shln(bits: any): BigNumber;
    /**
     * Performs an unsigned bitwise shift left operation on a clone of the BigNumber instance.
     *
     * @method ushln
     * @param bits - The number of bits to shift.
     * @returns A new BigNumber resulting from the shift operation.
     *
     * @example
     * let myNumber = new BigNumber(4);
     * let shiftedNumber = myNumber.ushln(2);
     * console.log(shiftedNumber.toString()); // Outputs "16"
     */
    ushln(bits: any): BigNumber;
    /**
     * Performs a bitwise right shift operation on a clone of the BigNumber instance.
     *
     * @method shrn
     * @param bits - The number of bits to shift.
     * @returns A new BigNumber resulting from the shift operation.
     *
     * @example
     * let myNumber = new BigNumber(16);
     * let shiftedNumber = myNumber.shrn(3);
     * console.log(shiftedNumber.toString()); // Outputs "2"
     */
    shrn(bits: any): BigNumber;
    /**
     * Performs an unsigned bitwise shift right operation on a clone of the BigNumber instance.
     *
     * @method ushrn
     * @param bits - The number of bits to shift.
     * @returns A new BigNumber resulting from the shift operation.
     *
     * @example
     * let myNumber = new BigNumber(20);
     * let shiftedNumber = myNumber.ushrn(2);
     * console.log(shiftedNumber.toString()); // Outputs "5"
     */
    ushrn(bits: any): BigNumber;
    /**
     * Tests if the nth bit of the BigNumber is set.
     *
     * @method testn
     * @param bit - The position of the bit to test.
     * @returns A boolean indicating whether the nth bit is set.
     *
     * @example
     * let myNumber = new BigNumber(10); // 1010 in binary
     * myNumber.testn(1); // Returns true (indicating that the second bit from right is set)
     */
    testn(bit: number): boolean;
    /**
     * Performs an in-place operation to keep only the lower bits of the number.
     * @method imaskn
     * @param bits - The number of lower bits to keep.
     * @returns Returns the BigNumber with only the specified lower bits.
     * @throws Will throw an error if bits is not a positive number.
     * @throws Will throw an error if initial BigNumber is negative as imaskn only works with positive numbers.
     * @example
     * const myNumber = new BigNumber(52);
     * myNumber.imaskn(2); // myNumber becomes 0 because lower 2 bits of 52 (110100) are 00.
     */
    imaskn(bits: any): BigNumber;
    /**
     * Returns a new BigNumber that keeps only the lower bits of the original number.
     * @method maskn
     * @param bits - The number of lower bits to keep.
     * @returns Returns a new BigNumber with only the specified lower bits of the original number.
     * @example
     * const myNumber = new BigNumber(52);
     * const newNumber = myNumber.maskn(2); // newNumber becomes 0, myNumber doesn't change.
     */
    maskn(bits: any): BigNumber;
    /**
     * Performs an in-place addition of a plain number to the BigNumber.
     * @method iaddn
     * @param num - The plain number to add.
     * @returns Returns the BigNumber after the addition.
     * @throws Will throw an error if num is not a number or is larger than 0x4000000.
     * @example
     * const myNumber = new BigNumber(50);
     * myNumber.iaddn(2); // myNumber becomes 52.
     */
    iaddn(num: number): BigNumber;
    /**
     * A helper method for in-place addition, used when there are no sign changes or size checks needed.
     * @private
     * @method _iaddn
     * @param num - The plain number to add.
     * @returns Returns the BigNumber after the addition.
     */
    _iaddn(num: number): BigNumber;
    /**
     * Performs an in-place subtraction of a plain number from the BigNumber.
     * @method isubn
     * @param num - The plain number to subtract.
     * @returns Returns the BigNumber after the subtraction.
     * @throws Will throw an error if num is not a number or is larger than 0x4000000.
     * @example
     * const myNumber = new BigNumber(52);
     * myNumber.isubn(2); // myNumber becomes 50.
     */
    isubn(num: number): BigNumber;
    /**
     * Returns a new BigNumber that is the result of adding a plain number to the original BigNumber.
     * @method addn
     * @param num - The plain number to add.
     * @returns Returns a new BigNumber which is the sum of the original BigNumber and the plain number.
     * @example
     * const myNumber = new BigNumber(50);
     * const newNumber = myNumber.addn(2); // newNumber becomes 52, myNumber doesn't change.
     */
    addn(num: number): BigNumber;
    /**
     * Returns a new BigNumber that is the result of subtracting a plain number from the original BigNumber.
     * @method subn
     * @param num - The plain number to subtract.
     * @returns Returns a new BigNumber which is the difference of the original BigNumber and the plain number.
     * @example
     * const myNumber = new BigNumber(52);
     * const newNumber = myNumber.subn(2);  // newNumber becomes 50, myNumber doesn't change.
     */
    subn(num: number): BigNumber;
    /**
     * Performs an in-place operation to make the BigNumber an absolute value.
     * @method iabs
     * @returns Returns the BigNumber as an absolute value.
     * @example
     * const myNumber = new BigNumber(-50);
     * myNumber.iabs(); // myNumber becomes 50.
     */
    iabs(): BigNumber;
    /**
     * Obtains the absolute value of a BigNumber instance.
     * This operation does not affect the actual object but instead returns a new instance of BigNumber.
     *
     * @method abs
     * @returns a new BigNumber instance with the absolute value of the current instance.
     *
     * @example
     * let negativeNumber = new BigNumber(-10);
     * let absolute = negativeNumber.abs();
     * console.log(absolute.toString()); // Outputs: "10"
     */
    abs(): BigNumber;
    /**
     * Perform an in-place shift left, subtract, and multiply operation on a BigNumber instance.
     * This method modifies the existing BigNumber instance.
     *
     * @method _ishlnsubmul
     * @param num - The BigNumber to be operated on.
     * @param mul - The multiplication factor.
     * @param shift - The number of places to shift left.
     * @returns the updated BigNumber instance after performing the in-place shift, subtract, and multiply operations.
     *
     * @example
     * let number = new BigNumber(10);
     * number._ishlnsubmul(new BigNumber(2), 3, 1);
     * console.log(number.toString()); // Outputs result after performing operations
     */
    _ishlnsubmul(num: BigNumber, mul: any, shift: number): BigNumber;
    /**
     * Performs a division on a BigNumber instance word-wise.
     *
     * This is a private method and should not be directly accessed.
     *
     * @method wordDiv
     * @private
     * @param num - The BigNumber to divide by.
     * @param mode - Specifies the operation mode as 'mod' for modulus or 'div' for division.
     * @returns Object with division (div) and modulo (mod) results, subject to the 'mode' specified.
     */
    private wordDiv;
    /**
     * Performs division and/or modulus operation on a BigNumber instance depending on the 'mode' parameter.
     * If the mode parameter is not provided, both division and modulus results are returned.
     *
     * @method divmod
     * @param num - The BigNumber to divide by.
     * @param mode - Specifies operation as 'mod' for modulus, 'div' for division, or both if not specified.
     * @param positive - Specifies if unsigned modulus is requested.
     * @returns Object with properties for division (div) and modulo (mod) results.
     *
     * @example
     * let number = new BigNumber(10);
     * let result = number.divmod(new BigNumber(3));
     * console.log(result.div.toString()); // Outputs: "3"
     * console.log(result.mod.toString()); // Outputs: "1"
     */
    divmod(num: BigNumber, mode?: 'div' | 'mod', positive?: boolean): any;
    /**
     * Divides a BigNumber instance by another BigNumber and returns result. This does not modify the actual object.
     *
     * @method div
     * @param num - The BigNumber to divide by.
     * @returns A new BigNumber instance of the division result.
     *
     * @example
     * let number = new BigNumber(10);
     * let result = number.div(new BigNumber(2));
     * console.log(result.toString()); // Outputs: "5"
     */
    div(num: BigNumber): BigNumber;
    /**
     * Returns the remainder after division of one `BigNumber` by another `BigNumber`.
     *
     * @method mod
     * @param num - The divisor `BigNumber`.
     * @returns The remainder `BigNumber` after division.
     *
     * @example
     * const bigNum1 = new BigNumber('100');
     * const bigNum2 = new BigNumber('45');
     * const remainder = bigNum1.mod(bigNum2); // remainder here would be '10'
     */
    mod(num: BigNumber): BigNumber;
    /**
     * Returns the remainder after unsigned division of one `BigNumber` by another `BigNumber`.
     *
     * @method umod
     * @param num - The divisor `BigNumber`.
     * @returns The remainder `BigNumber` after unsigned division.
     * Note: Here 'unsigned division' means that signs of the numbers are ignored.
     *
     * @example
     * const bigNum1 = new BigNumber('-100');
     * const bigNum2 = new BigNumber('45');
     * const remainder = bigNum1.umod(bigNum2); // remainder here would be '10' as signs are ignored.
     */
    umod(num: BigNumber): BigNumber;
    /**
     * Returns the rounded quotient after division of one `BigNumber` by another `BigNumber`.
     *
     * @method divRound
     * @param num - The divisor `BigNumber`.
     * @returns The rounded quotient `BigNumber` after division.
     *
     * @example
     * const bigNum1 = new BigNumber('100');
     * const bigNum2 = new BigNumber('45');
     * const quotient = bigNum1.divRound(bigNum2); // quotient here would be '2'
     */
    divRound(num: BigNumber): BigNumber;
    /**
     * Returns the remainder after division of a `BigNumber` by a primitive number.
     *
     * @method modrn
     * @param num - The divisor primitive number.
     * @returns The remainder number after division.
     *
     * @example
     * const bigNum = new BigNumber('100');
     * const num = 45;
     * const remainder = bigNum.modrn(num); // remainder here would be '10'
     */
    modrn(num: number): number;
    /**
     * Performs an in-place division of a `BigNumber` by a primitive number.
     *
     * @method idivn
     * @param num - The divisor primitive number.
     * @returns The `BigNumber` itself after being divided.
     * Note: 'in-place' means that this operation modifies the original `BigNumber`.
     *
     * @example
     * const bigNum = new BigNumber('100');
     * const num = 45;
     * bigNum.idivn(num); // the bigNum here directly becomes '2'
     */
    idivn(num: number): BigNumber;
    /**
     * Returns the quotient `BigNumber` after division of one `BigNumber` by a primitive number.
     *
     * @method divn
     * @param num - The divisor primitive number.
     * @returns A new quotient `BigNumber` after division.
     *
     * @example
     * const bigNum = new BigNumber('100');
     * const num = 45;
     * const quotient = bigNum.divn(num); // quotient here would be '2'
     */
    divn(num: number): BigNumber;
    /**
     * Computes the Extended Euclidean Algorithm for this BigNumber and provided BigNumber `p`.
     * The Extended Euclidean Algorithm is a method to find the GCD (Greatest Common Divisor) and the multiplicative inverse in a modulus field.
     *
     * @method egcd
     * @param p - The `BigNumber` with which the Extended Euclidean Algorithm will be computed.
     * @returns An object `{a: BigNumber, b: BigNumber, gcd: BigNumber}` where `gcd` is the GCD of the numbers, `a` is the coefficient of `this`, and `b` is the coefficient of `p` in Bézout's identity.
     *
     * @example
     * const bigNum1 = new BigNumber('100');
     * const bigNum2 = new BigNumber('45');
     * const result = bigNum1.egcd(bigNum2);
     */
    egcd(p: BigNumber): {
        a: BigNumber;
        b: BigNumber;
        gcd: BigNumber;
    };
    /**
     * Compute the multiplicative inverse of the current BigNumber in the modulus field specified by `p`.
     * The multiplicative inverse is a number which when multiplied with the current BigNumber gives '1' in the modulus field.
     *
     * @method _invmp
     * @param p - The `BigNumber` specifying the modulus field.
     * @returns The multiplicative inverse `BigNumber` in the modulus field specified by `p`.
     *
     * @example
     * const bigNum = new BigNumber('45');
     * const p = new BigNumber('100');
     * const inverse = bigNum._invmp(p); // inverse here would be a BigNumber such that (inverse*bigNum) % p = '1'
     */
    _invmp(p: BigNumber): BigNumber;
    /**
     * Computes and returns the greatest common divisor (GCD) of this BigNumber and the provided BigNumber.
     *
     * @method gcd
     * @param num - The BigNumber with which to compute the GCD.
     * @returns The GCD of this BigNumber and the provided BigNumber.
     *
     * @example
     * let a = new BigNumber(48);
     * let b = new BigNumber(18);
     * let gcd = a.gcd(b);
     */
    gcd(num: BigNumber): BigNumber;
    /**
     * Computes and returns the modular multiplicative inverse of this BigNumber in the field defined by the provided BigNumber.
     *
     * @method invm
     * @param num - The BigNumber that defines the field.
     * @returns The modular multiplicative inverse of this BigNumber.
     *
     * @example
     * let a = new BigNumber(3);
     * let field = new BigNumber(7);
     * let inverse = a.invm(field);
     */
    invm(num: BigNumber): BigNumber;
    /**
     * Checks if this BigNumber is even.
     * An even number is an integer which is evenly divisible by two.
     *
     * @method isEven
     * @returns true if this BigNumber is even, else false.
     *
     * @example
     * let a = new BigNumber(4);
     * let isEven = a.isEven(); // true
     */
    isEven(): boolean;
    /**
     * Checks if this BigNumber is Odd.
     * An odd number is an integer which is not evenly divisible by two.
     *
     * @method isOdd
     * @returns true if this BigNumber is Odd, else false.
     *
     * @example
     * let a = new BigNumber(3);
     * let isOdd = a.isOdd(); // true
     */
    isOdd(): boolean;
    /**
     * Returns the result of bitwise AND operation between the least significant 26 bits of
     * this BigNumber and the provided number.
     * This method is mostly used to mask-off less significant bits.
     *
     * @method andln
     * @param num - The number to AND with.
     * @returns The result of the AND operation.
     *
     * @example
     * let a = new BigNumber(60);
     * let result = a.andln(13); // 12
     */
    andln(num: number): number;
    /**
     * Increments the value at the bit position specified by the input parameter.
     *
     * @method bincn
     * @param bit - The bit position to increment at.
     * @returns This BigNumber after incrementing at the specific bit position.
     *
     * @example
     * let a = new BigNumber(5);
     * a.bincn(2); // a = 7
     */
    bincn(bit: number): BigNumber;
    /**
     * Checks if this BigNumber is Zero.
     * A BigNumber is zero if it only contains one word and that word is 0.
     *
     * @method isZero
     * @returns true if this BigNumber is Zero, else false.
     *
     * @example
     * let a = new BigNumber(0);
     * let isZero = a.isZero(); // true
     */
    isZero(): boolean;
    /**
     * Compares this BigNumber with the given number.
     * It returns -1 if this BigNumber is less than the number, 0 if they're equal, and 1 if the BigNumber is greater than the number.
     *
     * @method cmpn
     * @param num - The number to compare with.
     * @returns -1, 0, or 1 based on the comparison result.
     *
     * @example
     * let a = new BigNumber(15);
     * let result = a.cmpn(10); // 1
     */
    cmpn(num: number): 1 | 0 | -1;
    /**
     * Compare this big number with another big number.
     * @method cmp
     * @param num - The big number to compare with.
     * @returns Returns:
     * 1 if this big number is greater,
     * -1 if it's less,
     * 0 if they are equal.
     *
     * @example
     * import BigNumber from './BigNumber';
     * const bn1 = new BigNumber('10');
     * const bn2 = new BigNumber('6');
     * const comparisonResult = bn1.cmp(bn2); // 1 - because 10 is greater than 6
     */
    cmp(num: BigNumber): 1 | 0 | -1;
    /**
     * Performs an unsigned comparison between this BigNumber instance and another.
     *
     * @method ucmp
     * @param num - The BigNumber instance to compare with.
     * @returns Returns 1 if this BigNumber is bigger, -1 if it is smaller, and 0 if they are equal.
     *
     * @example
     * let bigNumber1 = new BigNumber('1234');
     * let bigNumber2 = new BigNumber('2345');
     * let comparisonResult = bigNumber1.ucmp(bigNumber2); // Returns -1
     */
    ucmp(num: BigNumber): 1 | 0 | -1;
    /**
     * Checks if this BigNumber instance is greater than a number.
     *
     * @method gtn
     * @param num - The number to compare with.
     * @returns Returns true if this BigNumber is greater than the number, false otherwise.
     *
     * @example
     * let bigNumber = new BigNumber('2345');
     * let isGreater = bigNumber.gtn(1234); // Returns true
     */
    gtn(num: number): boolean;
    /**
     * Checks if this BigNumber instance is greater than another BigNumber.
     *
     * @method gt
     * @param num - The BigNumber to compare with.
     * @returns Returns true if this BigNumber is greater than the other BigNumber, false otherwise.
     *
     * @example
     * let bigNumber1 = new BigNumber('2345');
     * let bigNumber2 = new BigNumber('1234');
     * let isGreater = bigNumber1.gt(bigNumber2); // Returns true
     */
    gt(num: BigNumber): boolean;
    /**
     * Checks if this BigNumber instance is greater than or equal to a number.
     *
     * @method gten
     * @param num - The number to compare with.
     * @returns Returns true if this BigNumber is greater than or equal to the number, false otherwise.
     *
     * @example
     * let bigNumber = new BigNumber('1234');
     * let isGreaterOrEqual = bigNumber.gten(1234); // Returns true
     */
    gten(num: number): boolean;
    /**
     * Checks if this BigNumber instance is greater than or equal to another BigNumber.
     *
     * @method gte
     * @param num - The BigNumber to compare with.
     * @returns Returns true if this BigNumber is greater than or equal to the other BigNumber, false otherwise.
     *
     * @example
     * let bigNumber1 = new BigNumber('1234');
     * let bigNumber2 = new BigNumber('1234');
     * let isGreaterOrEqual = bigNumber1.gte(bigNumber2); // Returns true
     */
    gte(num: BigNumber): boolean;
    /**
     * Checks if this BigNumber instance is less than a number.
     *
     * @method ltn
     * @param num - The number to compare with.
     * @returns Returns true if this BigNumber is less than the number, false otherwise.
     *
     * @example
     * let bigNumber = new BigNumber('1234');
     * let isLess = bigNumber.ltn(2345); // Returns true
     */
    ltn(num: number): boolean;
    /**
     * Checks if this BigNumber instance is less than another BigNumber.
     *
     * @method lt
     * @param num - The BigNumber to compare with.
     * @returns Returns true if this BigNumber is less than the other BigNumber, false otherwise.
     *
     * @example
     * let bigNumber1 = new BigNumber('1234');
     * let bigNumber2 = new BigNumber('2345');
     * let isLess = bigNumber1.lt(bigNumber2); // Returns true
     */
    lt(num: BigNumber): boolean;
    /**
     * Checks if this BigNumber instance is less than or equal to a number.
     *
     * @method lten
     * @param num - The number to compare with.
     * @returns Returns true if this BigNumber is less than or equal to the number, false otherwise.
     *
     * @example
     * let bigNumber = new BigNumber('2345');
     * let isLessOrEqual = bigNumber.lten(2345); // Returns true
     */
    lten(num: number): boolean;
    /**
     * Checks if this BigNumber instance is less than or equal to another BigNumber.
     *
     * @method lte
     * @param num - The BigNumber to compare with.
     * @returns Returns true if this BigNumber is less than or equal to the other BigNumber, false otherwise.
     *
     * @example
     * let bigNumber1 = new BigNumber('2345');
     * let bigNumber2 = new BigNumber('2345');
     * let isLessOrEqual = bigNumber1.lte(bigNumber2); // Returns true
     */
    lte(num: BigNumber): boolean;
    /**
     * Checks if this BigNumber instance is equal to a number.
     *
     * @method eqn
     * @param num - The number to compare with.
     * @returns Returns true if this BigNumber is equal to the number, false otherwise.
     *
     * @example
     * let bigNumber = new BigNumber('1234');
     * let isEqual = bigNumber.eqn(1234); // Returns true
     */
    eqn(num: number): boolean;
    /**
     * Compares the current BigNumber with the given number and returns whether they're equal.
     *
     * @method eq
     * @param num - The number to compare equality with.
     * @returns Returns true if the current BigNumber is equal to the provided number, otherwise false.
     *
     * @example
     * let bigNum = new BigNumber(10);
     * bigNum.eq(new BigNumber(10)); // true
     */
    eq(num: BigNumber): boolean;
    /**
     * Converts a BigNumber to a reduction context ensuring the number is a positive integer and is not already in a reduction context.
     * Throws an error in case the number is either negative or already in a reduction context.
     *
     * @method toRed
     * @param ctx - The ReductionContext to convert the BigNumber to.
     * @returns Returns the BigNumber in the given ReductionContext.
     *
     * @example
     * let bigNum = new BigNumber(10);
     * let redCtx = new ReductionContext();
     * bigNum.toRed(redCtx);
     */
    toRed(ctx: ReductionContext): BigNumber;
    /**
     * Converts a BigNumber from a reduction context, making sure the number is indeed in a reduction context.
     * Throws an error in case the number is not in a reduction context.
     *
     * @method fromRed
     * @returns Returns the BigNumber out of the ReductionContext.
     *
     * @example
     * let bigNum = new BigNumber(10);
     * let redCtx = new ReductionContext();
     * bigNum.toRed(redCtx);
     * bigNum.fromRed();
     */
    fromRed(): BigNumber;
    /**
     * Forces the current BigNumber into a reduction context, irrespective of the BigNumber's current state.
     *
     * @method forceRed
     * @param ctx - The ReductionContext to forcefully convert the BigNumber to.
     * @returns Returns the BigNumber in the given ReductionContext.
     *
     * @example
     * let bigNum = new BigNumber(10);
     * let redCtx = new ReductionContext();
     * bigNum.forceRed(redCtx);
     */
    forceRed(ctx: ReductionContext): BigNumber;
    /**
     * Performs addition operation of the current BigNumber with the given number in a reduction context.
     * Throws an error in case the number is not in a reduction context.
     *
     * @method redAdd
     * @param num - The number to add to the current BigNumber.
     * @returns Returns a new BigNumber that's the sum of the current BigNumber and the provided number in the reduction context.
     *
     * @example
     * let bigNum = new BigNumber(10);
     * let redCtx = new ReductionContext();
     * bigNum.toRed(redCtx);
     * bigNum.redAdd(new BigNumber(20)); // returns a BigNumber of 30 in reduction context
     */
    redAdd(num: BigNumber): BigNumber;
    /**
     * Performs in-place addition operation of the current BigNumber with the given number in a reduction context.
     * Throws an error in case the number is not in a reduction context.
     *
     * @method redIAdd
     * @param num - The number to add to the current BigNumber.
     * @returns Returns the modified current BigNumber after adding the provided number in the reduction context.
     *
     * @example
     * let bigNum = new BigNumber(10);
     * let redCtx = new ReductionContext();
     * bigNum.toRed(redCtx);
     * bigNum.redIAdd(new BigNumber(20)); // modifies the bigNum to 30 in reduction context
     */
    redIAdd(num: BigNumber): BigNumber;
    /**
     * Performs subtraction operation of the current BigNumber with the given number in a reduction context.
     * Throws an error in case the number is not in a reduction context.
     *
     * @method redSub
     * @param num - The number to subtract from the current BigNumber.
     * @returns Returns a new BigNumber that's the subtraction result of the current BigNumber and the provided number in the reduction context.
     *
     * @example
     * let bigNum = new BigNumber(30);
     * let redCtx = new ReductionContext();
     * bigNum.toRed(redCtx);
     * bigNum.redSub(new BigNumber(20)); // returns a BigNumber of 10 in reduction context
     */
    redSub(num: BigNumber): BigNumber;
    /**
     * Performs in-place subtraction operation of the current BigNumber with the given number in a reduction context.
     * Throws an error in case the number is not in a reduction context.
     *
     * @method redISub
     * @param num - The number to subtract from the current BigNumber.
     * @returns Returns the modified current BigNumber after subtracting the provided number in the reduction context.
     *
     * @example
     * let bigNum = new BigNumber(30);
     * let redCtx = new ReductionContext();
     * bigNum.toRed(redCtx);
     * bigNum.redISub(new BigNumber(20)); // modifies the bigNum to 10 in reduction context
     */
    redISub(num: BigNumber): BigNumber;
    /**
     * Performs the shift left operation on the current BigNumber in the reduction context.
     * Throws an error in case the number is not in a reduction context.
     *
     * @method redShl
     * @param num - The positions to shift left the current BigNumber.
     * @returns Returns a new BigNumber after performing the shift left operation on the current BigNumber in the reduction context.
     *
     * @example
     * let bigNum = new BigNumber(1);
     * let redCtx = new ReductionContext();
     * bigNum.toRed(redCtx);
     * bigNum.redShl(2); // returns a BigNumber of 4 in reduction context
     */
    redShl(num: number): BigNumber;
    /**
     * Performs multiplication operation of the current BigNumber with the given number in a reduction context.
     * Throws an error in case the number is not in a reduction context.
     *
     * @method redMul
     * @param num - The number to multiply with the current BigNumber.
     * @returns Returns a new BigNumber that's the product of the current BigNumber and the provided number in the reduction context.
     *
     * @example
     * let bigNum = new BigNumber(10);
     * let redCtx = new ReductionContext();
     * bigNum.toRed(redCtx);
     * bigNum.redMul(new BigNumber(20)); // returns a BigNumber of 200 in reduction context
     */
    redMul(num: BigNumber): BigNumber;
    /**
     * Performs an in-place multiplication of this BigNumber instance with another BigNumber within a reduction context.
     * Expects that this BigNumber is within the reduction context i.e., it has been reduced.
     *
     * @method redIMul
     * @param num - The BigNumber to multiply with the current BigNumber.
     * @returns A BigNumber that is the result of the in-place multiplication operation, within the reduction context.
     *
     * @example
     * let bigNum1 = new BigNumber('10').toRed(someRed);
     * let bigNum2 = new BigNumber('5');
     * bigNum1.redIMul(bigNum2);
     */
    redIMul(num: BigNumber): BigNumber;
    /**
     * Square of a "red" (reduced) BigNumber.
     * This function squares the calling BigNumber and returns the result.
     * It only works if the number is "reduced". A number is considered reduced
     * if it has a `red` field that points to a reduction context object.
     *
     * @method redSqr
     * @throws If the BigNumber is not reduced
     * @returns The square of the BigNumber
     *
     * @example
     * const num = new BigNumber('25').toRed(someRed);
     * const result = num.redSqr();
     * console.log(result.toString()); // Outputs: '625' mod the red value
     */
    redSqr(): BigNumber;
    /**
     * In-place square of a "red" (reduced) BigNumber.
     * This function squares the calling BigNumber and overwrites it with the result.
     * It only works if the number is "reduced". A number is considered reduced
     * if it has a `red` field that points to a reduction context object.
     *
     * @method redISqr
     * @throws If the BigNumber is not reduced
     * @returns This BigNumber squared in place
     *
     * @example
     * const num = new BigNumber('25').toRed(someRed);
     * num.redISqr();
     * console.log(num.toString()); // Outputs: '625' mod the red value
     */
    redISqr(): BigNumber;
    /**
     * Square root of a "red" (reduced) BigNumber.
     * This function calculates the square root of the calling BigNumber
     * and returns the result. It only works if the number is "reduced".
     * A number is considered reduced if it has a `red`
     * field that points to a reduction context object.
     *
     * @method redSqrt
     * @throws If the BigNumber is not reduced
     * @returns The square root of the BigNumber
     *
     * @example
     * const num = new BigNumber('4').toRed(someRed);
     * const result = num.redSqrt();
     * console.log(result.toString()); // Outputs: '2' mod the red value
     */
    redSqrt(): BigNumber;
    /**
     * Find multiplicative inverse (reciprocal) in respect to reduction context.
     * The method works only on numbers that have a reduction context set.
     *
     * @method redInvm
     * @returns Returns a BigNumber that is multiplicative inverse in respect to the reduction context.
     * @throws Will throw an error if this number does not have a reduction context.
     *
     * @example
     * let a = new BigNumber('2345', 16);
     * a.red = someReductionContext;
     * let aInverse = a.redInvm();
     */
    redInvm(): BigNumber;
    /**
     * Find negative version of this number in respect to reduction context.
     * The method works only on numbers that have a reduction context set.
     *
     * @method redNeg
     * @returns Returns a BigNumber that is the negative version of this number in respect to the reduction context.
     * @throws Will throw an error if this number does not have a reduction context.
     *
     * @example
     * let a = new BigNumber('2345', 16);
     * a.red = someReductionContext;
     * let aNeg = a.redNeg();
     */
    redNeg(): BigNumber;
    /**
     * Raises this number to the power of 'num', in respect to reduction context.
     * Note that 'num' must not have a reduction context set.
     *
     * @method redPow
     * @param num - The exponent to raise this number to.
     * @returns Returns a BigNumber that is this number raised to the power of 'num', in respect to the reduction context.
     * @throws Will throw an error if this number does not have a reduction context or 'num' has a reduction context.
     *
     * @example
     * let a = new BigNumber(3);
     * a.red = someReductionContext;
     * let b = new BigNumber(3);
     * let result = a.redPow(b);  // equivalent to (a^b) mod red
     */
    redPow(num: BigNumber): BigNumber;
    /**
     * Creates a BigNumber from a hexadecimal string.
     *
     * @static
     * @method fromHex
     * @param hex - The hexadecimal string to create a BigNumber from.
     * @returns Returns a BigNumber created from the hexadecimal input string.
     *
     * @example
     * const exampleHex = 'a1b2c3';
     * const bigNumber = BigNumber.fromHex(exampleHex);
     */
    static fromHex(hex: string, endian?: 'little' | 'big'): BigNumber;
    /**
     * Converts this BigNumber to a hexadecimal string.
     *
     * @method toHex
     * @param length - The minimum length of the hex string
     * @returns Returns a string representing the hexadecimal value of this BigNumber.
     *
     * @example
     * const bigNumber = new BigNumber(255);
     * const hex = bigNumber.toHex();
     */
    toHex(length?: number): string;
    /**
     * Creates a BigNumber from a JSON-serialized string.
     *
     * @static
     * @method fromJSON
     * @param str - The JSON-serialized string to create a BigNumber from.
     * @returns Returns a BigNumber created from the JSON input string.
     *
     * @example
     * const serialized = '{"type":"BigNumber","hex":"a1b2c3"}';
     * const bigNumber = BigNumber.fromJSON(serialized);
     */
    static fromJSON(str: string): BigNumber;
    /**
     * Creates a BigNumber from a number.
     *
     * @static
     * @method fromNumber
     * @param n - The number to create a BigNumber from.
     * @returns Returns a BigNumber equivalent to the input number.
     *
     * @example
     * const number = 1234;
     * const bigNumber = BigNumber.fromNumber(number);
     */
    static fromNumber(n: number): BigNumber;
    /**
     * Creates a BigNumber from a string, considering an optional base.
     *
     * @static
     * @method fromString
     * @param str - The string to create a BigNumber from.
     * @param base - The base used for conversion. If not provided, base 10 is assumed.
     * @returns Returns a BigNumber equivalent to the string after conversion from the specified base.
     *
     * @example
     * const str = '1234';
     * const bigNumber = BigNumber.fromString(str, 16);
     */
    static fromString(str: string, base?: number | 'hex'): BigNumber;
    /**
     * Creates a BigNumber from a signed magnitude number.
     *
     * @static
     * @method fromSm
     * @param num - The signed magnitude number to convert to a BigNumber.
     * @param endian - Defines endianess. If not provided, big endian is assumed.
     * @returns Returns a BigNumber equivalent to the signed magnitude number interpreted with specified endianess.
     *
     * @example
     * const num = [0x81]
     * const bigNumber = BigNumber.fromSm(num, { endian: 'little' }); // equivalent to BigNumber from '-1'
     */
    static fromSm(num: number[], endian?: 'big' | 'little'): BigNumber;
    /**
     * Converts this BigNumber to a signed magnitude number.
     *
     * @method toSm
     * @param endian - Defines endianess. If not provided, big endian is assumed.
     * @returns Returns an array equivalent to this BigNumber interpreted as a signed magnitude with specified endianess.
     *
     * @example
     * const bigNumber = new BigNumber(-1);
     * const num = bigNumber.toSm('little'); // [0x81]
     */
    toSm(endian?: 'big' | 'little'): number[];
    /**
     * Creates a BigNumber from a number representing the "bits" value in a block header.
     *
     * @static
     * @method fromBits
     * @param bits - The number representing the bits value in a block header.
     * @param strict - If true, an error is thrown if the number has negative bit set.
     * @returns Returns a BigNumber equivalent to the "bits" value in a block header.
     * @throws Will throw an error if `strict` is `true` and the number has negative bit set.
     *
     * @example
     * const bits = 0x1d00ffff;
     * const bigNumber = BigNumber.fromBits(bits);
     */
    static fromBits(bits: number, strict?: boolean): BigNumber;
    /**
     * Converts this BigNumber to a number representing the "bits" value in a block header.
     *
     * @method toBits
     * @returns Returns a number equivalent to the "bits" value in a block header.
     *
     * @example
     * const bigNumber = new BigNumber(1);
     * const bits = bigNumber.toBits();
     */
    toBits(): number;
    /**
     * Creates a BigNumber from the format used in Bitcoin scripts.
     *
     * @static
     * @method fromScriptNum
     * @param num - The number in the format used in Bitcoin scripts.
     * @param requireMinimal - If true, non-minimally encoded values will throw an error.
     * @param maxNumSize - The maximum allowed size for the number. If not provided, defaults to 4.
     * @returns Returns a BigNumber equivalent to the number used in a Bitcoin script.
     * @throws Will throw an error if `requireMinimal` is `true` and the value is non-minimally encoded. Will throw an error if number length is greater than `maxNumSize`.
     *
     * @example
     * const num = [0x02, 0x01]
     * const bigNumber = BigNumber.fromScriptNum(num, true, 5)
     */
    static fromScriptNum(num: number[], requireMinimal?: boolean, maxNumSize?: number): BigNumber;
    /**
     * Converts this BigNumber to a number in the format used in Bitcoin scripts.
     *
     * @method toScriptNum
     * @returns Returns the equivalent to this BigNumber as a Bitcoin script number.
     *
     * @example
     * const bigNumber = new BigNumber(258)
     * const num = bigNumber.toScriptNum() // equivalent to bigNumber.toSm('little')
     */
    toScriptNum(): number[];
}
//# sourceMappingURL=BigNumber.d.ts.map