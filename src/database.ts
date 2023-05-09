import {tBoolean, tDate, tEmail, tNumber, tPhone, tString, TType, tURL} from './typesystem'
import {DefineComponent} from "vue";
import Number from "./components/columns/Number.vue";
import Text from "./components/columns/Text.vue";
import Table from "./components/views/Table.vue";
import Checkbox from "./components/columns/Checkbox.vue";
import Date from "./components/columns/Date.vue";
import {nanoid} from "nanoid";

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
    type: TType;
    render: any;
};
export const ColumnFormat = [
    {
        name: 'Number',
        type: tNumber,
        render: Number
    },
    {
        name: 'Text',
        type: tString,
        render: Text
    },
    {
        name: 'Date',
        type: tDate,
        render: Date
    },
    {
        name: 'URL',
        type: tURL,
        render: Text
    },
    {
        name: 'Checkbox',
        type: tBoolean,
        render: Checkbox
    },
    {
        name: 'Email',
        type: tEmail,
        render: Text
    },
    {
        name: 'Phone',
        type: tPhone,
        render: Text
    },
    // {
    //     name: 'Select',
    //     type: tString,
    //     render: Select
    // },
    // {
    //     name: 'Multi-Select',
    //     type: tArray(tString),
    //     render: MultiSelect
    // },
] satisfies ColumnFormat[]
export const getFormat = (name: string): ColumnFormat | undefined => {
    return ColumnFormat.find(v => v.name === name);
}
export type Column = {
    id: string;
    name: string;
    format: string;
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
export const createColumn = (name: string, format: string): Column => {
    return {
        id: nanoid(),
        name,
        format,
    }
}
export const typeToString = (type: TType): string => {
    switch (type.type) {
        case "string":
        case "number":
        case "boolean":
        case "unknown":
            return type.type
        case "array":
            return `Array<${typeToString(type.ele)}>`
        case "Trait":
            return type.title
    }
}
