<template>
  <NInputNumber v-model:value="valueModel" size="small"></NInputNumber>
</template>

<script lang="ts" setup>
import {NInputNumber} from 'naive-ui'
import {useVModel} from "@vueuse/core";
const props = defineProps<{
    value?: number
}>();
const valueModel = useVModel(props, 'value')
</script>

<style scoped>

</style>
