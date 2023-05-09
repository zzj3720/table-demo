import {AnyFn} from "@vueuse/core";
import {DefineComponent, ref, Ref} from "vue";
import BooleanInput from "./components/value/BooleanInput.vue";
import DateInput from "./components/value/DateInput.vue";
import NumberInput from "./components/value/NumberInput.vue";
import StringInput from "./components/value/StringInput.vue";
import {nanoid} from "nanoid";

interface TUnknown {
    type: 'unknown';
    title: 'unknown'
}

export const tUnknown: TUnknown = {
    type: 'unknown',
    title: 'unknown'
}

interface TString {
    type: 'string';
    title: 'string'
}

export const tString: TString = {
    type: 'string',
    title: 'string'
}


interface TNumber {
    type: 'number';
    title: 'number'
}

export const tNumber: TNumber = {
    type: 'number',
    title: 'number'
}

interface TBoolean {
    type: 'boolean';
    title: 'boolean'
}

export const tBoolean: TBoolean = {
    type: 'boolean',
    title: 'boolean'
}

interface TArray<Ele extends TType = TType> {
    type: 'array';
    ele: TType;
    title: 'array'
}

export const tArray = <const T extends TType>(ele: T): { type: 'array'; ele: T; title: string } => {
    return {
        type: 'array',
        title: 'array',
        ele,
    }
}
export type Primitive = TUnknown | TString | TNumber | TBoolean;
export type TType = Primitive | TraitType | TArray

interface T2TMap<T> {
    boolean: boolean;
    number: number;
    string: string;
    array: T extends { ele: any } ? T2T<T['ele']>[] : never;
    data: T extends TraitType ? unknown : never
}

// @ts-expect-error
type T2T<T extends { type: string }> = T2TMap<T>[T['type']]

interface FunctionTypeDefine<Args extends TType[] = any[], Return extends TType = any> {
    args: Args;
    rt: Return;
}

type FunctionTypeFromFunctionDefine<Args extends any[], Return extends TType> = (...args: { [K in keyof Args]: T2T<Args[K]> }) => T2T<Return>;

interface TraitType {
    type: 'Trait'
    name: symbol;
    title: string;
    merge: TType[],
}

export type FunctionDefine = {
    name: string;
    id: string;
    args: TType[];
    rt: TType;
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
        const func: FunctionDefine = {
            id,
            name,
            args: type.args,
            rt: type.rt,
            impl: impl.toString(),
        }
        this.functionMap.value[id] = func
    }

    defineProperty<Arg extends TType, RT extends TType>(name: string, arg: Arg, ret: RT, impl: FunctionTypeFromFunctionDefine<[Arg], RT>) {
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
            if (func.args.length >= 1 && this.isSubtype(func.args[0], self) && this.isSubtype(ret, func.rt)) {
                result.push(func)
            }
        }
        return result;
    }

    isPrimitive(t: TType): t is Primitive {
        return t.type !== 'array' && t.type !== 'Trait';
    }

    equal(t1: TType, t2: TType): boolean {
        if (t1.type !== t2.type) {
            return false;
        }
        if (this.isPrimitive(t1)) {
            return t1.type === t2.type;
        }
        if (t1.type === 'array' && t2.type === 'array') {
            return this.equal(t1.ele, t2.ele)
        }
        if (t1.type === 'Trait' && t2.type === 'Trait') {
            return t1.name === t2.name
        }
        return false
    }

    isSubtype(parent: TType, sub: TType): boolean {
        if (parent.type === 'unknown') {
            return true;
        }
        if (this.isPrimitive(sub)) {
            return parent.type === sub.type;
        }
        if (parent.type === 'array' || sub.type === 'array') {
            if (parent.type !== 'array' || sub.type !== "array") {
                return false
            }
            return parent.type === sub.type && this.isSubtype(parent.ele, sub.ele)
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

    getTypes() {
        return [tUnknown, tBoolean, tString, tNumber, ...this.traitMap.values()]
    }

    getFunctions() {
        return Object.values(this.functionMap.value)
    }
}

export const typesystem = new Typesystem();
export const tDate = typesystem.defineTrait('Date', [tUnknown])
export const tURL = typesystem.defineTrait('URL', [tString, tUnknown])
export const tEmail = typesystem.defineTrait('Email', [tString, tUnknown])
export const tPhone = typesystem.defineTrait('Phone', [tString, tUnknown])

export const InputRenderList: { type: TType, render: any }[] = [];
InputRenderList.push({type: tBoolean, render: BooleanInput})
InputRenderList.push({type: tDate, render: DateInput})
InputRenderList.push({type: tURL, render: StringInput})
InputRenderList.push({type: tPhone, render: StringInput})
InputRenderList.push({type: tEmail, render: StringInput})
InputRenderList.push({type: tNumber, render: NumberInput})
InputRenderList.push({type: tString, render: StringInput})
export const getRenderByType = (type: TType) => {
    return InputRenderList.find(v => typesystem.equal(v.type, type))?.render
}
export const initFunction = (typesystem: Typesystem) => {
    typesystem.defineFunction('Is empty', {args: [tUnknown], rt: tBoolean}, (value) => {
        return value == null;
    })
    typesystem.defineFunction('Is not empty', {args: [tUnknown], rt: tBoolean}, (value) => {
        return value == null;
    })
    typesystem.defineFunction('Is', {args: [tString, tString], rt: tBoolean}, (value, target) => {
        return typeof value === 'string' && value == target;
    })
    typesystem.defineFunction('Is not', {args: [tString, tString], rt: tBoolean}, (value, target) => {
        return typeof value === 'string' && value != target;
    })
    typesystem.defineFunction('Contains', {args: [tString, tString], rt: tBoolean}, (value, target) => {
        return typeof value === 'string' && value.includes(target);
    })
    typesystem.defineFunction('Does no contains', {args: [tString, tString], rt: tBoolean}, (value, target) => {
        return typeof value === 'string' && !value.includes(target);
    })
    typesystem.defineFunction('Starts with', {args: [tString, tString], rt: tBoolean}, (value, target) => {
        return typeof value === 'string' && value.startsWith(target);
    })
    typesystem.defineFunction('Ends with', {args: [tString, tString], rt: tBoolean}, (value, target) => {
        return typeof value === 'string' && value.endsWith(target);
    })
    typesystem.defineFunction('Characters less than', {args: [tString, tNumber], rt: tBoolean}, (value, target) => {
        return typeof value === 'string' && value.length < target;
    })
    typesystem.defineFunction('>', {args: [tNumber, tNumber], rt: tBoolean}, (value, target) => {
        return typeof value === 'number' && value > target;
    })
    typesystem.defineFunction('>=', {args: [tNumber, tNumber], rt: tBoolean}, (value, target) => {
        return typeof value === 'number' && value >= target;
    })
    typesystem.defineFunction('<', {args: [tNumber, tNumber], rt: tBoolean}, (value, target) => {
        return typeof value === 'number' && value < target;
    })
    typesystem.defineFunction('<=', {args: [tNumber, tNumber], rt: tBoolean}, (value, target) => {
        return typeof value === 'number' && value <= target;
    })
    typesystem.defineFunction('==', {args: [tNumber, tNumber], rt: tBoolean}, (value, target) => {
        return typeof value === 'number' && value == target;
    })
    typesystem.defineFunction('!=', {args: [tNumber, tNumber], rt: tBoolean}, (value, target) => {
        return typeof value === 'number' && value != target;
    })
    typesystem.defineFunction('Is', {args: [tDate, tDate], rt: tBoolean}, (value, target) => {
        return typeof value === 'number' && value == target;
    })
    typesystem.defineProperty('Length', tString, tNumber, (value) => {
        if (typeof value !== 'string') {
            return 0;
        }
        return value.length;
    })
}
