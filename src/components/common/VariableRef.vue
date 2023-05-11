<template>
    <div style="display:flex;align-items:center;">
        <div style="display:flex;align-items:center;">
            <PlainSelect :value="refName" @update:value="setRefName" :options="options"></PlainSelect>
        </div>
        <div v-if="propertyOptions?.length" style="display:flex;align-items:center;">
            <span style="margin-right: 4px;">{{propertyName&&'\'s'}}</span>
            <PlainSelect :value="propertyName" @update:value="setPropertyName" :options="propertyOptions">⋮
            </PlainSelect>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {Variable, VariableOrProperty} from "../../database";
import {computed} from "vue";
import {typesystem} from "../../typesystem";
import PlainSelect from "../PlainSelect.vue";
import {useVModel} from "@vueuse/core";

const props = defineProps<{
    data: VariableOrProperty
    vars: Variable[]
}>()
const dataModel = useVModel(props, 'data')
const refName = computed(() => {
    if (dataModel.value.type === 'ref') {
        return dataModel.value.name;
    }
    return dataModel.value.ref.name;
})
const setRefName = (name: string) => {
    if (dataModel.value.type === 'ref') {
        dataModel.value.name = name;
        return;
    }
    dataModel.value = {
        type: 'ref',
        name
    }
}
const options = computed(() => {
    return props.vars.map(value => ({label: value.name, value: value.name}))
})
const propertyName = computed(() => {
    if (dataModel.value.type === "ref") {
        return;
    }
    return dataModel.value.propertyFuncName;
})
const setPropertyName = (name: string) => {
    if (dataModel.value.type === "ref") {
        dataModel.value = {
            type: 'property',
            ref: dataModel.value,
            propertyFuncName: name,
        }
        return;
    }
    dataModel.value.propertyFuncName = name;
}
const properties = computed(() => {
    const name = refName.value
    const value = props.vars.find(v => v.name === name);
    if (!value) {
        return
    }
    return typesystem.getProperties(value.type)
})
const propertyOptions = computed(() => {
    return properties.value?.map(v => ({label: v.name, value: v.name}))
})
</script>

<style scoped>

</style>
