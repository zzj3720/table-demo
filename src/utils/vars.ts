import {ColumnMap, Filter, FilterGroup, getFormat, TableView, Variable} from "../database";
import {tBoolean, typesystem} from "../typesystem";
import {notNullish} from "@vueuse/core";

export const initFilter = (vars: Variable[]): Filter => {
    const v = vars[0];
    const id = typesystem.getMethods(v.type, tBoolean())[0].name
    return {
        type: 'filter',
        left: {type: 'ref', name: v.id},
        args: [],
        function: id,
    }
}
export const initFilterGroup = (vars: Variable[]): FilterGroup => {
    return {type: 'group', conditions: [], op: 'and'}
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
            id: column.id,
        }
    }).filter(notNullish) as Variable[]
}
