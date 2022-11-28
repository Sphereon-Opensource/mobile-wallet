import { IContact } from '../@types'

export const getContactsFromStorage = async (): Promise<Array<IContact>> => {
  return [
    {
      id: '0eee7ef0-162a-40ef-b420-ae36e04d3c4b',
      name: 'Henk de Vries',
      alias: 'Henkie',
      uri: 'something://something_else.anything',
      role: 'Verifier'
    }
  ]
}
