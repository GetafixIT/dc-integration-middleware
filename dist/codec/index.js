"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
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
exports.getCommerceCodec = exports.defaultArgs = exports.getCodec = exports.registerCodec = exports.getCodecs = exports.getRandom = exports.CommerceCodec = exports.CodecTestOperationType = exports.CommerceCodecType = exports.CodecType = exports.CodecTypes = void 0;
const lodash_1 = __importDefault(require("lodash"));
const __1 = require("..");
const errors_1 = require("../common/errors");
/**
 * Types of codec.
 */
var CodecTypes;
(function (CodecTypes) {
    CodecTypes[CodecTypes["commerce"] = 0] = "commerce";
})(CodecTypes = exports.CodecTypes || (exports.CodecTypes = {}));
/**
 * Codec base class. Defines methods and fields a codec must have.
 */
class CodecType {
    /**
     * The type of this codec.
     */
    get type() {
        return this._type;
    }
    /**
     * The vendor associated with this codec.
     */
    get vendor() {
        return this._vendor;
    }
    /**
     * The schema URI for this codec.
     */
    get schemaUri() {
        return `${__1.CONSTANTS.demostoreIntegrationUri}/${this.vendor}`;
    }
    /**
     * The label for this codec.
     */
    get label() {
        return `${this.vendor} integration`;
    }
    /**
     * The Icon URL that represents this codec.
     */
    get iconUrl() {
        return `https://demostore-catalog.s3.us-east-2.amazonaws.com/assets/${this.vendor}.png`;
    }
    /**
     * The JSON schema that represents the codec's configuration.
     */
    get schema() {
        return {
            properties: this.properties
        };
    }
    /**
     * The properties that represent the codec configuration in JSON schema format.
     */
    get properties() {
        return this._properties;
    }
    /**
     * Get an API for this codec with the given configuration.
     * @param config Configuration for the API.
     */
    getApi(config) {
        throw new Error('must implement getCodec');
    }
    /**
     * Process the config in a codec specific way.
     * @param config Input configuration.
     * @returns Processed configuration.
     */
    // novadev-582 Update SFCC codec to use client_id and client_secret to generate the api token if it doesn't exist
    postProcess(config) {
        return __awaiter(this, void 0, void 0, function* () {
            return config;
        });
    }
}
exports.CodecType = CodecType;
/**
 * Commerce type codec base class. Defines methods and fields a commerce codec must have.
 */
class CommerceCodecType extends CodecType {
    /**
     * The type of this codec. (commerce)
     */
    get type() {
        return CodecTypes.commerce;
    }
    /**
     * Get an API for this codec with the given configuration.
     * @param config Configuration for the API.
     */
    getApi(config) {
        throw new Error('must implement getCodec');
    }
}
exports.CommerceCodecType = CommerceCodecType;
/**
 * Codec operations for testing.
 */
var CodecTestOperationType;
(function (CodecTestOperationType) {
    CodecTestOperationType[CodecTestOperationType["megaMenu"] = 0] = "megaMenu";
    CodecTestOperationType[CodecTestOperationType["getCategory"] = 1] = "getCategory";
    CodecTestOperationType[CodecTestOperationType["getProductById"] = 2] = "getProductById";
    CodecTestOperationType[CodecTestOperationType["getProductsByKeyword"] = 3] = "getProductsByKeyword";
    CodecTestOperationType[CodecTestOperationType["getProductsByProductIds"] = 4] = "getProductsByProductIds";
    CodecTestOperationType[CodecTestOperationType["getCustomerGroups"] = 5] = "getCustomerGroups";
})(CodecTestOperationType = exports.CodecTestOperationType || (exports.CodecTestOperationType = {}));
/**
 * Base class for an implementation of a Commerce API.
 */
class CommerceCodec {
    /**
     * Create a new Commerce API implementation, given an input configuration.
     * @param config API configuration
     */
    constructor(config) {
        this.megaMenu = [];
        this.config = config;
    }
    /**
     * Initilize the commerce codec.
     * @param codecType The codec type for this API.
     * @returns The commerce codec
     */
    init(codecType) {
        return __awaiter(this, void 0, void 0, function* () {
            const startInit = new Date().valueOf();
            yield this.cacheMegaMenu();
            this.initDuration = new Date().valueOf() - startInit;
            this.codecType = codecType;
            if (this.megaMenu.length === 0) {
                throw new errors_1.IntegrationError({
                    message: 'megaMenu has no categories, cannot build navigation',
                    helpUrl: ''
                });
            }
            return this;
        });
    }
    /**
     * Find a category with a given slug.
     * @param slug Slug to locate a category for
     * @returns Category matching the slug
     */
    findCategory(slug) {
        return (0, __1.findInMegaMenu)(this.megaMenu, slug);
    }
    /**
     * Cache the mega menu.
     */
    cacheMegaMenu() {
        return __awaiter(this, void 0, void 0, function* () {
            this.megaMenu = [];
        });
    }
    /**
     * Get a single product by ID.
     * @param args Arguments object
     * @returns Single product
     */
    // defined in terms of getProducts()
    getProduct(args) {
        return __awaiter(this, void 0, void 0, function* () {
            return lodash_1.default.first(yield this.getProducts(Object.assign(Object.assign({}, args), { productIds: args.id })));
        });
    }
    /**
     * Gets products by a list of IDs or a filter.
     * @param args Arguments object
     * @returns List of products
     */
    getProducts(args) {
        return __awaiter(this, void 0, void 0, function* () {
            console.warn(`getProducts is not supported on platform [ ${this.codecType.vendor} ]`);
            return [];
        });
    }
    /**
     * Gets a category that matches the given slug, with contained products.
     * @param args Arguments object
     * @returns Category object
     */
    // defined in terms of getMegaMenu, effectively
    getCategory(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const category = this.findCategory(args.slug);
            category.products = yield this.getProducts(Object.assign(Object.assign({}, args), { category }));
            return category;
        });
    }
    /**
     * Gets the mega menu for the current configuration.
     * @param args Arguments object
     * @returns Mega Menu
     */
    getMegaMenu(args) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.megaMenu;
        });
    }
    /**
     * Gets customer groups for the current configuration.
     * @param args Arguments object
     * @returns List of customer groups
     */
    getCustomerGroups(args) {
        return __awaiter(this, void 0, void 0, function* () {
            console.warn(`getCustomerGroups is not supported on platform [ ${this.codecType.vendor} ]`);
            return [];
        });
    }
    /**
     * Gets variants for the given product, by ID.
     * @param args Arguments object
     * @returns Product with variants
     */
    getVariants(args) {
        return __awaiter(this, void 0, void 0, function* () {
            console.warn(`getVariants is not supported on platform [ ${this.codecType.vendor} ]`);
            return null;
        });
    }
    /**
     * Gets products by a list of IDs or a filter, in their original format.
     * @param args Arguments object
     * @returns List of products in their original format
     */
    getRawProducts(args) {
        return __awaiter(this, void 0, void 0, function* () {
            console.warn(`getRawProducts is not supported on platform [ ${this.codecType.vendor} ]`);
            return [];
        });
    }
    /**
     * Test the various methods of this integration and provide a report.
     * @returns A report of all test results.
     */
    testIntegration() {
        return __awaiter(this, void 0, void 0, function* () {
            const results = [{
                    operationType: CodecTestOperationType.megaMenu,
                    description: 'cache the megamenu',
                    arguments: '',
                    duration: this.initDuration,
                    results: this.megaMenu
                }];
            // 2: get a category by slug, which is done implicitly for all categories here
            const categories = yield Promise.all((0, __1.flattenCategories)(this.megaMenu).map((c) => __awaiter(this, void 0, void 0, function* () {
                const categoryStart = new Date().valueOf();
                const category = yield this.getCategory(c);
                results.push({
                    operationType: CodecTestOperationType.getCategory,
                    description: 'get category by slug',
                    arguments: category.slug,
                    duration: new Date().valueOf() - categoryStart,
                    results: category
                });
                return category;
            })));
            const productCategory = categories.find(cat => cat.products.length > 0);
            // 3: get a single product by id
            const singleProductStart = new Date().valueOf();
            const singleProductById = yield this.getProduct((0, exports.getRandom)(productCategory.products));
            results.push({
                operationType: CodecTestOperationType.getProductById,
                description: 'get product by id',
                arguments: singleProductById.id,
                duration: new Date().valueOf() - singleProductStart,
                results: singleProductById
            });
            // 4: search for a product
            const keywordStart = new Date().valueOf();
            const keyword = singleProductById.name.split(' ').pop();
            const searchResults = yield this.getProducts({ keyword });
            results.push({
                operationType: CodecTestOperationType.getProductsByKeyword,
                description: 'get products by search keyword',
                arguments: keyword,
                duration: new Date().valueOf() - keywordStart,
                results: searchResults
            });
            // 5: get a list of products given a list of product ids
            const prodsStart = new Date().valueOf();
            const prods = [singleProductById, ...lodash_1.default.take(searchResults, 1)];
            const productIds = prods.map(product => product.id).join(',');
            const productsByProductId = yield this.getProducts({ productIds });
            results.push({
                operationType: CodecTestOperationType.getProductsByProductIds,
                description: 'get products by product ids',
                arguments: productIds,
                duration: new Date().valueOf() - prodsStart,
                results: productsByProductId
            });
            // 6: get a list of customer groups
            const customerGroupStart = new Date().valueOf();
            const customerGroups = yield this.getCustomerGroups({});
            results.push({
                operationType: CodecTestOperationType.getCustomerGroups,
                description: 'get customer groups',
                arguments: '',
                duration: new Date().valueOf() - customerGroupStart,
                results: customerGroups
            });
            return results;
        });
    }
}
exports.CommerceCodec = CommerceCodec;
/**
 * Get a random element from the given array
 * @param array Array of choices
 * @returns A random item from the array
 */
const getRandom = (array) => array[Math.floor(Math.random() * (array.length - 1))];
exports.getRandom = getRandom;
const codecs = new Map();
codecs[CodecTypes.commerce] = [];
/**
 * Get all the codecs with a given type
 * @param type Codec type
 * @returns All registered codecs that match the type
 */
// public interface
const getCodecs = (type) => {
    return type ? codecs[type] : lodash_1.default.flatMap(codecs);
};
exports.getCodecs = getCodecs;
/**
 * Register a codec type object.
 * @param codec Codec type object
 */
const registerCodec = (codec) => {
    if (!codecs[codec.type].includes(codec)) {
        codecs[codec.type].push(codec);
    }
};
exports.registerCodec = registerCodec;
// create a cache of apis so we can init them once only, assuming some initial load time (catalog etc)
const apis = new Map();
/**
 * Mask sensitive data in an object.
 * Note: only affects fields called `client_secret`, `api_token`, `password`.
 * @param obj Object to copy with sensitive fields removed.
 * @returns The object with any sensitive fields removed.
 */
const maskSensitiveData = (obj) => {
    return Object.assign(Object.assign({}, obj), { client_secret: obj.client_secret && '**** redacted ****', api_token: obj.api_token && '**** redacted ****', password: obj.password && '**** redacted ****' });
};
/**
 * Get an API given a configuration object and a codec type.
 * It attempts to match a registered codec by the `vendor` property first, if present.
 * If not, it attempts to match based on the shape of the codec object.
 * @param config API configuration
 * @param type Type of codec to find
 * @returns A new API for the given configuration.
 */
const getCodec = (config, type) => __awaiter(void 0, void 0, void 0, function* () {
    const codecs = (0, exports.getCodecs)(type);
    let codec;
    // novadev-450: https://ampliencedev.atlassian.net/browse/NOVADEV-450
    if ('vendor' in config) {
        const vendorCodec = codecs.find(codec => codec.vendor === config.vendor);
        if (!vendorCodec) {
            throw new errors_1.IntegrationError({
                message: `codec not found for vendor [ ${config.vendor} ]`,
                helpUrl: 'https://help.dc-demostore.com/codec-error'
            });
        }
        // check that all required properties are there
        const difference = lodash_1.default.difference(Object.keys(vendorCodec.properties), Object.keys(config));
        if (difference.length > 0) {
            throw new errors_1.IntegrationError({
                message: `configuration missing properties required for vendor [ ${config.vendor} ]: [ ${difference.join(', ')} ]`,
                helpUrl: 'https://help.dc-demostore.com/codec-error'
            });
        }
        codec = vendorCodec;
    }
    // end novadev-450
    else {
        const codecsMatchingConfig = codecs.filter(c => lodash_1.default.difference(Object.keys(c.properties), Object.keys(config)).length === 0);
        if (codecsMatchingConfig.length === 0 || codecsMatchingConfig.length > 1) {
            throw new errors_1.IntegrationError({
                message: `[ ${codecsMatchingConfig.length} ] codecs found (expecting 1) matching schema:\n${JSON.stringify(maskSensitiveData(config), undefined, 4)}`,
                helpUrl: 'https://help.dc-demostore.com/codec-error'
            });
        }
        codec = codecsMatchingConfig.pop();
    }
    const configHash = lodash_1.default.values(config).join('');
    console.log(`[ demostore ] creating codec: ${codec.vendor}...`);
    return apis[configHash] = apis[configHash] || (yield codec.getApi(config));
});
exports.getCodec = getCodec;
/**
 * Default arguments for commerce codec methods.
 */
exports.defaultArgs = {
    locale: 'en-US',
    language: 'en',
    country: 'US',
    currency: 'USD',
    segment: ''
};
/**
 * Get a commerce API given a configuration object.
 * It attempts to match a registered codec by the `vendor` property first, if present.
 * If not, it attempts to match based on the shape of the codec object.
 * @param config Configuration object for the commerce API
 * @returns A new commerce API for the given configuration
 */
const getCommerceCodec = (config) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, exports.getCodec)(config, CodecTypes.commerce); });
exports.getCommerceCodec = getCommerceCodec;
// end public interface
const commercetools_1 = __importDefault(require("./codecs/commercetools"));
(0, exports.registerCodec)(new commercetools_1.default());
const rest_1 = __importDefault(require("./codecs/rest"));
(0, exports.registerCodec)(new rest_1.default());
const sfcc_1 = __importDefault(require("./codecs/sfcc"));
(0, exports.registerCodec)(new sfcc_1.default());
// reexport codec common functions
__exportStar(require("./codecs/common"), exports);
