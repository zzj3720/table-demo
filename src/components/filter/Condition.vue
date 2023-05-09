<template>
    <div style="display:flex;align-items:center;">
        <Ref :data="data.left" :vars="vars" style="margin-right: 4px;"></Ref>
        <div style="margin-right: 4px;display:flex;align-items:center;">
            <PlainSelect v-model:value="props.data.function" :options="methods?.map(v=>({label:v.name,value:v.id}))"></PlainSelect>
        </div>
        <component v-for="(input,i) in inputs" :is="input" :key="i" v-model:value="data.args[i]" ></component>
    </div>
</template>

<script lang="ts" setup>
import {SingleFilter, Variable} from "../../database";
import Ref from "./Ref.vue";
import {computed, DefineComponent, toRaw} from "vue";
import {FunctionDefine, getRenderByType, tBoolean, typesystem} from "../../typesystem";
import {notNullish} from "@vueuse/core";
import PlainSelect from "../PlainSelect.vue";

const props = defineProps<{
    data: SingleFilter
    vars: Variable[]
}>()
const methods = computed(() => {
    const value = props.vars.find(v => v.name === props.data.left.name);
    if (!value) {
        return
    }
    return typesystem.getMethods(value.type, tBoolean)
})
const inputs = computed<DefineComponent[]>(() => {
    const method = (methods.value as FunctionDefine[])?.find(v => v.id === props.data.function);
    if (!method) {
        return []
    }
    const rest = method.args.slice(1)
    return rest.map(type => getRenderByType(toRaw(type))).filter(notNullish);
})
</script>

<style scoped>

</style>
