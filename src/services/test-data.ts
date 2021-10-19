import { User } from '@/services/base'
import dayjs from 'dayjs'

const TestUsers: User[] = [
  {
    id: 'taro.yamada',
    email: 'taro.yamada@example.com',
    first: 'Taro',
    last: 'Yamada',
    createdAt: dayjs('2020-01-01'),
    updatedAt: dayjs('2020-01-01'),
  },
  {
    id: 'ichiro.suzuki',
    email: 'ichiro.suzuki@example.com',
    first: 'Ichiro',
    last: 'Suzuki',
    createdAt: dayjs('2021-02-01'),
    updatedAt: dayjs('2021-02-01'),
  },
]

export { TestUsers }
