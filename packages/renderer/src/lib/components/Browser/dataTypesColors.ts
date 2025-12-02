const blue = "dark:text-blue-500 text-blue-800"

const dataTypesColors: Record<string, string> = {
    number: "text-[#59a500] dark:text-[#b3ff59]",
    string: "text-[#c6834e]",
    boolean: "dark:text-[#6c48b5] text-[#8142ff]",
    bigint: blue,
    kvu64: "dark:text-[#ffdd00] text-[#e5ab00]",
    uint8Array: "text-[#6f4dff] dark:text-[#9981ff]",
    null: "text-[#006ac7]",
    undefined: "dark:text-gray-400 text-gray-500",
    regexp: "text-[coral]",
    date: "dark:text-[#a9cbff] text-[#386cb7]",
    blue,
};

export default dataTypesColors