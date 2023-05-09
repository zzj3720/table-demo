<template>
    <n-input-number v-model:value="valueModel" size="small"></n-input-number>
</template>

<script lang="ts" setup>
import {NInputNumber} from 'naive-ui'
import {useVModel} from "@vueuse/core";

const props = defineProps<{
    value?: number;
}>()
const valueModel = useVModel(props, 'value')
</script>

<style scoped>

</style>
