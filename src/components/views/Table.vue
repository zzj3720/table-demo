<template>
    <div style="display: flex;flex-direction: column">
        <div style="margin-bottom: 24px;">
            <div style="font-size:20px;font-weight: bold">Columns</div>
            <div style="margin-left: 12px;">
                <div v-for="(column) in showColumns"
                     style="display:flex;align-items:center;margin-bottom: 8px;">
                    <span style="font-weight: bold;margin-right: 4px;">
                        <n-input v-model:value="columnMap[column.id].name" size="small"></n-input>
                    </span>
                    <span style="color: #40a7c9;margin-right: 4px;">
                        <PlainSelect v-model:value="columnMap[column.id].format"
                                     :options="ColumnFormat.map(v=>({label:v.name,value:v.name}))"></PlainSelect>
                    </span>
                    <span style="color: gray;margin-right: 8px;">
                        {{ typeToString(getFormat(columnMap[column.id].format).type) }}
                    </span>
                    <NSwitch style="margin-right: 8px;" size="small" v-model:value="column.show">
                        <template #checked>
                            show
                        </template>
                        <template #unchecked>
                            hide
                        </template>
                    </NSwitch>
                    <NSlider style="width: 200px;" step="1" :min="40" :max="500" v-model:value="column.width"></NSlider>
                </div>
                <n-dropdown
                        :options="addNewOptions"
                        placement="bottom-start"
                        trigger="click"
                        @select="addNewColumn"
                >
                    <NButton size="small">Add New</NButton>
                </n-dropdown>
            </div>
        </div>
        <div style="margin-bottom: 24px;">
            <div style="font-size:20px;font-weight: bold">Filter</div>
            <div style="margin-left: 12px;">
                <Group :data="props.view.filter" :vars="vars"></Group>
            </div>
        </div>
        <div style="margin-bottom: 24px;">
            <div style="font-size:20px;font-weight: bold">Sort</div>
            <div style="margin-left: 12px;">
                TODO
            </div>
        </div>
        <div style="font-size:20px;font-weight: bold">Table</div>
        <div style="width: max-content">
            <div class="row-border row-head">
                <template v-for="({id,width,show}) in showColumns"
                          :key="id">
                    <div
                            v-if="show"
                            :style="`width:${width}px;`"
                            class="cell-border cell-head"
                    >
                        {{columnMap[id].name}}
                    </div>
                </template>

            </div>
            <div v-for="(row,i) in props.rows" :key="i" style="display: flex" class="row-border row-body">
                <template v-for="({id,width,show}) in showColumns" :key="id">
                    <div
                            v-if="show"
                            :style="`width:${width}px;`"
                            class="cell-border cell-body"
                    >
                        <component
                                :is="ColumnFormat.find(v=>v.name===columnMap[id].format).render"
                                v-model:value="row[id]"
                        ></component>
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    Column,
    ColumnFormat,
    ColumnMap,
    getFormat,
    Row,
    TableView,
    TableViewColumn,
    typeToString
} from "../../database";
import Group from "../filter/Group.vue";
import {computed} from "vue";
import {createVars} from "../../utils/vars";
import {NButton, NDropdown, NInput, NSlider, NSwitch} from 'naive-ui'
import PlainSelect from "../PlainSelect.vue";
import {nanoid} from "nanoid";

const props = defineProps<{
    rows: Row[];
    view: TableView;
    columnMap: ColumnMap;
}>()
const vars = computed(() => {
    return createVars(props.columnMap)
})
const showColumns = computed(() => {
    const set = new Set(Object.keys(props.columnMap));
    const result: TableViewColumn[] = props.view.columns;
    for (const column of props.view.columns) {
        set.delete(column.id)
    }
    result.push(...[...set].map(id => ({id, width: 200, show: true})))
    return result;
})
const addNewColumn = (key: string) => {
    const id = nanoid();
    props.columnMap[id] = {
        id,
        name: '',
        format: key,
    }
}
const addNewOptions = ColumnFormat.map(v => ({label: v.name, key: v.name}))
</script>

<style scoped>
.cell-border:not(:last-child) {
    border-right: 1px solid #e7e7e7;
}

.row-border:not(:last-child) {
    border-bottom: 1px solid #e7e7e7;
}

.cell-head {
    padding: 8px;
    box-sizing: border-box
}

.cell-body {
    box-sizing: border-box;
    padding: 4px
}

.row-head {
    display: flex;
}

.row-body {

}
</style>