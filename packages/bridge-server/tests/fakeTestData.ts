import type { KvKey } from "@deno/kv";

type FakeEntry = {
  key: KvKey;
  value: unknown;
};

export const fakeData: FakeEntry[] = [
  {
    key: ["users", "dave"],
    value: { name: "Dave", age: 30 },
  },
  {
    key: ["users", "king"],
    value: { name: "King", age: 22 },
  },
  {
    key: ["products", "laptop"],
    value: { brand: "Dell", price: 1200, stock: 15 },
  },
  {
    key: ["orders", "order123"],
    value: { user: "dave", items: ["laptop"], total: 1200 },
  },
  {
    key: ["settings", "theme"],
    value: { darkMode: true, fontSize: "medium" },
  },
  {
    key: ["sessions", "sessionA"],
    value: { user: "king", expires: "2025-07-22T10:00:00Z" },
  },
  {
    key: ["logs", "2025-07-21T09:00:00Z"],
    value: { event: "login", user: "dave", success: true },
  },
  {
    key: ["inventory", "item42"],
    value: { name: "Mouse", quantity: 50, location: "Aisle 3" },
  },
  {
    key: ["messages", "msg001"],
    value: { from: "king", to: "dave", text: "Hello Dave!" },
  },
  {
    key: ["analytics", "visits", "2025-07-21"],
    value: { count: 120, unique: 85 },
  },
];
