import {AnyFn} from "@vueuse/core";
import {ref, Ref, toRaw} from "vue";
import BooleanInput from "./components/value/BooleanInput.vue";
import DateInput from "./components/value/DateInput.vue";
import NumberInput from "./components/value/NumberInput.vue";
import StringInput from "./components/value/StringInput.vue";
import {nanoid} from "nanoid";
import ArrayInput from "./components/value/ArrayInput.vue";
import UnionInput from "./components/value/UnionInput.vue";

interface TUnknown {
    type: 'unknown';
    title: 'unknown';
    literal?: unknown;
}

export const tUnknown = (): TUnknown => ({
    type: 'unknown',
    title: 'unknown'
})

interface TString {
    type: 'string';
    title: 'string';
    literal?: string;
}

export const tString = (literal?: string): TString => ({
    type: 'string',
    title: 'string',
    literal
})


interface TNumber {
    type: 'number';
    title: 'number';
    literal?: number;
}

export const tNumber = (literal?: number): TNumber => ({
    type: 'number',
    title: 'number',
    literal,
})

interface TBoolean {
    type: 'boolean';
    title: 'boolean'
    literal?: boolean;
}

export const tBoolean = (literal?: boolean): TBoolean => ({
    type: 'boolean',
    title: 'boolean',
    literal,
})

interface TUnion {
    type: 'union';
    title: 'union';
    list: TType[];
}

export const tUnion = (list: TType[]): TUnion => ({
    type: 'union',
    title: 'union',
    list,
})

export interface TArray<Ele extends TType = TType> {
    type: 'array';
    ele: TType;
    title: 'array'
}

export const tArray = <const T extends TType>(ele: T): TArray<T> => {
    return {
        type: 'array',
        title: 'array',
        ele,
    }
}
export type TTypeVar = {
    type: 'typeVar';
    title: 'typeVar';
    name: string;
    bound: TType;
}
export const tTypeVar = (name: string, bound: TType): TTypeVar => {
    return {
        type: 'typeVar',
        title: 'typeVar',
        name,
        bound,
    }
}
export type TTypeRef = {
    type: 'typeRef';
    title: 'typeRef';
    name: string;
}
export const tTypeRef = (name: string): TTypeRef => {
    return {
        type: 'typeRef',
        title: 'typeRef',
        name,
    }
}
export type Primitive = TUnknown | TString | TNumber | TBoolean;

export type TType = Primitive | TraitType | TArray | TUnion | TTypeRef

interface FunctionTypeDefine<Args extends TType[] = any[], Return extends TType = any> {
    typeVars?: TTypeVar[];
    args: Args;
    rt: Return;
}


type FunctionTypeFromFunctionDefine<Args extends any[]> = (...args: { [K in keyof Args]: unknown }) => unknown;

interface TraitType {
    type: 'Trait'
    name: symbol;
    title: string;
    merge: TType[],
}

export type FunctionDefine = {
    name: string;
    id: string;
    type: FunctionTypeDefine;
    staticType: FunctionTypeDefine;
    impl: string
}
type PropertyDefine = {
    name: string;
    self: TType;
    rt: TType;
    impl: AnyFn
}

export class Typesystem {
    traitMap = new Map<symbol, TraitType>();
    functionMap: Ref<Record<string, FunctionDefine>> = ref({});
    propertyMap = new Map<string, PropertyDefine>();

    setFunctionMap(map: Ref<Record<string, FunctionDefine>>) {
        this.functionMap = map;
    }

    defineTrait(name: string, merge: TType[]): TraitType {
        const symbol = Symbol(name);
        const trait: TraitType = {
            type: 'Trait',
            name: symbol,
            title: name,
            merge: merge,
        };
        this.traitMap.set(symbol, trait);
        return trait;
    }

    defineFunction<Args extends TType[], RT extends TType>(name: string, type: FunctionTypeDefine<Args, RT>, impl: AnyFn) {
        const id = nanoid();
        const staticType = this.subst(Object.fromEntries(type.typeVars?.map(v => [v.name, v.bound]) ?? []), type);
        const func: FunctionDefine = {
            id,
            name,
            type,
            staticType,
            impl: impl.toString(),
        }
        this.functionMap.value[id] = func
    }

    defineProperty<Arg extends TType, RT extends TType>(name: string, arg: Arg, ret: RT, impl: FunctionTypeFromFunctionDefine<[Arg]>) {
        const property: PropertyDefine = {
            name,
            self: arg,
            rt: ret,
            impl,
        }
        this.propertyMap.set(name, property)
    }

    getProperties(self: TType): PropertyDefine[] {
        const result: PropertyDefine[] = [];
        for (const property of this.propertyMap.values()) {
            if (this.isSubtype(self, property.self)) {
                result.push(property)
            }
        }
        return result;
    }

    getMethods(self: TType, ret: TType): FunctionDefine[] {
        const result: FunctionDefine[] = [];
        for (const func of Object.values(this.functionMap.value)) {
            if (func.staticType.args.length >= 1 && this.isSubtype(func.staticType.args[0], self) && this.isSubtype(ret, func.staticType.rt)) {
                result.push(func)
            }
        }
        return result;
    }

    isPrimitive(t: TType): t is Primitive {
        return t.type !== 'array' && t.type !== 'Trait' && t.type !== 'typeRef' && t.type !== 'union';
    }

    equal(t1: TType, t2: TType): boolean {
        if (t1.type === 'typeRef' || t2.type === 'typeRef') {
            if (t1.type !== 'typeRef' || t2.type !== 'typeRef') {
                return false;
            }
            return t1.name === t2.name
        }
        if (t1.type !== t2.type) {
            return false;
        }
        if (this.isPrimitive(t1)) {
            return t1.type === t2.type;
        }
        if (t1.type === 'union' && t2.type === 'union') {
            if (t1.list.length !== t2.list.length) {
                return false
            }
            const set = new Set(t2.list);
            for (const innerT1 of t1.list) {
                for (const innerT2 of set) {
                    if (this.equal(innerT1, innerT2)) {
                        set.delete(innerT2);
                    }
                }
            }
            return set.size === 0
        }
        if (t1.type === 'array' && t2.type === 'array') {
            return this.equal(t1.ele, t2.ele)
        }
        if (t1.type === 'Trait' && t2.type === 'Trait') {
            return t1.name === t2.name
        }
        return false
    }

    isSubtype(parent: TType, sub: TType, context?: Record<string, TType>): boolean {
        if (parent.type === 'typeRef') {
            // TODO both are ref
            console.log(context, parent, sub)
            if (context && sub.type != "typeRef") {
                console.log(context, parent, sub)
                context[parent.name] = sub;
            }
            // TODO bound
            return true;
        }
        if (sub.type === 'typeRef') {
            // TODO both are ref
            if (context) {
                context[sub.name] = parent;
            }
            return true;
        }
        if (parent.type === 'unknown') {
            return true;
        }
        if (this.isPrimitive(sub)) {
            return parent.type === sub.type;
        }
        if (parent.type === 'union') {
            return parent.list.some(type => this.isSubtype(type, sub, context))
        }
        if (sub.type === 'union') {
            return sub.list.every(type => this.isSubtype(parent, type, context))
        }
        if (parent.type === 'array' || sub.type === 'array') {
            if (parent.type !== 'array' || sub.type !== "array") {
                return false
            }
            console.log(parent.ele, sub.ele)
            return parent.type === sub.type && this.isSubtype(parent.ele, sub.ele,context)
        }
        const findParent = (self: TType, target: TType): boolean => {
            if (this.equal(self, target)) {
                return true;
            }
            if (self.type !== 'Trait') {
                return false
            }
            for (const parent of self.merge) {
                const r = findParent(parent, target);
                if (r) {
                    return r;
                }
            }
            return false
        }
        return findParent(sub, parent)
    }

    getTypeMap(): Record<string, TType> {
        return Object.fromEntries(this.getTypes().map(v => [v.title, v]))
    }

    getTypes(): TType[] {
        return [tUnknown(), tBoolean(), tString(), tNumber(), ...this.traitMap.values()]
    }

    getFunctions() {
        return Object.values(this.functionMap.value)
    }

    subst(context: Record<string, TType>, template: FunctionTypeDefine): FunctionTypeDefine {
        const subst = (type: TType): TType => {
            if (this.isPrimitive(type)) {
                return {...type};
            }
            switch (type.type) {
                case "Trait":
                    return {...type};
                case "typeRef":
                    return {...context[type.name]}
                case "union":
                    return tUnion(type.list.map(type => subst(type)))
                case "array":
                    return tArray(subst(type.ele))
            }
        }
        const result = {
            args: template.args.map(type => subst(type)),
            rt: subst(template.rt)
        };
        return result
    }

    instance(context: Record<string, TType>, realArgs: TType[], realRt: TType, template: FunctionTypeDefine): FunctionTypeDefine {
        const ctx = {...context};
        template.args.forEach((arg, i) => {
            const realArg = realArgs[i];
            if (realArg) {
                this.isSubtype(arg, realArg, ctx)
            }
        })
        this.isSubtype(realRt, template.rt);
        console.log(ctx)
        return this.subst(ctx, template)
    }
}

export const typesystem = new Typesystem();
export const tDate = typesystem.defineTrait('Date', [tUnknown()])
export const tURL = typesystem.defineTrait('URL', [tString(), tUnknown()])
export const tEmail = typesystem.defineTrait('Email', [tString(), tUnknown()])
export const tPhone = typesystem.defineTrait('Phone', [tString(), tUnknown()])
export const InputRenderList: { type: TType, render: any }[] = [];
InputRenderList.push({type: tBoolean(), render: BooleanInput})
InputRenderList.push({type: tDate, render: DateInput})
InputRenderList.push({type: tURL, render: StringInput})
InputRenderList.push({type: tPhone, render: StringInput})
InputRenderList.push({type: tEmail, render: StringInput})
InputRenderList.push({type: tNumber(), render: NumberInput})
InputRenderList.push({type: tString(), render: StringInput})
InputRenderList.push({type: tUnion([]), render: UnionInput})
InputRenderList.push({type: tArray(tUnknown()), render: ArrayInput})
export const getRenderByType = (type: TType) => {
    return InputRenderList.find(v => typesystem.isSubtype(v.type, type))?.render
}
export const initFunction = (typesystem: Typesystem) => {
    typesystem.defineFunction('Is empty', {args: [tUnknown()], rt: tBoolean()}, (value) => {
        return value == null;
    })
    typesystem.defineFunction('Is not empty', {args: [tUnknown()], rt: tBoolean()}, (value) => {
        return value == null;
    })
    typesystem.defineFunction('Is', {args: [tString(), tString()], rt: tBoolean()}, (value, target) => {
        return typeof value === 'string' && value == target;
    })
    typesystem.defineFunction('Is not', {args: [tString(), tString()], rt: tBoolean()}, (value, target) => {
        return typeof value === 'string' && value != target;
    })
    typesystem.defineFunction('Contains', {args: [tString(), tString()], rt: tBoolean()}, (value, target) => {
        return typeof value === 'string' && value.includes(target);
    })
    typesystem.defineFunction('Does no contains', {args: [tString(), tString()], rt: tBoolean()}, (value, target) => {
        return typeof value === 'string' && !value.includes(target);
    })
    typesystem.defineFunction('Starts with', {args: [tString(), tString()], rt: tBoolean()}, (value, target) => {
        return typeof value === 'string' && value.startsWith(target);
    })
    typesystem.defineFunction('Ends with', {args: [tString(), tString()], rt: tBoolean()}, (value, target) => {
        return typeof value === 'string' && value.endsWith(target);
    })
    typesystem.defineFunction('Characters less than', {
        args: [tString(), tNumber()],
        rt: tBoolean()
    }, (value, target) => {
        return typeof value === 'string' && value.length < target;
    })
    typesystem.defineFunction('>', {args: [tNumber(), tNumber()], rt: tBoolean()}, (value, target) => {
        return typeof value === 'number' && value > target;
    })
    typesystem.defineFunction('>=', {args: [tNumber(), tNumber()], rt: tBoolean()}, (value, target) => {
        return typeof value === 'number' && value >= target;
    })
    typesystem.defineFunction('<', {args: [tNumber(), tNumber()], rt: tBoolean()}, (value, target) => {
        return typeof value === 'number' && value < target;
    })
    typesystem.defineFunction('<=', {args: [tNumber(), tNumber()], rt: tBoolean()}, (value, target) => {
        return typeof value === 'number' && value <= target;
    })
    typesystem.defineFunction('==', {args: [tNumber(), tNumber()], rt: tBoolean()}, (value, target) => {
        return typeof value === 'number' && value == target;
    })
    typesystem.defineFunction('!=', {args: [tNumber(), tNumber()], rt: tBoolean()}, (value, target) => {
        return typeof value === 'number' && value != target;
    })
    typesystem.defineFunction('Is', {args: [tDate, tDate], rt: tBoolean()}, (value, target) => {
        return typeof value === 'number' && value == target;
    })
    typesystem.defineFunction('Is inside', {
        typeVars: [tTypeVar('options', tUnion([tString()]))],
        args: [tTypeRef('options'), tArray(tTypeRef('options'))],
        rt: tBoolean()
    }, (value, target) => {
        return Array.isArray(target) && target.includes(value);
    })
    typesystem.defineFunction('Is not inside', {
        typeVars: [tTypeVar('options', tUnion([tString()]))],
        args: [tTypeRef('options'), tArray(tTypeRef('options'))],
        rt: tBoolean()
    }, (value, target) => {
        return Array.isArray(target) && !target.includes(value);
    })
    typesystem.defineFunction('Contains all', {
        typeVars: [tTypeVar('options', tUnion([tString()]))],
        args: [tArray(tTypeRef('options')), tArray(tTypeRef('options'))],
        rt: tBoolean()
    }, (value, target) => {
        return Array.isArray(target) && target.includes(value);
    })
    typesystem.defineFunction('Contains one of', {
        typeVars: [tTypeVar('options', tUnion([tString()]))],
        args: [tArray(tTypeRef('options')), tArray(tTypeRef('options'))],
        rt: tBoolean()
    }, (value, target) => {
        return Array.isArray(target) && !target.includes(value);
    })
    typesystem.defineFunction('Does not contains one of', {
        typeVars: [tTypeVar('options', tUnion([tString()]))],
        args: [tArray(tTypeRef('options')), tArray(tTypeRef('options'))],
        rt: tBoolean()
    }, (value, target) => {
        return Array.isArray(target) && !target.includes(value);
    })
    typesystem.defineFunction('Does not contains all', {
        typeVars: [tTypeVar('options', tUnion([tString()]))],
        args: [tArray(tTypeRef('options')), tArray(tTypeRef('options'))],
        rt: tBoolean()
    }, (value, target) => {
        return Array.isArray(target) && !target.includes(value);
    })
    typesystem.defineProperty('Length', tString(), tNumber(), (value) => {
        if (typeof value !== 'string') {
            return 0;
        }
        return value.length;
    })
}
