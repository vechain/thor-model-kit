
import BigNumber from 'bignumber.js'

const hexRegEx = /^[0-9a-f]*$/i

function hexToBuffer(hex: string, prefix = '0x') {
    if (!hex.startsWith(prefix))
        throw new Error('prefix mismatch')

    hex = hex.substr(prefix.length)
    if (!hexRegEx.test(hex))
        throw new Error('not in hex format')

    if (hex.length % 2 != 0) {
        throw new Error('odd hex')
    }
    return new Buffer(hex, 'hex')
}

/**
 * Address class.
 */
export class Address {
    /**
     * parses hex string to Address.
     * @param hex the hex string
     * @param prefix prefix to match against, defaults to '0x'
     */
    static fromHex(hex: string, prefix = '0x') {
        let bytes = hexToBuffer(hex, prefix)
        if (bytes.length != 20)
            throw new Error('address should be 20 bytes')

        return new Address(bytes)
    }

    /** the underlying value */
    readonly bytes: Buffer

    /**
     * construct Address object from Buffer.
     * @param bytes 
     */
    constructor(bytes: Buffer) {
        let b20 = new Buffer(20)
        bytes.copy(b20,
            b20.length > bytes.length ? b20.length - bytes.length : 0,
            bytes.length > b20.length ? bytes.length - b20.length : 0)
        this.bytes = b20
    }

    /**
     * convert to string presentation, in hex form.
     * @param prefix prefix added before string, defaults to '0x'
     */
    toString(prefix = '0x') {
        return (prefix || '') + this.bytes.toString('hex')
    }
}

/**
 * Bytes32 class.
 */
export class Bytes32 {
    /**
     * parses hex string to Bytes32.
     * @param hex the hex string
     * @param prefix prefix to match against, defaults to '0x'
     */
    static fromHex(hex: string, prefix = '0x') {
        let bytes = hexToBuffer(hex, prefix)
        if (bytes.length != 32)
            throw new Error('bytes32 should be 32 bytes')

        return new Bytes32(bytes)
    }
    /** the underlying value */
    readonly bytes: Buffer

    /**
     * construct Bytes32 object from Buffer.
     * @param bytes 
     */
    constructor(bytes: Buffer) {
        let b32 = new Buffer(32)
        bytes.copy(b32,
            b32.length > bytes.length ? b32.length - bytes.length : 0,
            bytes.length > b32.length ? bytes.length - b32.length : 0)
        this.bytes = b32
    }

    /**
    * convert to string presentation, in hex form.
    * @param prefix prefix added before string, defaults to '0x'
    */
    toString(prefix = '0x') {
        return (prefix || '') + this.bytes.toString('hex')
    }
}


/**
 * BigInt class presents non-negative big integer
 */
export class BigInt {
    /**
     * parse a value to BigInt.
     * @param v can be a integer in types of number, string and BigNumber
     */
    static from(v: number | string | BigNumber) {
        let bn: BigNumber
        if (typeof v === 'string') {
            bn = new BigNumber(v)
        } else if (typeof v === 'number') {
            bn = new BigNumber(v)
        } else {
            bn = v
        }
        if (bn.isNegative()) {
            throw new Error('negative number')
        }
        if (!bn.isInteger()) {
            throw new Error('not a integer')
        }
        let hex = bn.toString(16)
        if (hex.length % 2 != 0)
            hex = '0' + hex

        return new BigInt(new Buffer(hex, 'hex'))
    }
    /** the underlying value */
    readonly bytes: Buffer

    /**
     * construct BigInt object from Buffer.
     * @param bytes 
     */
    constructor(bytes: Buffer) {
        // trim leading zero
        let i = 0
        for (; i < bytes.length; i++) {
            if (bytes[i] != 0)
                break
        }
        this.bytes = bytes.slice(i)
    }

    /**
     * convert to BigNumber
     */
    toBigNumber() {
        return new BigNumber(this.bytes.toString('hex'), 16)
    }

    /**
     * convert to string
     * @param base the base, 16 or 10
     */
    toString(base: 16 | 10 = 16) {
        let prefix = (base === 16) ? '0x' : ''
        return prefix + this.toBigNumber().toString(base)
    }
}
