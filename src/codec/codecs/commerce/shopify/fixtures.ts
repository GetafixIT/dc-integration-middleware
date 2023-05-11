import { MockFixture, dataToResponse } from '../../../../common/test/rest-mock'
import { 
	shopifyCategories, 
	shopifySegments, 
	shopifyProduct, 
	shopifyProductsByKeyword, 
	shopifyCategoryProducts, 
	shopifyProductsByKeywordCursor,
	shopifyCategoryProductsCursor
} from './test/responses'
import { 
	collectionsRequest, 
	productRequest, 
	productsByCategoryCursor, 
	productsByCategoryRequest 
} from './test/requests'

export const commerceProductRequests: MockFixture = {
	post: {
		'https://site_id.myshopify.com/api/version/graphql.json': dataToResponse([
			{
				data: productRequest('ExampleID').config.data,
				response: {
					data: shopifyProduct('ExampleID')
				}
			},
			{
				data: productRequest('ExampleID2').config.data,
				response: {
					data: shopifyProduct('ExampleID2')
				}
			},
			{
				data: productRequest('MissingID').config.data,
				response: {
					data: {
						data: {
							product: null
						}
					}
				}
			}
		])
	}
}

export const commerceProductMissingRequests: MockFixture = {
	post: {
		'https://site_id.myshopify.com/api/version/graphql.json': {
			data: {
				data: {
					product: null
				}
			}
		}
	}
}

export const commerceProductsByKeywordRequests: MockFixture = {
	post: {
		'https://site_id.myshopify.com/api/version/graphql.json': {
			data: shopifyProductsByKeyword
		}
	}
}

export const commerceProductsByKeywordCursorRequests: MockFixture = {
	post: {
		'https://site_id.myshopify.com/api/version/graphql.json': {
			data: shopifyProductsByKeywordCursor
		}
	}
}

export const commerceProductsByCategoryRequests: MockFixture = {
	post: {
		'https://site_id.myshopify.com/api/version/graphql.json': dataToResponse([
			{
				data: collectionsRequest.config.data,
				response: {
					data: shopifyCategories
				}
			},
			{
				data: productsByCategoryRequest.config.data,
				response: {
					data: shopifyCategoryProducts
				}
			}
		])
	}
}

export const commerceProductsByCategoryCursorRequests: MockFixture = {
	post: {
		'https://site_id.myshopify.com/api/version/graphql.json': dataToResponse([
			{
				data: collectionsRequest.config.data,
				response: {
					data: shopifyCategories
				}
			}, 
			{
				data: productsByCategoryCursor.config.data,
				response: {
					data: shopifyCategoryProductsCursor
				}
			}
		])
	}
}

export const commerceSegmentsRequests: MockFixture = {
	post: {
		'https://site_id.myshopify.com/admin/api/version/graphql.json': {
			data: shopifySegments
		}
	}
}

export const commerceCollectionsRequests: MockFixture = {
	post: {
		'https://site_id.myshopify.com/api/version/graphql.json': {
			data: shopifyCategories
		}
	}
}