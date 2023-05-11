<template>
    <NInput v-model:value="valueModel.value" size="small"></NInput>
</template>

<script lang="ts" setup>
import {NInput} from 'naive-ui'
import {useVModel} from "@vueuse/core";
import {Literal} from "../../database";

const props = defineProps<{
    value?: Literal
}>();
const valueModel = useVModel(props, 'value')
</script>

<style scoped>

</style>
