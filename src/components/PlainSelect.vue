<template>
    <NDropdown trigger="click" placement="bottom-start" size="small" @select="select"
               :options="props.options?.map(v=>({label:v.label,key:v.key??v.value}))">
        <span style="cursor: pointer;background-color: white;border-radius: 4px;white-space: nowrap; ">
            <slot v-if="!label">
                ⋮
            </slot>
            <span style="padding: 2px 8px" v-else>
                {{ label }}
            </span>
        </span>
    </NDropdown>
</template>

<script lang="ts" setup>
import {NDropdown} from 'naive-ui'
import {useVModel} from "@vueuse/core";
import {computed} from "vue";

const props = defineProps<{
    options?: { label: string, value: any; key?: string }[];
    value?: string;
}>()
const valueModel = useVModel(props, 'value')
const select = (key: string) => {
    valueModel.value = props.options?.find(v => (v.key ?? v.value) === key)?.value;
}
const label = computed(() => {
    return props.options?.find(v => v.value === props.value)?.label
})
</script>

<style scoped>

</style>
