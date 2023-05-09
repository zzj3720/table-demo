<template>
    <NSwitch v-model:value="valueModel" size="small"></NSwitch>
</template>

<script lang="ts" setup>
import {NSwitch} from 'naive-ui'
import {useVModel} from "@vueuse/core";
const props = defineProps<{
    value?: boolean
}>();
const valueModel = useVModel(props, 'value')
</script>

<style scoped>

</style>
