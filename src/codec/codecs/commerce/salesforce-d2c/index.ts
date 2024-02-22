import {
	Category,
	ClientCredentialProperties,
	ClientCredentialsConfiguration,
	CommerceAPI,
	GetProductsArgs,
	Product,
	PaginationArgs
} from '../../../../common'
import { CodecPropertyConfig, CommerceCodecType, CommerceCodec } from '../../core'
import { StringProperty } from '../../../cms-property-types'
import axios from 'axios'
import {
	FetchParams,
	SalesforceD2CAxiosResp,
	SalesforceD2CCategoryResp,
	SalesforceD2CProductResp,
} from './types'
import slugify from 'slugify'
import { getPageByQuery, getPageByQueryAxios } from '../../pagination'
import { getProductsArgError, logResponse } from '../../common'
import { CodecErrorType, catchAxiosErrors } from '../../codec-error'
import qs from 'qs'

/**
 * Salesforce D2C Codec config properties.
 */
type CodecConfig = ClientCredentialsConfiguration & {
	client_id: StringProperty
	client_secret: StringProperty
	instance: StringProperty
	webstoresId: StringProperty
	buyerId: StringProperty
	version?: StringProperty
}

/**
 * Commerce Codec Type that integrates with Salesforce D2C.
 */
export class SalesforceD2CCommerceCodecType extends CommerceCodecType {
	/**
	 * @inheritdoc
	 */
	get vendor(): string {
		return 'salesforce-d2c'
	}

	/**
	 * @inheritdoc
	 */
	get properties(): CodecConfig {
		return {
			...ClientCredentialProperties,
			instance: {
				title: 'Shopper API Token',
				type: 'string',
				maxLength: 100
			},
			webstoresId: {
				title: 'Site ID',
				type: 'string'
			},
			buyerId: {
				title: 'Site ID',
				type: 'string'
			}
		}
	}

	/**
	 * @inheritdoc
	 */
	async getApi(config: CodecPropertyConfig<CodecConfig>): Promise<CommerceAPI> {
		return await new SalesforceD2CCommerceCodec(config).init(this)
	}

	/**
	 * @inheritdoc
	 */
	async postProcess(config: CodecConfig): Promise<CodecConfig> {
		// apply any postprocessing required
		return {
			...config
		}
	}
}

/**
 * Map an Salesforce D2C category to the common category type.
 * @param category Salesforce D2C category
 * @returns Category
 */
const mapCategory = (category: SalesforceD2CCategoryResp): Category => {
	return {
		id: category.id,
		name: category.fields.Name,
		slug: category.fields.Name,
		children: category.categories?.map(mapCategory) || [],
		products: [],
		showInMenu: category.fields.IsNavigational === 'true'
	}
}

/**
 * Map an Salesforce D2C product to the common product type.
 * @param product Salesforce D2C product
 * @returns Product
 */
const mapProduct = (product: SalesforceD2CProductResp | null): Product => {
	if (!product) {
		return null
	}

	const images = [{url: product?.defaultImage?.url}]
	return {
		id: product.id,
		name: product?.fields?.Name,
		slug: slugify(product?.fields?.Name, { lower: true }),
		shortDescription: product?.fields?.Item_Short_Description__c,
		longDescription: product?.fields?.Item_Long_Description__c,
		categories: [],
		variants: [
			{
				id: product.id,
				sku: product.id,
				listPrice: null,
				salePrice: null,
				images,
				attributes: {}
			}
		]
	}
}

/**
 * Commerce Codec that integrates with Salesforce D2C.
 */
export class SalesforceD2CCommerceCodec extends CommerceCodec {
	declare config: CodecPropertyConfig<CodecConfig>

	shopApi: string
	sitesApi: string
	authApi: string
	version: string

	getPage = getPageByQuery('start', 'count', 'total', 'data')
	getPageAxios = getPageByQueryAxios('start', 'count', 'total', 'hits', 'get')

	/**
	 * @inheritdoc
	 */
	async init(codecType: CommerceCodecType): Promise<CommerceCodec> {
		const baseApiUrl = `https://${this.config.instance}.my.salesforce.com`
		this.version = this.config?.version || 'v60.0'
		this.shopApi = `${baseApiUrl}/services/data/${this.version}/commerce/webstores/${this.config.webstoresId}`
		this.authApi = `${baseApiUrl}/services/oauth2/token`

		return await super.init(codecType)
	}

	/**
	 * @inheritdoc
	 */
	async cacheCategoryTree(): Promise<void> {
		const {Authorization} = await this.authenticate()
		const categories = (await this.fetch({
			url: `${this.shopApi}/product-categories/children`,
			headers: {Authorization
			}
		})).productCategories

		this.categoryTree = categories
			.filter((cat) => cat.fields.ParentCategoryId === null)
			.map(mapCategory)
	}

	/**
	 * Fetches data from the unauthenticated axios client.
	 * @param url URL to fetch data from
	 * @param method method to fetch data with
	 * @param headers headers object for request
	 * @param params params object for request
	 * @param data data object for post requests
	 * @returns Response data
	 */
	async fetch({url, method = 'get', headers = {}, params, data = {}}: FetchParams): Promise<SalesforceD2CAxiosResp['data']> {
		return logResponse(method, url, (await catchAxiosErrors(async () =>
			await axios({url, method, headers, params, data})
		)).data)
	}

	/**
	 * Fetches an access token
	 * @returns Response data
	 */
	async authenticate(): Promise<{Authorization: string}> {
		const data = qs.stringify({
			client_id: this.config.client_id,
			client_secret: this.config.client_secret,
			grant_type: 'client_credentials'
		})
		const {data: {access_token}} = await axios.post(this.authApi, data, {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		})
		return {Authorization: `Bearer ${access_token}`}
	}

	/**
	 * Gets an Salesforce D2C product by ID.
	 * @param productId Product ID to fetch
	 * @returns Salesforce D2C product
	 */
	async getProductById(productId: string): Promise<Product | null> {
		try {
			const {Authorization} = await this.authenticate()
			const productResp = await this.fetch(
				{
					url: `${this.shopApi}/products/${productId}`,
					headers: {
						Authorization
					}
				}
			)
			return mapProduct(productResp)
		} catch (e) {
			if (e.type === CodecErrorType.NotFound) {
				return null
			}

			throw e
		}
	}

	async getProductsByIds(productIds: string): Promise<Product[] | null> {
		try {
			const {Authorization} = await this.authenticate()
			return (await this.fetch(
				{url: `${this.shopApi}/products?ids=${productIds}`, headers: {Authorization}}
			)).products.map(mapProduct)

		} catch (e) {
			if (e.type === CodecErrorType.NotFound) {
				return null
			}

			throw e
		}
	}

	/**
	 * Lists Salesforce D2C products for a given search query.
	 * @param query Search query
	 * @param args Pagination arguments, new cursor and offset is written back into the object.
	 * @param scope String representing the scope of the search 'keyword' or 'category' defaults to 'keyword'
	 * @returns List of Salesforce D2C products
	 */
	async search(query: string, args: PaginationArgs, scope: 'keyword' | 'category' = 'keyword'): Promise<Product[]> {


		const {Authorization} = await this.authenticate()

		// const searchResults = await paginateArgs<any>(this.getPageAxios(axios, `${this.shopApi}/search/product-search`, {method: 'post', params: {searchTerm}, headers: {Authorization}}), args, 200)

		const data = {
			...(scope === 'keyword' ? {searchTerm: query}: {}),
			...(scope === 'category' ? {categoryId: query}: {})
		}

		const searchResults = (await this.fetch({
			url: `${this.shopApi}/search/product-search`,
			method: 'post',
			headers: {Authorization}, data}
		)).productsPage.products.map(({id}) => id).join(',')

		if (searchResults) {
			return await this.getProductsByIds(searchResults)
		}
		return []
	}

	/**
	 * @inheritdoc
	 */
	async getRawProducts(args: GetProductsArgs, method = 'getRawProducts'): Promise<Product[]> {
		let products = []

		if (args.productIds && args.productIds === '') {
			products = []
		} else if (args.productIds) {
			products = await this.getProductsByIds(args.productIds)
		} else if (args.keyword) {
			products = await this.search(args.keyword, args)
		} else if (args.category) {
			products = await this.search(args.category.id, args, 'category')
		} else {
			throw getProductsArgError(method)
		}

		return products
	}

	/**
	 * @inheritdoc
	 */
	async getProducts(args: GetProductsArgs): Promise<Product[]> {
		return await this.getRawProducts(args, 'getProducts')
	}
}

export default SalesforceD2CCommerceCodecType
// registerCodec(new SalesforceD2CCommerceCodecType())
