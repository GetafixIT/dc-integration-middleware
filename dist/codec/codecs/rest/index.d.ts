import { CodecConfiguration, CommerceCodec } from '../..';
export interface RestCommerceCodecConfig extends CodecConfiguration {
    productURL: string;
    categoryURL: string;
    customerGroupURL: string;
    translationsURL: string;
}
declare const restCodec: CommerceCodec;
export default restCodec;
