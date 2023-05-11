<template>
    <NSelect v-model:value="valueModel" :options="options" style="min-width: 200px;" multiple size="small"></NSelect>
</template>

<script lang="ts" setup>
import {NSelect} from 'naive-ui'
import {notNullish, useVModel} from "@vueuse/core";
import {TArray} from "../../typesystem";
import {computed} from "vue";

const props = defineProps<{
    value?: string[];
    type: TArray;
}>();
const options = computed(() => {
    const ele = props.type.ele;
    console.log(props.type)
    if (ele.type !== 'union') {
        return
    }
    return ele.list.map(v => {
        if (v.type !== 'string' || !v.literal) {
            return
        }
        return {label: v.literal, value: v.literal};
    }).filter(notNullish)
})
const valueModel = useVModel(props, 'value')
</script>

<style scoped>

</style>
