<template>
    <PlainSelect v-model:value="valueModel" :options="options" ></PlainSelect>
</template>

<script lang="ts" setup>
import {notNullish, useVModel} from "@vueuse/core";
import {TUnion} from "../../typesystem";
import {computed} from "vue";
import PlainSelect from "../PlainSelect.vue";

const props = defineProps<{
    value?: string;
    type: TUnion;
}>();
const options = computed(() => {
    return props.type.list.map(v => {
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
