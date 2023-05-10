import {ColumnMap, Filter, FilterGroup, getFormat, TableView, Variable} from "../database";
import {tBoolean, typesystem} from "../typesystem";
import {notNullish} from "@vueuse/core";

export const initFilter = (vars: Variable[]): Filter => {
    const {name, type} = vars[0];
    const id = typesystem.getMethods(type, tBoolean())[0].id
    return {
        type: 'filter',
        left: {type: 'ref', name},
        args: [],
        function: id,
    }
}
export const initFilterGroup = (vars: Variable[]): FilterGroup => {
    return {type: 'group', conditions: [initFilter(vars)], op: 'and'}
}
export const createVars = (columnMap: ColumnMap) => {
    return Object.values(columnMap).map(column => {
        const type = getFormat(column.format)?.type(column.data);
        if (!type) {
            return
        }
        return {
            name: column.name,
            type,
        }
    }).filter(notNullish) as Variable[]
}
