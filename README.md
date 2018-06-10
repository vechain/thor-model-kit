## Thor Model Kit

Typescript library defines VeChainThor data models.

## Install

```bash
npm install --save thor-model-kit
```

## Usage

basic types

```javascript
import { Address, Bytes32, BigInt } from 'thor-model-kit'

let addr = Address.fromHex('0x7567d83b7b8d80addcb281a71d54fc7b3364ffed', '0x' /* defaults to '0x' */)
console.log(addr.toString('0x' /* defaults to '0x' */)) 
console.log(addr.toString('vx:')) 

let b32 = Bytes32.fromHex('0xda90eaea52980bc4bb8d40cb2ff84d78433b3b4a6e7d50b75736c5e3e77b71ec', '0x' /* defaults to '0x' */)
console.log(b32.toString('0x' /* defaults to '0x' */)) 

let bi = BigInt.from(123)
console.log(b32.toString(10))
```

crypto

```javascript
import { blake2b256, keccak256, Secp256k1 } from 'thor-model-kit'
```

transaction

``` javascript
import { Transaction } from 'thor-model-kit'

let body: Transaction.Body = {
    chainTag: 0x9a,
    blockRef: Buffer.from('0000000000000000', 'hex'),
    expiration: 32,
    clauses: [{
        to: Address.fromHex('7567d83b7b8d80addcb281a71d54fc7b3364ffed', ''),
        value: BigInt.from(10000),
        data: Buffer.alloc(0)
    }],
    gasPriceCoef: 128,
    gas: BigInt.from(21000),
    dependsOn: null,
    nonce: BigInt.from(12345678),
    reserved: []
}

let tx = new Transaction(body)
```

## License

thor-model-kit is licensed under the
[GNU Lesser General Public License v3.0](https://www.gnu.org/licenses/lgpl-3.0.html), also included
in *LICENSE* file in repository.
