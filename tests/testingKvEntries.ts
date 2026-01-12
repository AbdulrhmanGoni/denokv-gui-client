export const randomTestingKvEntries = [
    {
        key: ['admins', 'alex', 'settings'],
        value: { type: "Object", data: JSON.stringify({ theme: "dark", notifications: { email: true, push: false }, language: "en-US" }) }
    },
    {
        key: ['stats', 2024, 5],
        value: { type: "Array", data: JSON.stringify([120, 150, 180, 210]) }
    },
    {
        key: ['logs', 1715769000000],
        value: { type: "Date", data: "2024-05-15T10:30:00.000Z" }
    },
    {
        key: ['is_active', true],
        value: { type: "Boolean", data: true }
    },
    {
        key: ['search', 'pattern'],
        value: { type: "RegExp", data: JSON.stringify({ source: "^[a-z]+$", flags: "i" }) }
    },
    {
        key: ['cache', 'empty_val'],
        value: { type: "Null", data: "null" }
    },
    {
        key: ['system', 'counter'],
        value: { type: "KvU64", data: "42" }
    },
    {
        key: ['system', 'void'],
        value: { type: "Undefined", data: "undefined" }
    },
    {
        key: ['meta', 'tags'],
        value: { type: "Set", data: "new Set(['typescript', 'deno', 'gui'])" }
    },
    {
        key: ['meta', 'mapping'],
        value: { type: "Map", data: "new Map([['key1', 'val1'], ['key2', 'val2']])" }
    },
    {
        key: ['math', 'pi'],
        value: { type: "Number", data: 3.14159265359 }
    }
];

export const usersTestingKvEntries = [
    {
        key: ['users', 1],
        value: {
            type: "Object",
            data: JSON.stringify({ name: "Magnus Carlsen", elo: 2853, title: "GM", team: "Norway" })
        }
    },
    {
        key: ['users', 2],
        value: {
            type: "Object",
            data: JSON.stringify({ name: "Hikaru Nakamura", elo: 2802, title: "GM", team: "USA" })
        }
    },
    {
        key: ['users', 3],
        value: {
            type: "Object",
            data: JSON.stringify({ name: "Fabiano Caruana", elo: 2805, title: "GM", team: "USA" })
        }
    },
    {
        key: ['users', 4],
        value: {
            type: "Object",
            data: JSON.stringify({ name: "Praggnanandhaa R", elo: 2747, title: "GM", team: "India" })
        }
    },
    {
        key: ['users', 5],
        value: {
            type: "Object",
            data: JSON.stringify({ name: "Alice Smith", elo: 2450, title: "IM", team: "England" })
        }
    },
    {
        key: ['users', 6],
        value: {
            type: "Object",
            data: JSON.stringify({ name: "Bob Johnson", elo: 2300, title: "FM", team: "Canada" })
        }
    },
    {
        key: ['users', 7],
        value: {
            type: "Object",
            data: JSON.stringify({ name: "Charlie Brown", elo: 2410, title: "IM", team: "Germany" })
        }
    },
    {
        key: ['users', 8],
        value: {
            type: "Object",
            data: JSON.stringify({ name: "David Miller", elo: 2250, title: "FM", team: "Brazil" })
        }
    },
    {
        key: ['users', 9],
        value: {
            type: "Object",
            data: JSON.stringify({ name: "Eve Davis", elo: 2380, title: "IM", team: "Spain" })
        }
    },
    {
        key: ['users', 10],
        value: {
            type: "Object",
            data: JSON.stringify({ name: "Frank Wright", elo: 2200, title: "FM", team: "Italy" })
        }
    },
]