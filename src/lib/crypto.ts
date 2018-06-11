import { Bytes32, Address } from './types'
import { randomBytes } from 'crypto'
const keccak = require('keccak')
const secp256k1 = require('secp256k1')
const blake = require('blakejs')

/**
 * computes blake2b 256bit hash of given data
 * @param data one or more Buffer | string
 */
export function blake2b256(...data: (Buffer | string)[]) {
    let ctx = blake.blake2bInit(32, null)
    data.forEach(d => {
        if (Buffer.isBuffer(d))
            blake.blake2bUpdate(ctx, d)
        else
            blake.blake2bUpdate(ctx, Buffer.from(d, 'utf8'))
    })
    return new Bytes32(Buffer.from(blake.blake2bFinal(ctx)))
}

/**
 * computes keccak256 hash of given data
 * @param data one or more Buffer | string
 */
export function keccak256(...data: (Buffer | string)[]) {
    let h = keccak('keccak256')
    data.forEach(d => {
        if (Buffer.isBuffer(d))
            h.update(d)
        else
            h.update(Buffer.from(d, 'utf8'))
    })
    return new Bytes32(h.digest())
}

/** Secp256k1 methods set */
export namespace Secp256k1 {
    /** generate private key  */
    export function generatePrivateKey() {
        for (; ;) {
            let privKey = randomBytes(32)
            if (secp256k1.privateKeyVerify(privKey)) {
                return new Bytes32(privKey)
            }
        }
    }

    /**
     * derive public key(uncompressed) from private key
     * @param privKey the private key
     */
    export function derivePublicKey(privKey: Bytes32) {
        return secp256k1.publicKeyCreate(privKey.bytes, false /* uncompressed */) as Buffer
    }

    /**
     * derive Address from public key
     * @param pubKey the public key
     */
    export function deriveAddress(pubKey: Buffer) {
        return new Address(keccak256(pubKey.slice(1)).bytes)
    }

    /**
     * sign a message using elliptic curve algorithm on the curve secp256k1
     * @param msgHash hash of message
     * @param privKey serialized private key
     */
    export function sign(msgHash: Bytes32, privKey: Bytes32) {
        let sig = secp256k1.sign(msgHash.bytes, privKey.bytes)
        let packed = Buffer.alloc(65)
        sig.signature.copy(packed)
        packed[64] = sig.recovery
        return packed
    }

    /**
     * recovery signature to public key
     * @param msgHash hash of message
     * @param sig signature
     */
    export function recover(msgHash: Bytes32, sig: Buffer) {
        if (sig.length != 65)
            throw new Error('invalid signature')
        let recovery = sig[64]
        if (recovery !== 0 && recovery !== 1)
            throw new Error('invalid signature recovery')

        return secp256k1.recover(msgHash.bytes, sig.slice(0, 64), recovery, false) as Buffer
    }
}

