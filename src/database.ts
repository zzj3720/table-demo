import {tArray, tBoolean, tDate, tEmail, tNumber, tPhone, tString, TType, tUnion, tURL, typesystem} from './typesystem'
import Number from "./components/columns/Number.vue";
import Text from "./components/columns/Text.vue";
import Table from "./components/views/Table.vue";
import Checkbox from "./components/columns/Checkbox.vue";
import Date from "./components/columns/Date.vue";
import {nanoid} from "nanoid";
import Select from "./components/columns/Select.vue";
import {notNullish} from "@vueuse/core";
import MultiSelect from "./components/columns/MultiSelect.vue";
import mockjs, {mock} from 'mockjs'
import {toRaw} from "vue";

export type Variable = { name: string; type: TType, id: string };
export type FilterGroup = {
    type: 'group'
    op: 'and' | 'or';
    conditions: Filter[];
}
export type VariableRef = {
    type: 'ref';
    name: string;
}

export type Property = {
    type: 'property';
    ref: VariableRef;
    propertyFuncName: string;
}

export type VariableOrProperty = VariableRef | Property;

export type Literal = {
    type: 'literal';
    value: unknown;
}
export type Value = VariableRef | Literal;
export type SingleFilter = {
    type: 'filter'
    left: VariableOrProperty;
    function: string;
    args: Value[]
}
export type Filter = SingleFilter | FilterGroup;
export type SortExp = {
    left: VariableOrProperty;
    type: 'asc' | 'desc';
}

export type SortGroup = SortExp[]

type ColumnFormat = {
    name: string;
    type: (data: unknown) => TType;
    cellRender: any;
    random: (data: unknown) => unknown;
};
export const ColumnFormat = [
    {
        name: 'Number',
        type: () => tNumber(),
        cellRender: Number,
        random: () => {
            return mockjs.Random.integer(0, 100)
        }
    },
    {
        name: 'Text',
        type: () => tString(),
        cellRender: Text,
        random() {
            return mockjs.Random.word()
        }
    },
    {
        name: 'Date',
        type: () => tDate,
        cellRender: Date,
        random() {
            return +new window.Date()
        }
    },
    {
        name: 'URL',
        type: () => tURL,
        cellRender: Text,
        random() {
            return mockjs.Random.pick([
                "https://www.wikipedia.org/",
                "https://www.youtube.com/",
                "https://www.nytimes.com/",
                "https://www.instagram.com/",
                "https://www.twitter.com/",
                "https://www.reddit.com/",
                "https://www.amazon.com/",
                "https://www.spotify.com/",
                "https://www.apple.com/",
                "https://www.nasa.gov/",
                "https://www.bbc.com/",
                "https://www.cnn.com/",
                "https://www.nationalgeographic.com/",
                "https://www.imdb.com/",
                "https://www.udemy.com/",
                "https://www.linkedin.com/",
                "https://www.quora.com/",
                "https://www.ebay.com/",
                "https://www.pinterest.com/",
                "https://www.github.com/",
            ])
        }
    },
    {
        name: 'Checkbox',
        type: () => tBoolean(),
        cellRender: Checkbox,
        random() {
            return mockjs.Random.boolean()
        }
    },
    {
        name: 'Email',
        type: () => tEmail,
        cellRender: Text,
        random() {
            return mockjs.Random.email();
        }
    },
    {
        name: 'Phone',
        type: () => tPhone,
        cellRender: Text,
        random() {
            return mockjs.Random.email();
        }
    },
    {
        name: 'Select',
        type: (data) => tUnion(Array.isArray(data) ? data.map(s => typeof s === 'string' ? tString(s) : null).filter(notNullish) : []),
        cellRender: Select,
        random(data) {
            if (!Array.isArray(data)) {
                return
            }
            return mockjs.Random.pick(data);
        }
    },
    {
        name: 'Multi-Select',
        type: (data) => tArray(tUnion(Array.isArray(data) ? data.map(s => typeof s === 'string' ? tString(s) : null).filter(notNullish) : [])),
        cellRender: MultiSelect,
        random(data) {
            if (!Array.isArray(data)) {
                return
            }
            const count = mockjs.Random.integer(0, data.length);
            const set = [...data];
            const result = [];
            for (let i = 0; i < count; i++) {
                const pickI = mockjs.Random.integer(0, set.length)
                result.push(...set.splice(pickI, 1));
            }
            return result;
        }
    },
] satisfies ColumnFormat[]
export const getFormat = (name: string): ColumnFormat | undefined => {
    return ColumnFormat.find(v => v.name === name);
}
export type Column = {
    id: string;
    name: string;
    format: string;
    data?: unknown;
}
export type View = {
    type: string;
    name: string;
}
export type TableViewColumn = {
    id: string;
    width?: number;
    show?: boolean;
};
export type TableView = {
    columns: TableViewColumn[]
    filter: FilterGroup;
    sort: SortGroup;
    fixed: number;
} & View

export type Row = Record<string, unknown>
export type ColumnMap = Record<string, Column>;
export type Database = {
    rows: Row[];
    views: View[];
    columnMap: ColumnMap
}
type ViewMeta = {
    type: string;
    render: any
}
export const Views: Record<string, ViewMeta> = {
    Table: {
        type: 'Table',
        render: Table
    }
}
export const createColumn = (name: string, format: string, data?: unknown): Column => {
    return {
        id: nanoid(),
        name,
        format,
        data
    }
}
export const typeToString = (type: TType): string => {
    switch (type.type) {
        case "string":
            if (type.literal) {
                return `"${type.literal}"`
            }
        case "number":
        case "boolean":
        case "unknown":
            if (type.literal != null) {
                return `${type.literal}`
            }
            return type.type
        case "array":
            return `Array<${typeToString(type.ele)}>`
        case "Trait":
            return type.title
        case "union":
            return `Union<${type.list.map(typeToString).join(', ')}>`
        case "typeRef":
            return type.name
    }
}
const evalRef = (ref: VariableOrProperty, row: Record<string, unknown>): unknown => {
    if (ref.type === "ref") {
        return row[ref.name]
    }
    const value = evalRef(ref.ref, row);
    const fn = typesystem.propertyMap[ref.propertyFuncName];
    try {
        return fn.impl(value)
    } catch (e) {
        console.error(e)
        return
    }
}

const evalValue = (value: Value, row: Record<string, unknown>): unknown => {
    switch (value.type) {
        case "ref":
            return evalRef(value, row)
        case "literal":
            return value.value;
    }
}
export const evalFilter = (filterGroup: FilterGroup, row: Record<string, unknown>) => {
    const evalF = (filter: Filter): unknown => {
        switch (filter.type) {
            case "filter":
                const value = evalRef(filter.left, row);
                const func = typesystem.functionMap[filter.function];
                const args = filter.args.map(value => evalValue(value, row))
                // console.log(toRaw(filter), toRaw(value), toRaw(func), args)
                try {
                    let impl = func.impl(value, ...args);
                    // console.log(impl)
                    return impl
                } catch (e) {
                    console.error(e);
                    return
                }
            case "group":
                switch (filter.op) {
                    case 'and':
                        return filter.conditions.every(f => evalF(f))
                    case 'or':
                        return filter.conditions.some(f => evalF(f))
                }
        }
    }
    // console.log(evalF(filterGroup))
    return evalF(filterGroup)
}
const evalSort = (sortGroup: SortGroup) => {

}
