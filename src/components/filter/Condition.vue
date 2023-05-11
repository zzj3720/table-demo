<template>
    <div style="display:flex;align-items:center;">
        <VariableRef v-model:data="data.left" :vars="vars" style="margin-right: 4px;"></VariableRef>
        <div style="margin-right: 4px;display:flex;align-items:center;">
            <PlainSelect v-model:value="props.data.function"
                         :options="methods?.map(v=>({label:v.name,value:v.name}))"></PlainSelect>
        </div>
        <component v-for="(v,i) in inputs" :is="v.input" :key="i" :type="v.type"
                   v-model:value="data.args[i]"></component>
    </div>
</template>

<script lang="ts" setup>
import {SingleFilter, Variable, VariableOrProperty} from "../../database";
import {computed, toRaw} from "vue";
import {FunctionDefine, getRenderByType, tBoolean, TType, typesystem} from "../../typesystem";
import {notNullish} from "@vueuse/core";
import PlainSelect from "../PlainSelect.vue";
import VariableRef from "../common/VariableRef.vue";

const props = defineProps<{
    data: SingleFilter
    vars: Variable[]
}>()
const getRefType = (ref: VariableOrProperty): TType => {
    if (ref.type === 'ref') {
        return props.vars.find(v => v.id === ref.name).type;
    }
    // TODO function type need instantiation
    // const refType = getRefType(ref.ref);
    const propertyFunction = typesystem.getPropertyFunc(ref.propertyFuncName)
    return propertyFunction.staticType.rt
}
const methods = computed(() => {
    const value = getRefType(props.data.left);
    if (!value) {
        return
    }
    return typesystem.getMethods(value, tBoolean())
})
const inputs = computed<{ type: TType, input: any }[]>(() => {
    const method = (methods.value as FunctionDefine[])?.find(v => v.name === props.data.function);
    if (!method) {
        return []
    }
    const value = getRefType(props.data.left);
    const instancedFunc = typesystem.instance({}, [value], tBoolean(), method.type)
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
    return result;
})
</script>

<style scoped>

</style>
