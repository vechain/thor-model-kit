import { expect } from 'chai'
import { Transaction, BigInt, Address, Bytes32, Secp256k1 } from '../src'

describe("transaction", () => {
    let body: Transaction.Body = {
        chainTag: 1,
        blockRef: Buffer.from('00000000aabbccdd', 'hex'),
        expiration: 32,
        clauses: [{
            to: Address.fromHex('7567d83b7b8d80addcb281a71d54fc7b3364ffed', ''),
            value: BigInt.from(10000),
            data: Buffer.from('000000606060', 'hex')
        }, {
            to: Address.fromHex('7567d83b7b8d80addcb281a71d54fc7b3364ffed', ''),
            value: BigInt.from(20000),
            data: Buffer.from('000000606060', 'hex')
        }],
        gasPriceCoef: 128,
        gas: BigInt.from(21000),
        dependsOn: null,
        nonce: BigInt.from(12345678),
        reserved: []
    }
    let unsigned = new Transaction(body)

    it('unsigned', () => {
        expect(unsigned.signingHash.toString()).equal('0x2a1c25ce0d66f45276a5f308b99bf410e2fc7d5b6ea37a49f2ab9f1da9446478')
        expect(unsigned.id).deep.equal(new Bytes32(Buffer.alloc(0)))
        expect(unsigned.intrinsicGas).equal(37432)
        expect(new Transaction({ ...body, clauses: [] }).intrinsicGas).equal(21000)
        expect(new Transaction({
            ...body,
            clauses: [{
                to: null,
                value: BigInt.from(0),
                data: Buffer.alloc(0)
            }]
        }).intrinsicGas).equal(53000)
        expect(unsigned.gasPrice(BigInt.from(100))).deep.equal(BigInt.from(150))
        expect(unsigned.signature).to.be.undefined
        expect(() => { unsigned.signer }).to.throw()
        expect(() => { unsigned.encode() }).to.throw()
    })

    it('invalid body', () => {
        expect(() => { new Transaction({ ...body, chainTag: 256 }) }).to.throw()
        expect(() => { new Transaction({ ...body, chainTag: -1 }) }).to.throw()
        expect(() => { new Transaction({ ...body, chainTag: 1.1 }) }).to.throw()

        expect(() => { new Transaction({ ...body, blockRef: Buffer.alloc(0) }) }).to.throw()
        expect(() => { new Transaction({ ...body, blockRef: Buffer.alloc(9) }) }).to.throw()

        expect(() => { new Transaction({ ...body, expiration: 2 ** 32 }) }).to.throw()
        expect(() => { new Transaction({ ...body, expiration: -1 }) }).to.throw()
        expect(() => { new Transaction({ ...body, expiration: 1.1 }) }).to.throw()

        expect(() => { new Transaction({ ...body, gasPriceCoef: 256 }) }).to.throw()
        expect(() => { new Transaction({ ...body, gasPriceCoef: -1 }) }).to.throw()
        expect(() => { new Transaction({ ...body, gasPriceCoef: 1.1 }) }).to.throw()

        expect(() => { new Transaction({ ...body, gas: BigInt.from('0x10000000000000000') }) }).to.throw()

        expect(() => { new Transaction({ ...body, nonce: BigInt.from('0x10000000000000000') }) }).to.throw()
    })

    let signed = new Transaction(body)
    let privKey = Bytes32.fromHex('7582be841ca040aa940fff6c05773129e135623e41acce3e0b8ba520dc1ae26a', '')
    signed.signature = Secp256k1.sign(signed.signingHash, privKey)
    let signer = Secp256k1.deriveAddress(Secp256k1.derivePublicKey(privKey))

    it("signed", () => {
        expect(signed.signature).deep.equal(Buffer.from('f76f3c91a834165872aa9464fc55b03a13f46ea8d3b858e528fcceaf371ad6884193c3f313ff8effbb57fe4d1adc13dceb933bedbf9dbb528d2936203d5511df00', 'hex'))
        expect(signed.signer).deep.equal(signer)
        expect(signed.id).deep.equal(Bytes32.fromHex('0xda90eaea52980bc4bb8d40cb2ff84d78433b3b4a6e7d50b75736c5e3e77b71ec'))
    })

    let encoded = Buffer.from('f8970184aabbccdd20f840df947567d83b7b8d80addcb281a71d54fc7b3364ffed82271086000000606060df947567d83b7b8d80addcb281a71d54fc7b3364ffed824e208600000060606081808252088083bc614ec0b841f76f3c91a834165872aa9464fc55b03a13f46ea8d3b858e528fcceaf371ad6884193c3f313ff8effbb57fe4d1adc13dceb933bedbf9dbb528d2936203d5511df00', 'hex')
    it("encode decode", () => {
        expect(signed.encode()).deep.equal(encoded)
        expect(Transaction.decode(encoded)).deep.equal(signed)
    })

    let incorrectlySigned = new Transaction(body)
    incorrectlySigned.signature = Buffer.from([1, 2, 3])
    it('incorrectly signed', () => {
        expect(() => { incorrectlySigned.signer }).to.throw()
        expect(incorrectlySigned.id).deep.equal(new Bytes32(Buffer.alloc(0)))
    })
})
