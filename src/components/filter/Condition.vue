<template>
    <div style="display:flex;align-items:center;">
        <Ref :data="data.left" :vars="vars" style="margin-right: 4px;"></Ref>
        <div style="margin-right: 4px;display:flex;align-items:center;">
            <PlainSelect v-model:value="props.data.function"
                         :options="methods?.map(v=>({label:v.name,value:v.id}))"></PlainSelect>
        </div>
        <component v-for="(v,i) in inputs" :is="v.input" :key="i" :type="v.type"
                   v-model:value="data.args[i]"></component>
    </div>
</template>

<script lang="ts" setup>
import {SingleFilter, Variable} from "../../database";
import Ref from "./Ref.vue";
import {computed, toRaw} from "vue";
import {FunctionDefine, getRenderByType, tBoolean, TType, typesystem} from "../../typesystem";
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
    return typesystem.getMethods(value.type, tBoolean())
})
const inputs = computed<{ type: TType, input: any }[]>(() => {
    const method = (methods.value as FunctionDefine[])?.find(v => v.id === props.data.function);
    if (!method) {
        return []
    }
    const value = props.vars.find(v => v.name === props.data.left.name);
    const instancedFunc = typesystem.instance({}, [value.type], tBoolean(), method.type)
    const rest = instancedFunc.args.slice(1)
    const result = rest.map(type => {
        const input = getRenderByType(toRaw(type))
        if (input) {
            return {
                type,
                input,
            }
        }
    }).filter(notNullish);
    console.log(...rest);
    console.log(...result)
    return result;
})
</script>

<style scoped>

</style>
