import { User } from '@/services/base'
import dayjs from 'dayjs'

const TestUsers: User[] = [
  {
    id: 'taro.yamada',
    email: 'taro.yamada@example.com',
    displayName: '山田 太郎',
    createdAt: dayjs('2020-01-01'),
    updatedAt: dayjs('2020-01-01'),
  },
]

export { TestUsers }
