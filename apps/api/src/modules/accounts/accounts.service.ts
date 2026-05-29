import { accountsRepository } from './accounts.repository.js'
import { encrypt } from '../../infrastructure/crypto/encryption.js'
import { prisma } from '../../infrastructure/database/client.js'
import type { CreateAccountInput } from './accounts.types.js'

export const accountsService = {
  count(userId: string) {
    return prisma.brokerAccount.count({ where: { userId, isActive: true } })
  },

  list(userId: string) {
    return accountsRepository
      .findAll(userId)
      .then((rows) => rows.map((a) => ({ ...a, credentialsEnc: undefined })))
  },

  findById(id: string, userId: string) {
    return accountsRepository.findById(id, userId)
  },

  async create(userId: string, input: CreateAccountInput) {
    const credentialsEnc = input.credentials ? encrypt(input.credentials) : undefined
    const account = await accountsRepository.create(userId, input, credentialsEnc)
    return { ...account, credentialsEnc: undefined }
  },

  async delete(id: string, userId: string) {
    const account = await accountsRepository.findById(id, userId)
    if (!account) {
      const err = new Error('account_not_found')
      Object.assign(err, { status: 404 })
      throw err
    }
    await accountsRepository.softDelete(id, userId)
  },
}
