<template>
    <div style="background-color: rgba(0,0,0,0.05);border-radius: 4px;padding: 4px;box-sizing: border-box">
        <div v-for="(filter,i) in data.conditions" :key="i"
             style="display: flex;align-items:start;margin-bottom: 4px;">
            <div style="margin-right: 4px;display:flex;align-items:center;padding-top: 2px;">
                <div v-if="i===0" style="padding-left: 6px;">
                    Where
                </div>
                <PlainSelect v-else-if="i===1" v-model:value="data.op" :options="options"></PlainSelect>
                <div v-else style="padding-left: 6px;">
                    {{ map[data.op] }}
                </div>
            </div>
            <Condition v-if="filter.type==='filter'" :vars="vars" :data="filter"></Condition>
            <Group v-else :data="filter" :vars="vars"></Group>
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
import {Filter, FilterGroup, Variable} from "../../database";
import Condition from "./Condition.vue";
import {NButton, NDropdown} from 'naive-ui'
import PlainSelect from "../PlainSelect.vue";
import {initFilter, initFilterGroup} from "../../utils/vars";

const map = {
    and: 'And',
    or: 'Or',
}
const options = Object.entries(map).map(([key, value]) => ({label: value, value: key}));
const addNewOptions = [{label: 'Add filter rule', key: 'filter'}, {label: 'Add filter group', key: 'group'}]
const addNew = (key: 'filter' | 'group') => {
    const condition: Filter = key === 'filter' ? initFilter(props.vars) : initFilterGroup(props.vars);
    props.data.conditions.push(condition)
}
const props = defineProps<{
    data: FilterGroup
    vars: Variable[]
}>()
</script>

<style scoped>

</style>
