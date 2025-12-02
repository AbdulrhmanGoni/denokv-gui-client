type DataType =
    | "String"
    | "Number"
    | "Boolean"
    | "BigInt"
    | "KvU64"
    | "Date"
    | "Object"
    | "Array"
    | "Set"
    | "Map"
    | "RegExp"
    | "Uint8Array"
    | "Null"
    | "Undefined";

export type KvDataType = {
    type: DataType;
    starter: string;
}

export const dataTypes: KvDataType[] = [
    {
        type: "String",
        starter: "",
    },
    {
        type: "Number",
        starter: ""
    },
    {
        type: "Boolean",
        starter: ""
    },
    {
        type: "BigInt",
        starter: ""
    },
    {
        type: "KvU64",
        starter: ""
    },
    {
        type: "Date",
        starter: ""
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
