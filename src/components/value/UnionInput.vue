<template>
    <NSelect v-model:value="valueModel" size="small"></NSelect>
</template>

<script lang="ts" setup>
import {NSelect} from 'naive-ui'
import {useVModel} from "@vueuse/core";

const props = defineProps<{
    value?: string;
}>();
const valueModel = useVModel(props, 'value')
</script>

<style scoped>

</style>
