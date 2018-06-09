import { expect } from 'chai'
import { Address, Bytes32, BigInt } from '../src/lib/types'
import BigNumber from 'bignumber.js';

describe('Address', () => {
    const pureHex = '7567d83b7b8d80addcb281a71d54fc7b3364ffed'
    const bytes = new Buffer(pureHex, 'hex')

    it('constructor', () => {
        expect(new Address(bytes).bytes).deep.equal(bytes)

        let longer = new Buffer('ff' + pureHex, 'hex')
        expect(new Address(longer).bytes).deep.equal(bytes)

        let shorter = new Buffer('fc7b3364ffed', 'hex')
        let extended = new Buffer('0000000000000000000000000000fc7b3364ffed', 'hex')
        expect(new Address(shorter).bytes).deep.equal(extended)
    })

    it('should parse', () => {
        expect(Address.fromHex('0x' + pureHex).bytes)
            .deep.equal(bytes)
        expect(Address.fromHex(pureHex, '').bytes)
            .deep.equal(bytes)
        expect(Address.fromHex('vx:' + pureHex, 'vx:').bytes)
            .deep.equal(bytes)
    })
    it('should not parse', () => {
        expect(() => { Address.fromHex('0x' + pureHex, 'xx') }, 'prefix mismatch')
            .throw()
        expect(() => { Address.fromHex('0x' + 'm' + pureHex.slice(1)) }, 'invalid hex')
            .throw()
        expect(() => { Address.fromHex('0x' + pureHex + 'ff') }, 'longer than 20 bytes')
            .throw()
        expect(() => { Address.fromHex('0x' + pureHex.slice(2)) }, 'shorter than 20 bytes')
            .throw()
    })

    it('toString', () => {
        let addr = Address.fromHex('0x' + pureHex)
        expect(addr.toString()).equal('0x' + pureHex)
        expect(addr.toString('0x')).equal('0x' + pureHex)
        expect(addr.toString('vx:')).equal('vx:' + pureHex)
    })
})

describe('Bytes32', () => {
    const pureHex = '9bcc6526a76ae560244f698805cc001977246cb92c2b4f1e2b7a204e445409ea'
    const bytes = new Buffer(pureHex, 'hex')

    it('constructor', () => {
        expect(new Bytes32(bytes).bytes).deep.equal(bytes)

        let longer = new Buffer('ff' + pureHex, 'hex')
        expect(new Bytes32(longer).bytes).deep.equal(bytes)

        let shorter = new Buffer('204e445409ea', 'hex')
        let extended = new Buffer('0000000000000000000000000000000000000000000000000000204e445409ea', 'hex')
        expect(new Bytes32(shorter).bytes).deep.equal(extended)
    })

    it('should parse', () => {
        expect(Bytes32.fromHex('0x' + pureHex).bytes)
            .deep.equal(bytes)
        expect(Bytes32.fromHex(pureHex, '').bytes)
            .deep.equal(bytes)
        expect(Bytes32.fromHex('foo' + pureHex, 'foo').bytes)
            .deep.equal(bytes)
    })
    it('should not parse', () => {
        expect(() => { Bytes32.fromHex('0x' + pureHex, 'xx') }, 'prefix mismatch')
            .throw()
        expect(() => { Bytes32.fromHex('0x' + 'm' + pureHex.slice(1)) }, 'invalid hex')
            .throw()
        expect(() => { Bytes32.fromHex('0x' + pureHex + 'ff') }, 'longer than 32 bytes')
            .throw()
        expect(() => { Bytes32.fromHex('0x' + pureHex.slice(2)) }, 'shorter than 32 bytes')
            .throw()
    })

    it('toString', () => {
        let b32 = Bytes32.fromHex('0x' + pureHex)
        expect(b32.toString()).equal('0x' + pureHex)
        expect(b32.toString('0x')).equal('0x' + pureHex)
        expect(b32.toString('foo')).equal('foo' + pureHex)
    })
})

describe('BigInt', () => {
    const pureHex = '9bcc6526a76ae560244f698805cc001977246cb92c2b4f1e2b7a204e445409ea'
    const bytes = new Buffer(pureHex, 'hex')
    const bn = new BigNumber('0x' + pureHex)

    it('construct', () => {
        expect(new BigInt(bytes).bytes).deep.equal(bytes)
        expect(new BigInt(new Buffer('00' + pureHex, 'hex')).bytes).deep.equal(bytes)
        expect(new BigInt(new Buffer('00', 'hex')).bytes).deep.equal(new Buffer(0))
    })

    it('should parse', () => {
        expect(BigInt.from(123).bytes).deep.equal(new Buffer([123]))
        expect(BigInt.from('123').bytes).deep.equal(new Buffer([123]))
        expect(BigInt.from('0x123').bytes).deep.equal(new Buffer([0x1, 0x23]))
        expect(BigInt.from(bn).bytes).deep.equal(bytes)
    })

    it('should not parse', () => {
        expect(() => { BigInt.from(-1) }, 'negative value').throw()
        expect(() => { BigInt.from(NaN) }, 'NaN').throw()
        expect(() => { BigInt.from(123.1) }, 'float value').throw()

        expect(() => { BigInt.from('not a number') }).throw()
        expect(() => { BigInt.from('ff') }).throw()
    })

    it('toBigNumber', () => {
        expect(new BigInt(bytes).toBigNumber()).deep.equal(bn)
    })

    it('toString', () => {
        expect(new BigInt(bytes).toString()).equal('0x' + pureHex)
        expect(new BigInt(bytes).toString(16)).equal('0x' + pureHex)
        expect(new BigInt(bytes).toString(10)).equal('70469626450111206971489368284116200870511529936970843950965561753083065928170')
    })
})