<template>
  <router-view />
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { useConfig } from 'src/config'

export default defineComponent({
  name: 'App',

  setup() {
    const config = useConfig()
    console.log(JSON.stringify(config, null, 2))
  },
})
</script>
