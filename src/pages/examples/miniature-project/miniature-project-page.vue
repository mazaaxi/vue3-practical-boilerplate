<style lang="scss" scoped>
.MiniatureProjectPage {
  body.screen--lg &,
  body.screen--xl &,
  body.screen--md & {
    max-width: 848px;
    padding: 48px;
    margin: 0 auto;
  }

  body.screen--xs &,
  body.screen--sm & {
    padding: 24px;
  }

  .log-input {
    width: 100%;
    min-height: 300px;
    margin-top: 24px;
    font-family: 'MS Gothic', 'Osaka-Mono', monospace;
    font-size: 13px;
    @extend %layout-flex-1;

    &::v-deep(.q-field__control) {
      height: 100%;
    }
  }
}

.table {
  width: 100%;

  .title {
    @extend %text-h6;
  }

  .required {
    font-style: italic;
    color: $text-accent;
  }
}
</style>

<template>
  <q-page class="MiniatureProjectPage layout vertical center">
    <q-table ref="table" class="table" title="Users" :rows="users" :columns="columns" row-key="id" binary-state-sort>
      <template v-slot:top>
        <div class="layout horizontal center full-width">
          <div class="title">Users</div>
          <div class="flex-1" />
          <q-btn label="Add User" color="primary" flat dense no-caps @click="addUserRow()" />
        </div>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="id" :props="props">
            {{ props.row.id }}
          </q-td>
          <q-td key="first" :props="props">
            <span v-if="Boolean(props.row.first)">{{ props.row.first }}</span>
            <span v-else class="required">Required Input</span>
            <q-popup-edit v-model="props.row.first">
              <q-input v-model="props.row.first" hint="Input Firs" dense autofocus />
            </q-popup-edit>
          </q-td>
          <q-td key="last" :props="props">
            <span v-if="Boolean(props.row.last)">{{ props.row.last }}</span>
            <span v-else class="required">Required Input</span>
            <q-popup-edit v-model="props.row.last">
              <q-input v-model="props.row.last" hint="Input Last" dense autofocus />
            </q-popup-edit>
          </q-td>
          <q-td key="age" :props="props">
            <span v-if="typeof props.row.age === 'number'">{{ props.row.age }}</span>
            <span v-else class="required">Required Input</span>

            <q-popup-edit v-model="props.row.age">
              <q-input v-model.number="props.row.age" type="number" hint="Input Age" dense autofocus />
            </q-popup-edit>
          </q-td>
          <q-td key="save" :props="props">
            <q-btn label="Save" color="primary" flat dense no-caps @click="saveUser(props.row)" :disable="!Boolean(props.row.editType)" />
            <q-btn class="spacing-mx-10" label="Remove" color="primary" flat dense no-caps @click="removeUser(props.row)" />
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <q-input ref="logInput" v-model="logMessage" class="log-input" type="textarea" filled readonly />
  </q-page>
</template>

<script lang="ts">
import { Loading, QInput, QTable } from 'quasar'
import { User, useService } from '@/pages/examples/miniature-project/services'
import { defineComponent, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import debounce from 'lodash/debounce'
import { generateId } from '@/services'
const cloneDeep = require('rfdc')()

type UserRow = User & { editType?: 'added' | 'modified' }

let isFetchedUsers = false

const MiniatureProjectPage = defineComponent({
  name: 'MiniatureProjectPage',

  components: {},

  setup() {
    //----------------------------------------------------------------------
    //
    //  Lifecycle hooks
    //
    //----------------------------------------------------------------------

    onMounted(async () => {
      if (isFetchedUsers) {
        users.value = services.admin.getAllUsers()
      } else {
        Loading.show()
        await services.admin.fetchUsers()
        isFetchedUsers = true
        Loading.hide()
      }
    })

    onUnmounted(() => {
      offUsersChange()
    })

    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const services = useService()

    const table = ref<QTable>()

    const columns = [
      {
        name: 'id',
        required: true,
        label: 'ID',
        align: 'left',
        field: (row: User) => row.id,
        sortable: true,
      },
      {
        name: 'first',
        required: true,
        label: 'First',
        align: 'left',
        field: (row: User) => row.first,
        sortable: true,
      },
      {
        name: 'last',
        required: true,
        label: 'Last',
        align: 'left',
        field: (row: User) => row.last,
        sortable: true,
      },
      {
        name: 'age',
        required: true,
        label: 'Age',
        align: 'right',
        field: (row: User) => row.age,
        sortable: true,
      },
      {
        name: 'save',
        align: 'left',
      },
    ]

    const logInput = ref<QInput>()

    const users = ref<UserRow[]>([])

    const logMessage = ref('')

    //----------------------------------------------------------------------
    //
    //  Internal methods
    //
    //----------------------------------------------------------------------

    function addUserRow(): void {
      users.value.push({ id: generateId(), last: '', first: '', age: 0, editType: 'added' })
      table.value!.lastPage()
    }

    async function saveUser(user: UserRow): Promise<void> {
      if (!user.first || !user.last || typeof user.age !== 'number') return

      Loading.show()
      if (user.editType === 'added') {
        await services.admin.addUser(user)
      } else if (user.editType === 'modified') {
        await services.admin.setUser(user)
      }
      Loading.hide()
    }

    async function removeUser(user: UserRow): Promise<void> {
      Loading.show()
      if (user.editType === 'added') {
        const index = users.value.findIndex(item => item.id === user.id)
        users.value.splice(index, 1)
      } else {
        await services.admin.removeUser(user.id)
      }
      Loading.hide()
    }

    function writeLogMessage(operation: string, newUser?: User, oldUser?: User): void {
      const newUserDetail = JSON.stringify(newUser, null, 2)
      const oldUserDetail = JSON.stringify(oldUser, null, 2)
      logMessage.value += `[${operation}] UserCount: ${users.value.length}, AverageAge: ${services.admin.averageUserAge}\nnewUser: ${newUserDetail}\noldUser: ${oldUserDetail}\n\n`

      nextTick(() => {
        const inputEl = logInput.value!.getNativeElement() as HTMLTextAreaElement
        inputEl.scrollTop = inputEl.scrollHeight
      })
    }

    //----------------------------------------------------------------------
    //
    //  Events
    //
    //----------------------------------------------------------------------

    const offUsersChange = services.admin.onUsersChange((newUser, oldUser) => {
      let operation = ''

      if (newUser) {
        const target = users.value.find(item => item.id === newUser.id)
        if (target?.editType) {
          target.editType === 'added' ? (operation = 'ADDED') : (operation = 'UPDATED')
          Object.assign(target, newUser)
        } else {
          users.value.push(newUser)
        }
        target && (target.editType = undefined)
      } else if (oldUser) {
        operation = 'REMOVED'
        const index = users.value.findIndex(item => item.id === oldUser.id)
        users.value.splice(index, 1)
      }

      operation && writeLogMessage(operation, newUser, oldUser)
    })

    watch(
      () => cloneDeep(users.value),
      debounce(async (newUsers: UserRow[], oldUsers: UserRow[]) => {
        const Props: (keyof User)[] = ['id', 'first', 'last', 'age']
        for (const newUser of newUsers) {
          const oldUser = oldUsers.find(item => item.id === newUser.id)
          if (!oldUser || oldUser.editType) continue

          for (const prop of Props) {
            if (newUser[prop] === oldUser[prop]) continue
            const actualUser = users.value.find(item => item.id === newUser.id)!
            actualUser.editType = 'modified'
            break
          }
        }
      }, 250),
      { deep: true }
    )

    //----------------------------------------------------------------------
    //
    //  Result
    //
    //----------------------------------------------------------------------

    return {
      table,
      columns,
      logInput,
      users,
      logMessage,
      addUserRow,
      saveUser,
      removeUser,
    }
  },
})

export default MiniatureProjectPage
</script>
