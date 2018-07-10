import { expect } from 'chai'
import { Mnemonic } from '../src'

describe('mnemonic', () => {
    it('generate', () => {
        expect(Mnemonic.generate().length).equal(12)
    })
    it('validate', () => {
        expect(Mnemonic.validate(['hello', 'world'])).equal(false)
        expect(Mnemonic.validate(Mnemonic.generate())).equal(true)
    })
    it('derive', () => {
        let words = 'ignore empty bird silly journey junior ripple have guard waste between tenant'.split(' ')
        expect(Mnemonic.derivePrivateKey(words).bytes).deep.equal(Buffer.from('27196338e7d0b5e7bf1be1c0327c53a244a18ef0b102976980e341500f492425', 'hex'))
    })
})
