<template>
<NDatePicker v-model:value="valueModel" size="small"></NDatePicker>
</template>

<script lang="ts" setup>
import {NDatePicker} from 'naive-ui'
import {useVModel} from "@vueuse/core";
const props = defineProps<{
    value?: number
}>();
const valueModel = useVModel(props, 'value')
</script>

<style scoped>

</style>
