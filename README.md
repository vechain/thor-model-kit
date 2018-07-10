# Thor Model Kit

Typescript library defines VeChain Thor data models, to aid DApp development.

[![Gitter](https://badges.gitter.im/vechain/thor.svg)](https://gitter.im/vechain/thor?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

[![NPM Version](https://badge.fury.io/js/thor-model-kit.svg)](https://www.npmjs.com/package/thor-model-kit)
[![Build Status](https://travis-ci.org/vechain/thor-model-kit.svg)](https://travis-ci.org/vechain/thor-model-kit)
[![Coverage Status](https://coveralls.io/repos/github/vechain/thor-model-kit/badge.svg?branch=master)](https://coveralls.io/github/vechain/thor-model-kit?branch=master)



## Installation

```bash
npm i --save thor-model-kit
```

## Usage

All widgets are as below:

```javascript
import { 
    Address,
    Bytes32,
    BigInt,
    blake2b256,
    keccak256,
    Secp256k1,
    Mnemonic,
    Keystore,
    Transaction
} from 'thor-model-kit'
```

### Basic types

```javascript
let addr = Address.fromHex('0x7567d83b7b8d80addcb281a71d54fc7b3364ffed', '0x' /* defaults to '0x' */)
console.log(addr.toString('0x' /* defaults to '0x' */))
// 0x7567d83b7b8d80addcb281a71d54fc7b3364ffed
console.log(addr.toString('vx:'))
// vx:7567d83b7b8d80addcb281a71d54fc7b3364ffed

let b32 = Bytes32.fromHex('0xda90eaea52980bc4bb8d40cb2ff84d78433b3b4a6e7d50b75736c5e3e77b71ec', '0x' /* defaults to '0x' */)
console.log(b32.toString('0x' /* defaults to '0x' */))
// 0xda90eaea52980bc4bb8d40cb2ff84d78433b3b4a6e7d50b75736c5e3e77b71ec

let bi = BigInt.from(123)
console.log(bi.toString(10))
// 123
```

### Crypto methods

```javascript
let hash = blake2b256('hello world')
console.log(hash.toString())
// 0x256c83b297114d201b30179f3f0ef0cace9783622da5974326b436178aeef610

hash = keccak256('hello world')
console.log(hash.toString())
// 0x47173285a8d7341e5e972fc677286384f802f8ef42a5ec5f03bbfa254cb01fad

// Secp256k1
let privKey = Secp256k1.generatePrivateKey()
let pubKey = Secp256k1.derivePublicKey(privKey)
let addr = Secp256k1.deriveAddress(pubKey)
let signature = Secp256k1.sign(keccak256('hello world'), privKey)
let recoveredPubKey = Secp256k1.recover(keccak256('hello world'), signature)
```

### Mnemonic & Keystore

```javascript
// generate BIP39 mnemonic words, default to 12 words(128bit strength)
let words = Mnemonic.generate()

// derive private key from mnemonic words according to BIP32, using the path `m/44'/818'/0'/0/0`.
// defined for VET at https://github.com/satoshilabs/slips/blob/master/slip-0044.md
let privateKey = Mnemonic.derivePrivateKey(words)

// in recovery process, validation is recommended
let ok = Mnemonic.validate(words)

// encrypt/decrypt private key using Ethereum's keystore scheme
let keystore = await Keystore.encrypt(privateKey, 'your password')

// throw for wrong password
let recoveredPrivateKey = await Keystore.decrypt(keystore, 'your password')

// roughly check keystore format
let ok = Keystore.wellFormed(keystore)
```

### Transaction codec

```javascript
let clauses = clauses: [{
    to: Address.fromHex('7567d83b7b8d80addcb281a71d54fc7b3364ffed', ''),
    value: BigInt.from(10000),
    data: Buffer.alloc(0)
}]

// calc intrinsic gas
let gas = Transaction.intrinsicGas(clauses)
console.log(gas)
// 21000

let body: Transaction.Body = {
    chainTag: 0x9a,
    blockRef: Buffer.from('0000000000000000', 'hex'),
    expiration: 32,
    clauses: clauses,
    gasPriceCoef: 128,
    gas: BigInt.from(21000),
    dependsOn: null,
    nonce: BigInt.from(12345678),
    reserved: []
}

let tx = new Transaction(body)
tx.signature = Secp256k1.sign(tx.signingHash, /* your private key */)

let raw = tx.encode()
let decoded = Transaction.decode(raw)
```

## License

thor-model-kit is licensed under the
[GNU Lesser General Public License v3.0](https://www.gnu.org/licenses/lgpl-3.0.html), also included
in *LICENSE* file in repository.
