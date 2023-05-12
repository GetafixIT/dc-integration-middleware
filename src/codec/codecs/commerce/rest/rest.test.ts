import { Request, MockFixture, massMock } from '../../../../common/test/rest-mock'
import axios from 'axios'
import { CommerceCodec } from '../../core'
import RestCommerceCodecType, { RestCommerceCodec } from '.'
import { config } from './test/config'
import { categories, childCategories, groups, products, restProduct, rootCategory } from './test/responses'
import { categoryRequest, customerGroupRequest, productRequest, translationsRequest } from './test/requests'
import { flattenConfig } from '../../../../common/util'
import { PaginationArgs } from '@/common'

jest.mock('axios')

const restRequests: MockFixture = {
	get: {
		[config.codec_params.categoryURL]: {
			data: categories
		},
		[config.codec_params.productURL]: {
			data: products
		},
		[config.codec_params.customerGroupURL]: {
			data: groups
		},
		[config.codec_params.translationsURL]: {
			data: []
		},	
	}
}

describe('rest integration', function() {
	let codec: CommerceCodec
	let requests: Request[]

	beforeEach(async () => {
		jest.resetAllMocks()

		requests = []

		massMock(axios, requests, restRequests)

		codec = new RestCommerceCodec(flattenConfig(config))
		await codec.init(new RestCommerceCodecType())
	})

	test('getProduct', async () => {
		const result = await codec.getProduct({
			id: 'rootProduct'
		})

		expect(requests).toEqual([
			categoryRequest,
			productRequest,
			customerGroupRequest,
			translationsRequest
		])

		expect(result).toEqual(restProduct('rootProduct', 'A product in the root', rootCategory))
	})

	test('getProducts (multiple)', async () => {
		const result = await codec.getProducts({
			productIds: 'rootProduct,catProduct1,cat2Product3'
		})

		expect(requests).toEqual([
			categoryRequest,
			productRequest,
			customerGroupRequest,
			translationsRequest
		])

		expect(result).toEqual([
			restProduct('rootProduct', 'A product in the root', rootCategory),
			restProduct('catProduct1', 'A product in the first category', childCategories[0]),
			restProduct('cat2Product3', 'A third product in the second category', childCategories[1])
		])
	})

	test('getProducts (keyword)', async () => {
		const result = await codec.getProducts({
			keyword: 'second product'
		})

		expect(requests).toEqual([
			categoryRequest,
			productRequest,
			customerGroupRequest,
			translationsRequest
		])

		expect(result).toEqual([
			restProduct('catProduct2', 'A second product in the first category', childCategories[0]),
			restProduct('cat2Product2', 'A second product in the second category', childCategories[1])
		])
	})

	test('getProducts (category)', async () => {
		const products = await codec.getProducts({ category: childCategories[1] })

		expect(requests).toEqual([
			categoryRequest,
			productRequest,
			customerGroupRequest,
			translationsRequest
		])

		expect(products).toEqual([
			restProduct('cat2Product1', 'A product in the second category', childCategories[1]),
			restProduct('cat2Product2', 'A second product in the second category', childCategories[1]),
			restProduct('cat2Product3', 'A third product in the second category', childCategories[1])
		])
	})

	test('getProducts paginated (keyword)', async () => {
		const args = {
			keyword: 'second product',

			pageNum: 1,
			pageSize: 1,
			pageCount: 1
		} as PaginationArgs

		const result = await codec.getProducts(args)

		expect(requests).toEqual([
			categoryRequest,
			productRequest,
			customerGroupRequest,
			translationsRequest
		])

		expect(args.total).toEqual(2)

		expect(result).toEqual([
			restProduct('cat2Product2', 'A second product in the second category', childCategories[1])
		])
	})

	test('getProducts paginated (category)', async () => {
		const args = {
			category: childCategories[1],

			pageNum: 1,
			pageSize: 1,
			pageCount: 1
		} as PaginationArgs

		const products = await codec.getProducts(args)

		expect(requests).toEqual([
			categoryRequest,
			productRequest,
			customerGroupRequest,
			translationsRequest
		])

		expect(args.total).toEqual(3)

		expect(products).toEqual([
			restProduct('cat2Product2', 'A second product in the second category', childCategories[1])
		])
	})

	test('getProduct (missing)', async () => {
		await expect(codec.getProduct({
			id: 'MissingID'
		})).resolves.toBeNull()

		expect(requests).toEqual([
			categoryRequest,
			productRequest,
			customerGroupRequest,
			translationsRequest
		])
	})

	test('getProducts (multiple, one missing)', async () => {
		const result = await codec.getProducts({
			productIds: 'rootProduct,NotHere,cat2Product3'
		})

		expect(requests).toEqual([
			categoryRequest,
			productRequest,
			customerGroupRequest,
			translationsRequest
		])

		expect(result).toEqual([
			restProduct('rootProduct', 'A product in the root', rootCategory),
			null,
			restProduct('cat2Product3', 'A third product in the second category', childCategories[1])
		])
	})

	test('getRawProducts', async () => {
		const result = await codec.getRawProducts({
			productIds: 'rootProduct'
		})

		expect(requests).toEqual([
			categoryRequest,
			productRequest,
			customerGroupRequest,
			translationsRequest
		])

		expect(result).toEqual([restProduct('rootProduct', 'A product in the root', rootCategory)])
	})

	test('getRawProducts, (multiple, one missing)', async () => {
		const result = await codec.getRawProducts({
			productIds: 'rootProduct,NotHere,cat2Product3'
		})

		expect(requests).toEqual([
			categoryRequest,
			productRequest,
			customerGroupRequest,
			translationsRequest
		])

		expect(result).toEqual([
			restProduct('rootProduct', 'A product in the root', rootCategory),
			null,
			restProduct('cat2Product3', 'A third product in the second category', childCategories[1])
		])
	})

	test('getCategory', async () => {
		const category = await codec.getCategory({ slug: 'child1-cat' })

		expect(requests).toEqual([
			categoryRequest,
			productRequest,
			customerGroupRequest,
			translationsRequest
		])

		expect(category).toEqual(childCategories[0])
	})

	test('getCategoryTree', async () => {
		const categoryTree = await codec.getCategoryTree({})

		expect(requests).toEqual([
			categoryRequest,
			productRequest,
			customerGroupRequest,
			translationsRequest
		])

		expect(categoryTree).toEqual([rootCategory])
	})

	test('getCustomerGroups', async () => {
		const customerGroups = await codec.getCustomerGroups({})

		expect(requests).toEqual([
			categoryRequest,
			productRequest,
			customerGroupRequest,
			translationsRequest
		])

		expect(customerGroups).toEqual(groups)
	})
})