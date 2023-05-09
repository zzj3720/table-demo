<template>
    <NInput v-model:value="valueModel" size="small"></NInput>
</template>

<script lang="ts" setup>
import {NInput} from 'naive-ui'
import {useVModel} from "@vueuse/core";

const props = defineProps<{
    value?: string
}>();
const valueModel = useVModel(props, 'value')
</script>

<style scoped>

</style>
