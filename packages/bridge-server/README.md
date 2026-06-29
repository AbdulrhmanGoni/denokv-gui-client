# @denokv-bridge-server

This package is a tiny web server provides a JSON-based API to access the Deno KV Database
from places like frontend web or mobile apps where using the Deno KV client directly (`Deno.openKv()` or `openKv()` in node) is not possible.

> [!NOTE]
> This package is mainly created to be used inside [Deno Kv GUI Client](https://abdulrhmangoni.github.io/denokv-gui-client/) desktop app
> or to be used as a bridge server between **_Deno Kv GUI Client_** app and a Deno Kv database that is existing in a place where **_Deno Kv GUI Client_** cant reach (e.g., Inside a docker container or In Memory database inside another process)

## Installation

**Deno:**

```shell
deno add jsr:@denokv-gui-client/bridge-server
```

**Node or Bun:**

```shell
npx jsr add @denokv-gui-client/bridge-server
# or
bunx jsr add @denokv-gui-client/bridge-server
# or
pnpm dlx jsr add @denokv-gui-client/bridge-server
# or
yarn dlx jsr add @denokv-gui-client/bridge-server
# or
vlt install jsr:@denokv-gui-client/bridge-server
```

## Starting the bridge server

### Deno

Import `openBridgeServerInDeno` function and call it with an instance of `Deno.Kv`

```ts
import { openBridgeServerInDeno } from "@denokv-gui-client/bridge-server";

const kv: Deno.Kv = await Deno.openKv();
const server: Deno.HttpServer<Deno.NetAddr> = openBridgeServerInDeno(kv);
// ...
server.shutdown(); // Later at some point if you want
```

### Node

Import `openBridgeServerInNode` function and call it with an instance of Node's `@deno/kv` client

```ts
import { openKv, type Kv } from "@deno/kv";
import { openBridgeServerInNode } from "@denokv-gui-client/bridge-server";
import { type ServerType } from "@hono/node-server";

const kv: Kv = await openKv();
const server: ServerType = openBridgeServerInNode(kv);
// ...
server.close(); // Later at some point if you want
```

### Server Configuration Options

Both `openBridgeServerInDeno` and `openBridgeServerInNode` functions accept the same 'options' object as the 2nd parameter.

| Option      | Type     | Default | Description                                                                    |
| ----------- | -------- | ------- | ------------------------------------------------------------------------------ |
| `port`      | `number` | 47168   | The port that the bridge server should be listening to                         |
| `authToken` | `string` | ""      | Authentication token that configures the server to be accessible only using it |

### Server's endpoints

The bridge server provides the following RESTful API endpoints. All endpoints return JSON responses either like this:

```json
{ "result": <some data...> }
```

or like this:

```json
{ "error": "some error message" }
```

#### GET /browse

List KV entries with optional filtering and pagination.

**Query Parameters:**

| Parameter     | Type      | Description                                                                                                                    |
| ------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `limit`       | `number`  | Maximum number of entries to return (must be a positive integer). Defaults to 40                                               |
| `cursor`      | `string`  | Cursor for pagination (obtained from previous browse response)                                                                 |
| `prefix`      | `string`  | Filter entries by key prefix. must be a URL-encoded JSON (`SerializedKvKey` type) or JavaScript literal                        |
| `start`       | `string`  | Start key for range query (inclusive). must be a URL-encoded JSON (`SerializedKvKey` type) or JavaScript literal               |
| `end`         | `string`  | End key for range query (exclusive). must be a URL-encoded JSON (`SerializedKvKey` type) or JavaScript literal                 |
| `batchSize`   | `number`  | The number of entries to fetch from the database at once.                                                                      |
| `consistency` | `string`  | The consistency level of the list operation. either `"strong"` or `"eventual"`.                                                |
| `reverse`     | `boolean` | Whether to return the entries in reverse order.                                                                                |
| `xssSafe`     | `boolean` | Whether to escape HTML characters and JS line terminators from strings. Defaults to `true` unless explicitly set to `"false"`. |
| `jsKey`       | `boolean` | Whether to parse the `prefix`, `start`, and `end` keys as JavaScript literals instead of strict JSON. Defaults to `false`.     |

> **None of the above query parameters is required**

#### GET /get/:key

Retrieve a specific KV entry by its key.

**Path Parameters:**

| Parameter | Type     | Required | Description                                                                |
| --------- | -------- | -------- | -------------------------------------------------------------------------- |
| `key`     | `string` | Yes      | The KV key (URL-encoded `SerializedKvKey` type JSON or JavaScript literal) |

**Query Parameters:**

| Parameter | Type      | Required | Description                                                                                                                    |
| --------- | --------- | -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `xssSafe` | `boolean` | No       | Whether to escape HTML characters and JS line terminators from strings. Defaults to `true` unless explicitly set to `"false"`. |
| `jsKey`   | `boolean` | No       | Whether to parse the `key` as a JavaScript literal instead of strict JSON. Defaults to `false`.                                |

#### PUT /set

Create or update a KV entry.

**Query Parameters:**

| Parameter   | Type      | Required | Description                                                                                                         |
| ----------- | --------- | -------- | ------------------------------------------------------------------------------------------------------------------- |
| `key`       | `string`  | Yes      | The KV key (URL-encoded `SerializedKvKey` type JSON or JavaScript literal)                                          |
| `expires`   | `number`  | No       | Expiration timestamp in milliseconds                                                                                |
| `overwrite` | `boolean` | No       | Whether to overwrite the value of the key if it already exists. Defaults to `true` unless explicitly set to `false` |
| `jsKey`     | `boolean` | No       | Whether to parse the `key` as a JavaScript literal instead of strict JSON. Defaults to `false`.                     |

**Request Body:**

The request body must be a JSON object representing a serialized KV value (`SerializedKvValue`).

```json
  {
    "type": "Value Type",
    "data": <Data>,
  }
```

#### DELETE /delete

Remove a KV entry from the Deno Kv database.

**Query Parameters:**

| Parameter | Type      | Required | Description                                                                                     |
| --------- | --------- | -------- | ----------------------------------------------------------------------------------------------- |
| `key`     | `string`  | Yes      | The KV key (URL-encoded `SerializedKvKey` type JSON or JavaScript literal)                      |
| `jsKey`   | `boolean` | No       | Whether to parse the `key` as a JavaScript literal instead of strict JSON. Defaults to `false`. |

#### GET /check

Health check endpoint to verify KV database connectivity.

**Example Request:**

```
curl http://localhost:47168/check
> { "result": true }
```

#### POST /enqueue

Enqueue a message into the Deno KV Queue.

**Request Body:**

The request body must be a JSON object:

```json
{
  "value": <SerializedKvValue>,
  "options": {
    "delay": <number>,
    "backoffSchedule": <number[]>,
    "keysIfUndelivered": <string> // A string containing a JavaScript array of Deno KV keys.
  }
}
```

#### POST /atomic

Perform multiple KV operations atomically.

**Query Parameters:**

| Parameter | Type      | Required | Description                                                                                   |
| --------- | --------- | -------- | --------------------------------------------------------------------------------------------- |
| `jsKey`   | `boolean` | No       | Whether to parse the keys as JavaScript literals instead of strict JSON. Defaults to `false`. |

**Request Body:**

The request body must be a JSON array of `AtomicOperationInput` objects.

Example:

```json
[
  {
    "name": "check",
    "key": "[\"users\", \"1\"]",
    "versionstamp": "00000000000000010000"
  },
  { "name": "sum", "key": "[\"users\", \"1\", \"score\"]", "value": 10 },
  {
    "name": "set",
    "key": "[\"users\", \"2\", { \"type\": \"BigInt\", value: 123 }]",
    "value": { "type": "String", "data": "New User" },
    "expiresIn": 3600000
  }
]
```

#### POST /watch

Watch specific keys for updates via Server-Sent Events (SSE).

**Query Parameters:**

| Parameter | Type      | Required | Description                                                                                                                    |
| --------- | --------- | -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `jsKey`   | `boolean` | No       | Whether to parse the keys as JavaScript literals instead of strict JSON. Defaults to `false`.                                  |
| `xssSafe` | `boolean` | No       | Whether to escape HTML characters and JS line terminators from strings. Defaults to `true` unless explicitly set to `"false"`. |

**Request Body:**

The request body must be either a JSON array of Keys in `SerializedKvKey` type or direct JavaScript literals as string:

```json
["[\"key1\"]", "[\"key2\"]"]
```

**Response:**

Returns a `text/event-stream` that emits serialized entries whenever a watched key changes.

#### Authentication

If the server is configured with an `authToken`, all requests must include an `Authorization` header with the token value:

```
curl -H "Authorization: <authToken>" http://localhost:47168/check
```

## Bridge Server Client

The `BridgeServerClient` class provides a convenient way to interact with the bridge server from client applications (web, mobile, or any JavaScript/TypeScript environment).

### Initialization

```ts
import { BridgeServerClient } from "@denokv-gui-client/bridge-server";

// Create a client instance
const client = new BridgeServerClient("http://localhost:47168");
```

### Constructor

```ts
new BridgeServerClient(baseUrl: string, options?: BridgeServerClientOptions)
```

| Parameter | Type                        | Required | Description                                                          |
| --------- | --------------------------- | -------- | -------------------------------------------------------------------- |
| `baseUrl` | `string`                    | Yes      | The base URL of the bridge server (e.g., `"http://localhost:47168"`) |
| `options` | `BridgeServerClientOptions` | No       | Optional configuration object                                        |

#### BridgeServerClientOptions

| Option      | Type     | Description                                                                                              |
| ----------- | -------- | -------------------------------------------------------------------------------------------------------- |
| `authToken` | `string` | Authentication token to include in request headers (required if the server was started with `authToken`) |

### Methods

All methods return a `Promise<{ result: T | null; error: string | null }>` where:

- `result` contains the successful response data (or `null` if an error occurred)
- `error` contains an error message (or `null` if the request succeeded)

#### `browse(options?)`

Browse entries in the Deno KV database with optional filtering.

```ts
browse(options?: BrowsingOptions): Promise<{ result: BrowseReturn | null; error: string | null }>
```

**BrowsingOptions:**

| Option        | Type                          | Description                                                                                   |
| ------------- | ----------------------------- | --------------------------------------------------------------------------------------------- |
| `limit`       | `number`                      | Maximum number of entries to return                                                           |
| `cursor`      | `string`                      | Cursor for pagination (from previous browse result)                                           |
| `prefix`      | `SerializedKvKey` (as string) | Filter entries by key prefix                                                                  |
| `start`       | `SerializedKvKey` (as string) | Start key for range query (inclusive)                                                         |
| `end`         | `SerializedKvKey` (as string) | End key for range query (exclusive)                                                           |
| `batchSize`   | `number`                      | The number of entries to fetch from the database at once                                      |
| `consistency` | `"strong"` or `"eventual"`    | The consistency level of the list operation                                                   |
| `reverse`     | `boolean`                     | Whether to return the entries in reverse order                                                |
| `xssSafe`     | `boolean`                     | Whether to escape HTML characters and JS line terminators from strings (defaults to `true`)   |
| `jsKey`       | `boolean`                     | Whether to parse the keys as JavaScript literals instead of strict JSON (defaults to `false`) |

#### `get(key, options?)`

Retrieve a specific entry by its key.

```ts
get(key: SerializedKvKey | string, options?: { xssSafe?: boolean; jsKey?: boolean }): Promise<{ result: SerializedKvEntry | null; error: string | null }>
```

**Options:**

| Option    | Type      | Description                                                                                     |
| --------- | --------- | ----------------------------------------------------------------------------------------------- |
| `xssSafe` | `boolean` | Whether to escape HTML characters and JS line terminators from strings (defaults to `true`)     |
| `jsKey`   | `boolean` | Whether to parse the `key` as a JavaScript literal instead of strict JSON (defaults to `false`) |

#### `set(key, value, options?)`

Set or update a key-value pair in the KV database.

```ts
set(key: SerializedKvKey | string, value: SerializedKvValue, options?: SetKeyOptions): Promise<{ result: boolean | null; error: string | null }>
```

**SetKeyOptions:**

| Option      | Type      | Description                                                                                                         |
| ----------- | --------- | ------------------------------------------------------------------------------------------------------------------- |
| `expires`   | `number`  | Expiration timestamp in milliseconds                                                                                |
| `overwrite` | `boolean` | Whether to overwrite the value of the key if it already exists. Defaults to `true` unless explicitly set to `false` |
| `jsKey`     | `boolean` | Whether to parse the `key` as a JavaScript literal instead of strict JSON (defaults to `false`)                     |

#### `delete(key)`

Delete an entry from the KV database.

```ts
delete(key: SerializedKvKey | string, options?: { jsKey?: boolean }): Promise<{ result: true | null; error: string | null }>
```

#### `enqueue(value, options?)`

Enqueue a message into the Deno KV database.

```ts
enqueue(value: SerializedKvValue, options?: EnqueueOptions): Promise<{ result: boolean | null; error: string | null }>
```

#### `atomic(operations)`

Perform multiple operations as a single atomic transaction.

```ts
atomic(operations: AtomicOperationInput[], options?: { jsKey?: boolean }): Promise<{ result: boolean | null; error: string | null }>
```

#### `watch(keys, listener)`

Watches a set of keys for updates.

```ts
watch(keys: SerializedKvKey[] | string[], listener: (updatedEntries: SerializedKvEntry[]) => void, options?: { xssSafe?: boolean; jsKey?: boolean }): Promise<(() => void) | void>
```

#### `cancelWatcher()`

Cancels the active watcher if there is one.

```ts
cancelWatcher(): Promise<void>
```

### Type Definitions

#### SerializedKvKey

A serialized Deno KV key is a json-compatible array where each value inside it can be:

- `string`
- `number`
- `boolean`
- `{ type: "Uint8Array", value: string }` - for Uint8Array values
- `{ type: "BigInt", value: string }` - for BigInt values
- `{ type: "Number", value: string }` - for special numbers (NaN, Infinity, -Infinity)

#### SerializedKvValue

A serialized Deno KV value is always a json-compatible object with:

- `type`: The data type (e.g., `"String"`, `"Number"`, `"Boolean"`, `"Object"`, `"Array"`, `"Date"`, etc.)
- `data`: The actual value (string, number, boolean, or serialized string for complex types)

#### SerializedKvEntry

A serialized KV entry is an object contains:

- `key`: `SerializedKvKey`
- `value`: `SerializedKvValue`
- `versionstamp`: `string` - The version stamp of the entry

#### AtomicOperationInput

An object representing a single operation within an atomic transaction:

- `name`: `"check" | "set" | "sum" | "min" | "max" | "delete" | "enqueue"`
- `key`: `string` - A string containing a JavaScript expression or JSON string in `SerializedKvKey` type representing a valid Deno KV key (required for all operations except `"enqueue"`)
- `value`: `SerializedKvValue` or `number` (depending on operation)
- `versionstamp`: `string | null` (required only for `"check"`)
- `expiresIn`: `number` (optional only for `"set"`)
- `options`: `EnqueueOptions` (optional only for `"enqueue"`)

#### EnqueueOptions

- `delay`: `number` (optional) - Delay in milliseconds
- `backoffSchedule`: `number[]` (optional) - Array of retry delays in milliseconds
- `keysIfUndelivered`: `string` (optional) - A string containing a JavaScript array of valid Deno KV keys
