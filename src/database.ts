import {tArray, tBoolean, tDate, tEmail, tNumber, tPhone, tString, TType, tUnion, tURL} from './typesystem'
import Number from "./components/columns/Number.vue";
import Text from "./components/columns/Text.vue";
import Table from "./components/views/Table.vue";
import Checkbox from "./components/columns/Checkbox.vue";
import Date from "./components/columns/Date.vue";
import {nanoid} from "nanoid";
import Select from "./components/columns/Select.vue";
import {notNullish} from "@vueuse/core";
import MultiSelect from "./components/columns/MultiSelect.vue";

export type Variable = { name: string; type: TType };
export type FilterGroup = {
    type: 'group'
    op: 'and' | 'or';
    conditions: Filter[];
}
export type FilterRef = {
    type: 'ref';
    name: string;
}
export type Literal = {
    type: 'literal';
    value: unknown;
}
export type Value = FilterRef | Literal;
export type SingleFilter = {
    type: 'filter'
    left: FilterRef;
    function: string;
    args: Value[]
}
export type Filter = SingleFilter | FilterGroup;

type ColumnFormat = {
    name: string;
    type: (data: unknown) => TType;
    cellRender: any;
};
export const ColumnFormat = [
    {
        name: 'Number',
        type: () => tNumber(),
        cellRender: Number
    },
    {
        name: 'Text',
        type: () => tString(),
        cellRender: Text
    },
    {
        name: 'Date',
        type: () => tDate,
        cellRender: Date
    },
    {
        name: 'URL',
        type: () => tURL,
        cellRender: Text
    },
    {
        name: 'Checkbox',
        type: () => tBoolean(),
        cellRender: Checkbox
    },
    {
        name: 'Email',
        type: () => tEmail,
        cellRender: Text
    },
    {
        name: 'Phone',
        type: () => tPhone,
        cellRender: Text
    },
    {
        name: 'Select',
        type: (data) => tUnion(Array.isArray(data) ? data.map(s => typeof s === 'string' ? tString(s) : null).filter(notNullish) : []),
        cellRender: Select,
    },
    {
        name: 'Multi-Select',
        type: (data) => tArray(tUnion(Array.isArray(data) ? data.map(s => typeof s === 'string' ? tString(s) : null).filter(notNullish) : [])),
        cellRender: MultiSelect
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
