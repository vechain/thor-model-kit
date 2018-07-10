import { expect } from 'chai'
import { Keystore, Secp256k1 } from '../src'

describe('keystore', () => {
    let privKey = Secp256k1.generatePrivateKey()

    it('encrypt', async () => {
        let ks = await Keystore.encrypt(privKey, '123')
        expect(ks.version).equal(3)
        expect(ks.address).equal(Secp256k1.deriveAddress(Secp256k1.derivePublicKey(privKey)).toString(''))
    })

    it('decrypt', async () => {
        let ks = await Keystore.encrypt(privKey, '123')
        let dprivKey = await Keystore.decrypt(ks, '123')
        expect(dprivKey).deep.equal(privKey)
    })

    it('validate', async () => {
        let ks = await Keystore.encrypt(privKey, '123')
        expect(Keystore.wellFormed(ks)).equal(true)

        let cpy = { ...ks, version: 0 }
        expect(Keystore.wellFormed(cpy)).equal(false)

        cpy = { ...ks, address: 'not an address' }
        expect(Keystore.wellFormed(cpy)).equal(false)

        cpy = { ...ks, id: 'not an id' }
        expect(Keystore.wellFormed(cpy)).equal(false)

        cpy = { ...ks, crypto: 'not an object' as any }
        expect(Keystore.wellFormed(cpy)).equal(false)
    })

})