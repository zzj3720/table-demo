<template>
    <n-select
        size="small"
            v-model:value="valueModel"
            filterable
            tag
            @update:value="select"
            @create="createTag"
            :options="data?.map(v=>({label:v,value:v}))"
    ></n-select>
</template>

<script setup lang="ts">
import {NSelect} from 'naive-ui'
import {useVModel} from "@vueuse/core";

const props = defineProps<{
    data?: string[];
    value?: string;
}>()
const select = (key: string) => {
    if (!dataModel.value) {
        dataModel.value = []
    }
    if (dataModel.value.indexOf(key) < 0) {
        dataModel.value.push(key)
    }
}
const createTag = (label: string) => {
    return {
        label: label,
        value: label,
        // render: ({node}) => h('div', {}, {default: () => [node, `create new`]})
    }
}
const valueModel = useVModel(props, 'value')
const dataModel = useVModel(props, 'data')
</script>

<style scoped>

</style>
