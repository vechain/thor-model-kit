import { Address, BigInt, Bytes32 } from './types'
import { blake2b256, Secp256k1 } from './crypto'
const rlp = require('rlp')

/**
 * Transaction class defines VeChainThor's multi-clause transaction.
 */
export class Transaction {
    /** body of transaction */
    readonly body: Transaction.Body

    /** signature to transaction */
    signature?: Buffer

    /**
     * construct a transaction object with given body
     * @param body 
     */
    constructor(body: Transaction.Body) {
        validateBody(body)
        this.body = body
    }

    /** returns hash for signing */
    get signingHash() {
        let data = rlp.encode(this.rlpList)
        return blake2b256(data)
    }

    /**
     * returns transaction ID
     * empty ID returned if something wrong (e.g. invalid signature)
     */
    get id() {
        try {
            return blake2b256(
                this.signingHash.bytes,
                this.signer.bytes,
            )
        } catch{
            return new Bytes32(Buffer.alloc(0))
        }
    }

    /** returns signer */
    get signer() {
        if (!this.signature)
            throw new Error('signature missing')
        let pubKey = Secp256k1.recover(this.signingHash, this.signature)
        return Secp256k1.deriveAddress(pubKey)
    }

    /** returns intrinsic gas it takes */
    get intrinsicGas() {
        const txGas = 5000
        const clauseGas = 16000
        const clauseGasContractCreation = 48000

        if (this.body.clauses.length === 0)
            return txGas + clauseGas

        return this.body.clauses.reduce((sum, c) => {
            if (c.to)
                sum += clauseGas
            else
                sum += clauseGasContractCreation
            sum += dataGas(c.data)
            return sum
        }, txGas)
    }

    /**
     * returns absolute gas price according to base gas price
     * @param baseGasPrice 
     */
    gasPrice(baseGasPrice: BigInt) {
        let bgp = baseGasPrice.toBigNumber()
        let extra = bgp
            .multipliedBy(this.body.gasPriceCoef)
            .dividedToIntegerBy(0xff)

        return BigInt.from(bgp.plus(extra))
    }

    /** encode into Buffer */
    encode() {
        if (!this.signature)
            throw new Error('signature missing')

        let list = this.rlpList
        list.push(this.signature)
        return rlp.encode(list) as Buffer
    }

    /** decode from Buffer to transaction */
    static decode(raw: Buffer) {
        let list = decodeList(rlp.decode(raw), 10)

        let tx = new Transaction({
            chainTag: decodeNumber(list[0]),
            blockRef: decodeBlockRef(list[1]),
            expiration: decodeNumber(list[2]),
            clauses: decodeClauses(list[3]),
            gasPriceCoef: decodeNumber(list[4]),
            gas: decodeBigInt(list[5]),
            dependsOn: decodeBytes32OrNull(list[6]),
            nonce: decodeBigInt(list[7]),
            reserved: decodeList(list[8])
        })
        tx.signature = decodeBuffer(list[9])
        return tx
    }

    private get rlpList() {
        let body = this.body
        return [
            body.chainTag,
            new BigInt(body.blockRef).bytes,
            body.expiration,
            body.clauses.map(clause => [
                clause.to ? clause.to.bytes : '',
                clause.value.bytes,
                clause.data,
            ]),
            body.gasPriceCoef,
            body.gas.bytes,
            body.dependsOn ? body.dependsOn.bytes : '',
            body.nonce.bytes,
            body.reserved,
        ]
    }
}

export namespace Transaction {
    /** clause type */
    export type Clause = {
        /** 
         * destination address where transfer token to, or invoke contract method on.
         * set null destination to deploy a contract.
         */
        to: Address | null

        /** amount of token to transfer to the destination */
        value: BigInt

        /** input data for contract method invocation or deployment */
        data: Buffer
    }

    /** body type */
    export type Body = {
        /** last byte of genesis block ID */
        chainTag: number
        /** 8 bytes prefix of some block's ID */
        blockRef: Buffer
        /** constraint of time bucket */
        expiration: number
        /** array of clauses */
        clauses: Clause[]
        /** coef applied to base gas price [0,255] */
        gasPriceCoef: number
        /** max gas provided for execution */
        gas: BigInt
        /** ID of another tx that is depended */
        dependsOn: Bytes32 | null
        /** nonce value for various purposes */
        nonce: BigInt
        /** reserved fields, must be empty */
        reserved: any[]
    }
}

function decodeClauses(data: any) {
    return decodeList(data).map<Transaction.Clause>(v => {
        let clauseData = decodeList(v, 3)
        return {
            to: decodeAddressOrNull(clauseData[0]),
            value: new BigInt(decodeBuffer(clauseData[1])),
            data: decodeBuffer(clauseData[2])
        }
    })
}

function validateBody(body: Transaction.Body) {
    mustUintN(body.chainTag, 8, 'chainTag: must be uint8')
    mustUintN(body.expiration, 32, 'expiration: must be uint32')
    mustUintN(body.gasPriceCoef, 8, 'gasPriceCoef: must be uint8')
    mustUintN(body.gas, 64, 'gas: must be uint64')
    mustUintN(body.nonce, 64, 'nonce: must be uint64')

    if (body.blockRef.length != 8)
        throw new Error('blockRef: must be 8 bytes')
}

function mustUintN(num: number | BigInt, bits: number, msg: string) {
    if (typeof num === 'number') {
        if (!Number.isInteger(num) || num < 0 || num >= 2 ** bits)
            throw new Error(msg)
    } else {
        if (num.bytes.length * 8 > bits)
            throw new Error(msg)
    }
}

function decodeBigInt(data: any) {
    let buf = decodeBuffer(data)
    let bi = new BigInt(buf)
    if (bi.bytes.length != buf.length)
        throw new Error('non-canonical integer (leading zero bytes) for integer')
    return bi
}
function decodeNumber(data: any) {
    let bi = decodeBigInt(data)
    if (bi.bytes.length * 8 > 53)
        throw new Error('unable to safely decode to number')

    return bi.toBigNumber().toNumber()
}

function decodeBuffer(data: any) {
    if (!Buffer.isBuffer(data))
        throw new Error('buffer expected')
    return data
}

function decodeBytes32OrNull(data: any) {
    let buf = decodeBuffer(data)
    if (buf.length == 0)
        return null
    if (buf.length != 32)
        throw new Error('bytes32 expected')
    return new Bytes32(buf)
}

function decodeList(data: any, elemCount?: number) {
    if (!Array.isArray(data))
        throw new Error('list expected')

    if (elemCount !== undefined) {
        if (data.length !== elemCount)
            throw new Error('list element count incorrect')
    }
    return data
}

function decodeAddressOrNull(data: any) {
    let buf = decodeBuffer(data)
    if (buf.length == 0)
        return null
    if (buf.length != 20)
        throw new Error('address expected')

    return new Address(buf)
}

function decodeBlockRef(data: any) {
    let bi = decodeBigInt(data)
    if (bi.bytes.length > 8)
        throw new Error('blockRef: too long')
    let buf = Buffer.alloc(8)
    bi.bytes.copy(buf, buf.length - bi.bytes.length)
    return buf
}

function dataGas(data: Buffer) {
    const zgas = 4
    const nzgas = 68

    return data.reduce((sum, cur) => {
        if (cur)
            return sum + nzgas
        return sum + zgas
    }, 0)
}