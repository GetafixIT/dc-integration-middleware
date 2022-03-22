import _, { Dictionary } from 'lodash'
import { nanoid } from 'nanoid'
import { sleep } from '../util'

export interface CodecGenerator {
    SchemaURI: string
    getInstance: (config: CodecConfiguration) => Promise<Codec>
}

export interface CodecConfiguration {
    _meta?: {
        deliveryKey?: string
        deliveryId: string
        schema: string
    }
}

export abstract class Codec {
    config: CodecConfiguration
    codecId: string = nanoid(8)

    constructor(config: CodecConfiguration) {
        this.config = config
    }
}

const codecTypes: Dictionary<CodecGenerator> = {}
const cachedCodecs: Dictionary<Codec> = {}

export const registerCodec = (codec: CodecGenerator) => {
    console.log(`[ aria ] register codec ${codec.SchemaURI}`)
    codecTypes[codec.SchemaURI] = codec
}

let codecLoadingState = 0
export const getCodec = async (config: CodecConfiguration): Promise<any> => {
    if (codecLoadingState === 0) { // not loaded
        codecLoadingState = 1
        registerCodec(await (await import('./codecs/rest')).default)
        registerCodec(await (await import('./codecs/commercetools')).default)
        registerCodec(await (await import('./codecs/elasticpath')).default)
        codecLoadingState = 2
    }
    else if (codecLoadingState === 1) { // actively loading
        await sleep(100)
        return await getCodec(config)
    }

    let deliveryId = config?._meta?.deliveryId || ''
    if (!cachedCodecs[deliveryId]) {
        let codecGenerator: CodecGenerator = codecTypes[config?._meta?.schema]
        if (!codecGenerator) {
            throw `[ aria ] no codecs found matching schema [ ${JSON.stringify(config)} ]`
        }
        cachedCodecs[deliveryId] = await codecGenerator.getInstance(config)
    }
    return cachedCodecs[deliveryId]
}