<template>
    <div style="display:flex;align-items:center;">
        <PlainSelect v-model:value="data.name" :options="options"></PlainSelect>
<!--        <PlainSelect v-model:value="data.name" :options="options"></PlainSelect>-->
    </div>
</template>

<script lang="ts" setup>
import {VariableRef, Variable} from "../../database";
import {NSelect} from 'naive-ui'
import {computed} from "vue";
import {typesystem} from "../../typesystem";
import PlainSelect from "../PlainSelect.vue";

const props = defineProps<{
    data: VariableRef
    vars: Variable[]
}>()
const options = computed(() => {
    return props.vars.map(value => ({label: value.name, value: value.name}))
})
const properties = computed(() => {
    const value = props.vars.find(v => v.name === props.data.name);
    if (!value) {
        return
    }
    return typesystem.getProperties(value.type)
})
</script>

<style scoped>

</style>
