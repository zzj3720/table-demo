<template>
    <n-select
            size="small"
            v-model:value="valueModel"
            filterable
            tag
            max-tag-count="responsive"
            multiple
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
    value?: string[];
}>()
const select = (keys: string[]) => {
    if (!dataModel.value) {
        dataModel.value = []
    }
    keys.forEach(key => {
        if (dataModel.value && dataModel.value.indexOf(key) < 0) {
            dataModel.value.push(key)
        }
    })
}
const createTag = (label: string) => {
    return {
        label: label,
        value: label,
    }
}
const valueModel = useVModel(props, 'value')
const dataModel = useVModel(props, 'data')
</script>

<style scoped>

</style>
