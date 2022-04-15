"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAuthRestClient = void 0;
const axios_1 = __importDefault(require("axios"));
const util_1 = require("../util");
const qs_1 = __importDefault(require("qs"));
const cache = {};
const OAuthRestClient = ({ api_url, auth_url }) => {
    let authenticatedAxios;
    const authenticate = (payload, config = {}) => __awaiter(void 0, void 0, void 0, function* () {
        let response = yield axios_1.default.post(auth_url, qs_1.default.stringify(payload), config);
        const auth = response.data;
        authenticatedAxios = axios_1.default.create({
            baseURL: api_url,
            headers: {
                Authorization: `${auth.token_type} ${auth.access_token}`
            }
        });
        setTimeout(() => { authenticate(payload, config); }, auth.expires_in * 999);
    });
    const get = (config) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let response = yield authenticatedAxios.get(config.url, config);
            return response.data;
        }
        catch (error) {
            if (error.response.status === 429) {
                yield (0, util_1.sleep)(1000);
                // console.log(`[ get ] ${apiUrl}${config.url} [ rate limited ]`)
                return yield get(config);
            }
            else if (error.response.status === 404) {
                // don't throw on a 404 just return an empty result set
                return { data: undefined };
            }
            if (error.stack) {
                console.log(error.stack);
            }
            console.log(`Error while getting URL [ ${config.url} ]: ${error.message} ${error.code}`);
        }
    });
    return {
        authenticate,
        get
    };
};
exports.OAuthRestClient = OAuthRestClient;
exports.default = exports.OAuthRestClient;
