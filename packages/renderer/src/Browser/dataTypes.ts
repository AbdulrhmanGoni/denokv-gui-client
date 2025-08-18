export type KvDataType = {
    type: string;
    starter: string;
}

export const dataTypes: KvDataType[] = [
    {
        type: "String",
        starter: '""',
    },
    {
        type: "Number",
        starter: "0"
    },
    {
        type: "Boolean",
        starter: "false"
    },
    {
        type: "BigInt",
        starter: "BigInt(0)"
    },
    {
        type: "Date",
        starter: "new Date()"
    },
    {
        type: "Object",
        starter: "{}"
    },
    {
        type: "Array",
        starter: "[]"
    },
    {
        type: "Set",
        starter: "new Set([])"
    },
    {
        type: "Map",
        starter: "new Map([])"
    },
    {
        type: "RegExp",
        starter: 'new RegExp("")'
    },
    {
        type: "Uint8Array",
        starter: "new Uint8Array([])"
    },
    {
        type: "Null",
        starter: "null"
    },
    {
        type: "Undefined",
        starter: "undefined"
    },
];
