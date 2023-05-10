import axios from 'axios'
import { getPageByQuery, getPageByQueryAxios, paginate, paginateCursor } from './pagination'

jest.mock('axios')

describe('getPageByQuery', function() {
	test('gets function with string total and result prop map', async () => {
		const sampleData = ['example', 'data']

		const client = {
			get: jest.fn().mockImplementation(() => Promise.resolve({
				result: sampleData,
				number: sampleData.length
			}))
		} as any

		const getPage = getPageByQuery('offset', 'count', 'number', 'result')
		const withClient = await getPage(client, 'https://testMethod', {param1: 1, param2: 2})

		const result = await withClient(0, 20)
		await withClient(2, 20)

		expect(client.get).toHaveBeenNthCalledWith(1, { url: 'https://testmethod/?param1=1&param2=2&offset=0&count=20' })
		expect(client.get).toHaveBeenNthCalledWith(2, { url: 'https://testmethod/?param1=1&param2=2&offset=40&count=20' })

		expect(result).toEqual({
			data: sampleData,
			total: sampleData.length
		})
	})

	test('gets function with function total and result prop map, different query', async () => {
		const sampleData = ['example', 'data']

		const client = {
			get: jest.fn().mockImplementation(() => Promise.resolve({
				result: {
					edges: sampleData
				},
				number: {
					total: sampleData.length
				}
			}))
		} as any

		const getPage = getPageByQuery('start', 'size', (obj) => obj.number.total, (obj) => obj.result.edges)
		const withClient = await getPage(client, 'https://testMethod', {param0: 1, start: 2})

		const result = await withClient(0, 20)
		await withClient(2, 20)

		expect(client.get).toHaveBeenNthCalledWith(1, { url: 'https://testmethod/?param0=1&start=0&size=20' })
		expect(client.get).toHaveBeenNthCalledWith(2, { url: 'https://testmethod/?param0=1&start=40&size=20' })

		expect(result).toEqual({
			data: sampleData,
			total: sampleData.length
		})
	})
})

describe('getPageByQueryAxios', function() {
	beforeEach(() => {
		jest.resetAllMocks()
	})

	test('gets function with string total and result prop map', async () => {
		const sampleData = ['example', 'data']

		const mockAxiosGet = (axios.get as jest.Mock)
		mockAxiosGet.mockImplementation(() => Promise.resolve({
			data: {
				result: sampleData,
				number: sampleData.length
			}
		}))

		const config = { example: 'config' } as any

		const getPage = getPageByQueryAxios('offset', 'count', 'number', 'result')
		const withClient = await getPage(axios, 'https://testMethod', config, {param1: 1, param2: 2})

		const result = await withClient(0, 20)
		await withClient(2, 20)

		expect(axios.get).toHaveBeenNthCalledWith(1, 'https://testmethod/?param1=1&param2=2&offset=0&count=20', config )
		expect(axios.get).toHaveBeenNthCalledWith(2, 'https://testmethod/?param1=1&param2=2&offset=40&count=20', config )

		expect(result).toEqual({
			data: sampleData,
			total: sampleData.length
		})
	})

	test('gets function with function total and result prop map, different query', async () => {
		const sampleData = ['example', 'data']

		const mockAxiosGet = (axios.get as jest.Mock)
		mockAxiosGet.mockImplementation(() => Promise.resolve({
			data: {
				result: {
					edges: sampleData
				},
				number: {
					total: sampleData.length
				}
			}
		}))

		const config = { example: 'config' } as any

		const getPage = getPageByQueryAxios('start', 'size', (obj) => obj.number.total, (obj) => obj.result.edges)
		const withClient = await getPage(axios, 'https://testMethod', config, {param0: 1, start: 2})

		const result = await withClient(0, 20)
		await withClient(2, 20)

		expect(axios.get).toHaveBeenNthCalledWith(1, 'https://testmethod/?param0=1&start=0&size=20', config )
		expect(axios.get).toHaveBeenNthCalledWith(2, 'https://testmethod/?param0=1&start=40&size=20', config )

		expect(result).toEqual({
			data: sampleData,
			total: sampleData.length
		})
	})
})

describe('paginate', function() {
	const getPageMock = (total: number) => (page: number, pageSize: number) => {
		const pageBase = page * pageSize
		const remaining = Math.max(0, total - pageBase)
		return Promise.resolve({ data: Array.from({length: Math.min(pageSize, remaining)}).map((_, index) => index + pageBase), total })
	}

	test('paginate 0 items', async () => {
		const getPage = jest.fn().mockImplementation(() => Promise.resolve({ data: [], total: 0 }))

		const result = await paginate(getPage, 20, 0)

		expect(getPage).toHaveBeenCalledWith(0, 20)
		expect(result).toEqual({result: [], total: 0})
	})

	test('paginate 1 item', async () => {
		const getPage = jest.fn().mockImplementation(() => Promise.resolve({ data: [1], total: 1 }))

		const result = await paginate(getPage, 20, 0)

		expect(getPage).toHaveBeenCalledWith(0, 20)
		expect(result).toEqual({result: [1], total: 1})
	})

	test('paginate 2 pages', async () => {
		const total = 30
		const getPage = jest.fn().mockImplementation(getPageMock(total))

		const result = await paginate(getPage, 20, 0)

		expect(getPage).toHaveBeenCalledWith(0, 20)
		expect(getPage).toHaveBeenCalledWith(1, 20)
		expect(result).toEqual({result: Array.from({length: total}).map((_, index) => index), total})
	})

	test('paginate 20 pages', async () => {
		const total = 390
		const getPage = jest.fn().mockImplementation(getPageMock(total))

		const result = await paginate(getPage, 20, 0)

		for (let i = 0; i < 20; i++){
			expect(getPage).toHaveBeenCalledWith(i, 20)
		}

		expect(result).toEqual({result: Array.from({length: total}).map((_, index) => index), total})
	})

	test('paginate 10 items from last page', async () => {
		const total = 390
		const getPage = jest.fn().mockImplementation(getPageMock(total))

		const result = await paginate(getPage, 20, 19, 1)

		expect(getPage).toHaveBeenCalledWith(19, 20)

		expect(result).toEqual({result: Array.from({length: 10}).map((_, index) => index + 380), total})
	})

	test('paginate page 10-20 of 30', async () => {
		const total = 600
		const getPage = jest.fn().mockImplementation(getPageMock(total))

		const result = await paginate(getPage, 20, 10, 10)

		for (let i = 10; i < 20; i++){
			expect(getPage).toHaveBeenCalledWith(i, 20)
		}

		expect(result).toEqual({result: Array.from({length: 200}).map((_, index) => index + 200), total})
	})
})

describe('paginateCursor', function() {
	const getPageMock = (total: number) => (cursor: string, pageSize: number) => {
		const pageBase = cursor == null ? 0 : Number(cursor.substring(1))
		const remaining = Math.max(0, total - pageBase)
		return Promise.resolve({ 
			data: Array.from({length: Math.min(pageSize, remaining)}).map((_, index) => index + pageBase),
			hasNext: (remaining - pageSize) > 0,
			nextCursor: (remaining - pageSize) > 0 ? 'C' + (pageBase + pageSize) : undefined
		})
	}

	test('paginate 0 items', async () => {
		const getPage = jest.fn().mockImplementation(() => Promise.resolve({ data: [], hasNext: false }))

		const result = await paginateCursor(getPage, 20)

		expect(getPage).toHaveBeenCalledWith(undefined, 20)
		expect(result).toEqual({ data: [], hasNext: false })
	})

	test('paginate 1 item', async () => {
		const getPage = jest.fn().mockImplementation(() => Promise.resolve({ data: [1], hasNext: false }))

		const result = await paginateCursor(getPage, 20)

		expect(getPage).toHaveBeenCalledWith(undefined, 20)
		expect(result).toEqual({ data: [1], hasNext: false })
	})

	test('paginate 2 pages', async () => {
		const total = 30
		const getPage = jest.fn().mockImplementation(getPageMock(total))

		const result = await paginateCursor(getPage, 20)

		expect(getPage).toHaveBeenCalledWith(undefined, 20)
		expect(getPage).toHaveBeenCalledWith('C20', 20)
		expect(result).toEqual({data: Array.from({length: total}).map((_, index) => index), hasNext: false})
	})

	test('paginate 20 pages', async () => {
		const total = 390
		const getPage = jest.fn().mockImplementation(getPageMock(total))

		const result = await paginateCursor(getPage, 20)

		for (let i = 0; i < 20; i++){
			expect(getPage).toHaveBeenCalledWith(i == 0 ? undefined : ('C' + (i * 20)), 20)
		}

		expect(result).toEqual({data: Array.from({length: total}).map((_, index) => index), hasNext: false})
	})

	test('paginate 10 items from last page', async () => {
		const total = 390
		const getPage = jest.fn().mockImplementation(getPageMock(total))

		const result = await paginateCursor(getPage, 20, 'C380', 1)

		expect(getPage).toHaveBeenCalledWith('C380', 20)

		expect(result).toEqual({data: Array.from({length: 10}).map((_, index) => index + 380), hasNext: false})
	})

	test('paginate page 10-20 of 30', async () => {
		const total = 600
		const getPage = jest.fn().mockImplementation(getPageMock(total))

		const result = await paginateCursor(getPage, 20, 'C200', 10)

		for (let i = 10; i < 20; i++){
			expect(getPage).toHaveBeenCalledWith(i == 0 ? undefined : ('C' + (i * 20)), 20)
		}

		expect(result).toEqual({data: Array.from({length: 200}).map((_, index) => index + 200), hasNext: true, nextCursor: 'C400'})
	})
})