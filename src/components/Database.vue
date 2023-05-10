<script setup lang="ts">
import {ColumnMap, createColumn, Database, typeToString, View, Views} from "../database";
import {createVars, initFilterGroup} from "../utils/vars";
import {useStorageAsync} from "@vueuse/core";
import {FunctionDefine, initFunction, tBoolean, Typesystem, typesystem} from "../typesystem";
import {NButton, NDropdown, NInput} from 'naive-ui'

const fake = new Typesystem()
initFunction(fake)
const functionMap = useStorageAsync<Record<string, FunctionDefine>>('functionMap', fake.functionMap)
typesystem.setFunctionMap(functionMap);
const initDatabase = (): Database => {
    const initColumn = [
        createColumn('Name', 'Text'),
        createColumn('Status', 'Select',['To Do','In Progress','Done']),
        createColumn('Tags', 'Multi-Select',['Group1','Group2','Group3','Group4','Group5']),
        createColumn('Age', 'Number'),
        createColumn('Birthday', 'Date'),
    ];
    const columnMap = Object.fromEntries(initColumn.map(v => [v.id, v])) as ColumnMap;
    const createView = (type: string, name: string, columnMap: ColumnMap): View => {
        const vars = createVars(columnMap)
        return {
            type,
            name,
            columns: Object.values(columnMap).map(v => ({id: v.id, width: 200, show: true})),
            filter: initFilterGroup(vars)
        } as View
    }
    return {
        views: [createView('Table', 'Table', columnMap), createView('Table', 'Table1', columnMap)],
        columnMap: columnMap,
        rows: [{}, {}, {}],
    }
}
const database = useStorageAsync('database', initDatabase())
const clear = () => {
    localStorage.removeItem('database');
    localStorage.removeItem('functionMap')
    location.reload();
}
const selectType = (key: string, func: FunctionDefine, i: number) => {
    key === 'void' ? func.type.args.splice(i, 1) : func.type.args[i] = typesystem.getTypeMap()[key]
}
</script>
<template>
    <div style="display:flex;">
        <div style="padding: 12px;flex:1">
            <NButton @click="clear">Clear Storage</NButton>
            <div v-for="(view,i) in database.views" :key="i"
                 style="margin: 12px;padding: 8px;border: 1px solid gray;border-radius: 4px;overflow: hidden">
                <component
                        :is="Views[view.type].render"
                        :columnMap="database.columnMap"
                        :rows="database.rows"
                        :view="view"></component>
            </div>
        </div>
        <div style="flex:1">
            <div style="margin-bottom: 24px;">
                <div style="font-weight: bold">Data Types</div>
                <div v-for="(type) in typesystem.getTypes()">{{ type.title }}</div>
            </div>
            <div>
                <div style="font-weight: bold">Filter Functions</div>
                <div v-for="(func) in typesystem.getFunctions()" style="margin-bottom: 12px;">
                    <div style="font-family: 'JetBrains Mono',serif">
                        <div style="padding: 8px;background: rgba(0,0,0,0.05);border-radius: 4px">
                            <div>
                                name:
                                <NInput v-model:value="func.name" size="small"
                                        style="margin-bottom: 4px;max-width: 200px"></NInput>
                            </div>
                            <div v-if="func.type.typeVars">
                                type variables:
                                {{func.type.typeVars?.map(v => `${v.name} extends ${typeToString(v.bound)}`).join(', ')}}
                            </div>
                            <div style="margin-bottom: 4px;">
                                type:
                                (<span v-for="(i) in [0,1]">{{ i !== 0 ? ', ' : '' }}<NDropdown trigger="click"
                                                                                                placement="bottom-start"
                                                                                                size="small"
                                                                                                @select="(key:string)=>selectType(key,func,i)"
                                                                                                :options="[{title:'void'},...typesystem.getTypes()].map(v=>({label:v.title,key:v.title}))"><span
                                    style="cursor: pointer;padding: 2px 8px;background-color: white;border-radius: 4px;white-space: nowrap; ">{{
                                func.type.args[i] ? typeToString(func.type.args[i]) : 'void'
                                }}</span></NDropdown>
                            </span>) ->
                                <span>{{ typeToString(func.type.rt) }}</span>
                            </div>
                            <div style="display:flex;align-items:center;">
                                impl:
                                <NInput v-model:value="func.impl" size="small"
                                        style="margin-bottom: 4px;margin-left: 8px;"></NInput>
                            </div>
                        </div>
                    </div>
                </div>
                <NButton @click="typesystem.defineFunction('',{args:[],rt:tBoolean},(value,target)=>{})">Add New
                    Function
                </NButton>
            </div>
        </div>
    </div>
</template>

<style scoped>
</style>
