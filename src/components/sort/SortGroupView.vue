<template>
    <div style="background-color: rgba(0,0,0,0.05);border-radius: 4px;padding: 4px;box-sizing: border-box">
        <div v-for="(sort,i) in data" :key="i"
             style="display: flex;align-items:center;margin-bottom: 4px;">
            <span>Sort by</span>
            <VariableRef style="margin: 0 4px;" :vars="vars" v-model:data="sort.left"></VariableRef>
            <span style="margin-right: 4px;">in</span>
            <PlainSelect v-model:value="sort.type" :options="options"></PlainSelect>
            <span style="margin-left: 4px;">order</span>
        </div>
        <n-dropdown
                :options="addNewOptions"
                placement="bottom-start"
                trigger="click"
                @select="addNew"
        >
            <NButton size="small">Add New</NButton>
        </n-dropdown>
    </div>
</template>

<script lang="ts" setup>
import {SortGroup, Variable} from "../../database";
import {NButton, NDropdown} from 'naive-ui'
import PlainSelect from "../PlainSelect.vue";
import {computed} from "vue";
import VariableRef from "../common/VariableRef.vue";

const map = {
    asc: 'Ascending',
    desc: 'Descending',
}
const options = Object.entries(map).map(([key, value]) => ({label: value, value: key}));
const addNewOptions = computed(() => {
    return props.vars.map(v => ({label: v.name, key: v.name}))
})
const addNew = (name: string) => {
    props.data.push({
        left: {type: 'ref', name},
        type: 'asc'
    })
}
const props = defineProps<{
    data: SortGroup
    vars: Variable[]
}>()
</script>

<style scoped>

</style>
