<script setup lang="ts">
import {ColumnMap, createColumn, Database, TableView, typeToString, View, Views} from "../database";
import {createVars, initFilterGroup} from "../utils/vars";
import {useLocalStorage, useStorageAsync} from "@vueuse/core";
import {DefineConfig, initFunction, Typesystem, typesystem} from "../typesystem";
import {NButton} from 'naive-ui'

const clear = () => {
    localStorage.removeItem('database');
    localStorage.removeItem('functionMap')
    location.reload();
}
const fake = new Typesystem()
initFunction(fake)
const functionMap = useStorageAsync<DefineConfig>('functionMap', fake.define)
const version = useLocalStorage('version', 0);
if (version.value < 2) {
    version.value = 2;
    clear();
}
typesystem.setFunctionMap(functionMap);
const initDatabase = (): Database => {
    const initColumn = [
        createColumn('Name', 'Text'),
        createColumn('Status', 'Select', ['To Do', 'In Progress', 'Done']),
        createColumn('Tags', 'Multi-Select', ['Group1', 'Group2', 'Group3', 'Group4', 'Group5']),
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
            filter: initFilterGroup(vars),
            sort: [{type: 'asc', left: {name: vars[0].name, type: 'ref'}}]
        } as TableView
    }
    return {
        views: [createView('Table', 'Table', columnMap), createView('Table', 'Table1', columnMap)],
        columnMap: columnMap,
        rows: [{}, {}, {}],
    }
}
const database = useStorageAsync('database', initDatabase())
</script>
<template>
    <div style="display:flex;">
        <div style="padding: 12px;width: 50%;flex-shrink: 0">
            <NButton @click="clear">Clear Storage</NButton>
            <div v-for="(view,i) in database.views" :key="i"
                 style="margin-top: 12px;padding: 8px;border: 1px solid gray;border-radius: 4px;overflow: auto">
                <component
                        :is="Views[view.type].render"
                        :columnMap="database.columnMap"
                        :rows="database.rows"
                        :view="view"></component>
            </div>
        </div>
        <div style="width: 50%;flex-shrink: 0">
            <div style="margin-bottom: 24px;">
                <div style="font-weight: bold">Data Types</div>
                <div v-for="(type) in typesystem.getTypes()">{{ type.title }}</div>
            </div>
            <div>
                <div style="font-weight: bold">Filter Functions</div>
                <div style="font-size:12px;margin-bottom: 12px;font-family: 'JetBrains Mono',serif;padding: 8px;background: rgba(0,0,0,0.05);border-radius: 4px">
                    <div v-for="(func) in typesystem.getFunctions()">
                        <span>{{ func.name }}</span><span v-if="func.type.typeVars?.length">
                        <span class="keyword">{{ '<' }}</span>
                        <span class="type-name">{{
                            `${func.type.typeVars?.map(v => `${v.name} extends ${typeToString(v.bound)}`).join(', ')}`
                            }}</span>
                        <span class="keyword">{{ '>' }}</span>
                        </span>
                        <span>
                            <span class="keyword">(</span>
                            <span class="type-name">{{
                                `${func.type.args.map(type => typeToString(type)).join(', ')}`
                                }}</span>
                            <span class="keyword">)</span>
                        </span>
                        <span class="keyword">{{ ' => ' }}</span>
                        <span class="keyword">{{ typeToString(func.type.rt) }}</span>
                    </div>
                </div>
            </div>
            <div>
                <div style="font-weight: bold">Property Functions</div>
                <div style="font-size:12px;margin-bottom: 12px;font-family: 'JetBrains Mono',serif;padding: 8px;background: rgba(0,0,0,0.05);border-radius: 4px">
                    <div v-for="(func) in typesystem.allProperties()">
                        <span>{{ func.name }}</span><span v-if="func.type.typeVars?.length">
                        <span class="keyword">{{ '<' }}</span>
                        <span class="type-name">{{
                                `${func.type.typeVars?.map(v => `${v.name} extends ${typeToString(v.bound)}`).join(', ')}`
                            }}</span>
                        <span class="keyword">{{ '>' }}</span>
                        </span>
                        <span>
                            <span class="keyword">(</span>
                            <span class="type-name">{{
                                    `${func.type.args.map(type => typeToString(type)).join(', ')}`
                                }}</span>
                            <span class="keyword">)</span>
                        </span>
                        <span class="keyword">{{ ' => ' }}</span>
                        <span class="keyword">{{ typeToString(func.type.rt) }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.keyword {
    color: #a6a6a6;
}

.type-name {
    color: coral;
}
</style>
