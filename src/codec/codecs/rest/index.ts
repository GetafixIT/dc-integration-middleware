import _, { Dictionary } from 'lodash'
import { Product, Category, QueryContext, CustomerGroup, GetCommerceObjectArgs, GetProductsArgs } from '../../../types'
import { CodecConfiguration, Codec, registerCodec } from '../..'
import { CommerceAPI } from '../../..'
import mappers from './mappers'
import { findInMegaMenu } from '../common'

export interface RestCommerceCodecConfig extends CodecConfiguration {
    productURL: string
    categoryURL: string
    translationsURL: string
}

let categories: Category[] = []
let products: Product[] = []
let translations: Dictionary<Dictionary<string>> = {}

const restCodec: Codec = {
    SchemaURI: 'https://demostore.amplience.com/site/integration/rest',
    getAPI: async function (config: RestCommerceCodecConfig): Promise<CommerceAPI> {
        products = await (await fetch(config.productURL)).json()
        categories = await (await fetch(config.categoryURL)).json()
        translations = await (await fetch(config.translationsURL)).json()

        const api = {
            getProductsForCategory: (category: Category) => { 
                return _.filter(products, prod => _.includes(_.map(prod.categories, 'id'), category.id))
            },
            getProduct: (args: GetCommerceObjectArgs) => {
                return args.id && _.find(products, prod => args.id === prod.id) ||
                    args.slug && _.find(products, prod => args.slug === prod.slug)
            },
            getProducts: (args: GetProductsArgs): Product[] => {
                let productIds: string[] = args.productIds?.split(',')
                return productIds && _.filter(products, prod => productIds.includes(prod.id)) ||
                    args.keyword && _.filter(products, prod => prod.name.toLowerCase().indexOf(args.keyword) > -1)
            },
            getCategory: (args: GetCommerceObjectArgs) => {
                return api.populateCategory(findInMegaMenu(categories, args.slug))
            },
            populateCategory: (category: Category): Category => ({
                ...category,
                products: _.take(_.uniqBy([
                    ...api.getProductsForCategory(category),
                    ..._.flatMap(category.children, api.getProductsForCategory)
                ], 'slug'), 12)
            })
        }

        return {
            getProduct: async function (args: GetCommerceObjectArgs): Promise<Product> {
                let product = api.getProduct(args)
                if (product) {
                    return mappers.mapProduct(product, args)
                }
            },
            getProducts: async function (args: GetProductsArgs): Promise<Product[]> {
                let filtered: Product[] = api.getProducts(args)
                if (!filtered) {
                    throw new Error(`Products not found for args: ${JSON.stringify(args)}`)
                }
                return filtered.map(prod => mappers.mapProduct(prod, args))
            },
            getCategory: async function (args: GetCommerceObjectArgs): Promise<Category> {
                let category = api.getCategory(args)
                if (!category) {
                    throw new Error(`Category not found for args: ${JSON.stringify(args)}`)
                }
                return mappers.mapCategory(api.populateCategory(category))
            },
            getMegaMenu: async function (): Promise<Category[]> {
                return categories.filter(cat => !cat.parent).map(mappers.mapCategory)
            },
            getCustomerGroups: async function (): Promise<CustomerGroup[]> {
                return []
            }
        }
    },
    canUseConfiguration: function (config: any): boolean {
        return config.productURL && config.categoryURL && config.translationsURL
    }
}

export default restCodec
registerCodec(restCodec)