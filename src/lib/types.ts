
import { BigNumber } from 'bignumber.js'

/**
 * Bytes class.
 */
export class Bytes {
    private static readonly isHex = /^[0-9a-f]*$/i

    /**
     * parse hex string to Bytes.
     * @param hex hex string
     * @param prefix prefix to match against, defaults to '0x'
     */
    static from(hex: string, prefix = '0x') {
        if (!hex.startsWith(prefix))
            throw new Error('prefix mismatch')

        hex = hex.substr(prefix.length)
        if (!Bytes.isHex.test(hex))
            throw new Error('not hex format')

        if (hex.length % 2 != 0) {
            throw new Error('odd hex')
        }
        return new Bytes(new Buffer(hex, 'hex'))
    }

    /** the underlying value */
    readonly buffer: Buffer

    /**
     * construct Bytes object from a buffer.
     * @param buf 
     */
    constructor(buf: Buffer) {
        this.buffer = buf
    }

    /**
     * convert to string presentation, in hex form.
     * @param prefix prefix added before string, defaults to '0x'
     */
    toString(prefix = '0x') {
        return (prefix || '') + this.buffer.toString('hex')
    }

    /**
     * return a new Bytes object, for which bytes equal to `v` from the left end are removed.
     * @param v defaults to 0
     */
    trimLeft(v = 0) {
        let i = 0
        for (; i < this.buffer.length; i++) {
            if (this.buffer[i] != v)
                break
        }
        return new Bytes(this.buffer.slice(i))
    }
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
    static from(hex: string, prefix = '0x') {
        let bytes = Bytes.from(hex, prefix)
        if (bytes.buffer.length != 20)
            throw new Error('address should be 20 bytes')

        return new Address(bytes.buffer)
    }

    /** the underlying value */
    readonly buffer: Buffer

    /**
     * construct Address object from buffer.
     * @param buf 
     */
    constructor(buf: Buffer) {
        let newBuf = new Buffer(20)
        buf.copy(newBuf,
            newBuf.length > buf.length ? newBuf.length - buf.length : 0,
            buf.length > newBuf.length ? buf.length - newBuf.length : 0)
        this.buffer = newBuf
    }

    /**
     * convert to string presentation, in hex form.
     * @param prefix prefix added before string, defaults to '0x'
     */
    toString(prefix = '0x') {
        return (prefix || '') + this.buffer.toString('hex')
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
    static from(hex: string, prefix = '0x') {
        let bytes = Bytes.from(hex, prefix)
        if (bytes.buffer.length != 32)
            throw new Error('bytes32 should be 32 bytes')

        return new Bytes32(bytes.buffer)
    }
    /** the underlying value */
    readonly buffer: Buffer

    /**
     * construct Bytes32 object from buffer.
     * @param buf 
     */
    constructor(buf: Buffer) {
        let newBuf = new Buffer(32)
        buf.copy(newBuf,
            newBuf.length > buf.length ? newBuf.length - buf.length : 0,
            buf.length > newBuf.length ? buf.length - newBuf.length : 0)
        this.buffer = newBuf
    }

     /**
     * convert to string presentation, in hex form.
     * @param prefix prefix added before string, defaults to '0x'
     */
    toString(prefix = '0x') {
        return (prefix || '') + this.buffer.toString('hex')
    }
}


/**
 * BigInt class.
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
        if (!bn.isInteger()) {
            throw new Error('not a integer')
        }
        let hex = bn.toString(16)
        if (hex.length % 2 != 0)
            hex = '0' + hex

        return new BigInt(new Buffer(hex, 'hex'))
    }
    /** the underlying value */
    readonly buffer: Buffer

    /**
     * construct BigInt object from buffer.
     * @param buf 
     */
    constructor(buf: Buffer) {
        this.buffer = new Bytes(buf).trimLeft().buffer
    }

    /**
     * convert to BigNumber
     */
    toBigNumber(): BigNumber {
        return new BigNumber(this.buffer.toString('hex'), 16)
    }

    /**
     * convert to string
     * @param base the base, 16 or 10
     */
    toString(base: 16 | 10 = 16): string {
        let prefix = (base == 16) ? '0x' : ''
        return prefix + this.toBigNumber().toString(base)
    }
}
