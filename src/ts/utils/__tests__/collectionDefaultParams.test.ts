import collectionDefaultParams from '../collectionDefaultParams'

describe('collectionDefaultParams', () => {
  test('returns default values', () => {
    const expectedResult: {
      page_num: string;
      page_size: number;
      consortium: string;
    } = {
      page_num: '1',
      page_size: 20,
      consortium: 'EOSDIS'
    }

    const result = collectionDefaultParams

    expect(result).toEqual(expectedResult)
  })
})
