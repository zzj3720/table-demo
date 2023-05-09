<template>
    <NCheckbox :checked="valueModel" @update:checked="v=>valueModel=v" size="small"/>
</template>

<script setup lang="ts">
import {NCheckbox} from 'naive-ui'
import {useVModel} from "@vueuse/core";

const props = defineProps<{
    value?: string;
}>()
const valueModel = useVModel(props, 'value')
</script>

<style scoped>

</style>
