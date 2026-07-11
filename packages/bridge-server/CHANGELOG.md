# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [11.0.0](https://github.com/AbdulrhmanGoni/denokv-gui-client/compare/bridge-server@10.0.0...bridge-server@11.0.0) (2026-07-11)


### ⚠ BREAKING CHANGES

* the `POST /atomic` endpoint and `validateAtomicOperations`
function now expect passed Kv Keys to be in the `SerializedKvKey` JSON form
by default, and to make them deserialize/parse keys as JavaScript literals as
previously, `jsKey` query/option must be set to `true`

### Features

* make `BridgeServerClient.watch` return errors as values ([eb1d24b](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/eb1d24b234d8d64cd40c5fc009527ab66ec58274))
* add `jsKey` option for Kv keys deserializer/parser ([d9b2502](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/d9b25021415af3b7b8f81abbe38e9111d8c90ece))


### Bug Fixes

* make `isValidKvKey` utility function return `false` on empty arrays ([d3fd7a9](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/d3fd7a91d3b999b992917ee4163813f300d29429))
* let bigint and Uint8Array key parts pass without validation `deserializeKvKey` fn ([e9e2b49](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/e9e2b4961799e017f7d6f8dc31c23470e66881f6))

## [10.0.0](https://github.com/AbdulrhmanGoni/denokv-gui-client/compare/bridge-server@9.0.1...bridge-server@10.0.0) (2026-06-22)


### ⚠ BREAKING CHANGES

* `deserializeKvValue` function becomes synchronous and
no longer requires `Kv` instance as the second parameter.

### Enhancements

* improve performance of constructing KvU64 values ([8bc43cc](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/8bc43cc9b72ac3e382cffea208653fcba033ae45))

## [9.0.1](https://github.com/AbdulrhmanGoni/denokv-gui-client/compare/bridge-server@9.0.0...bridge-server@9.0.1) (2026-06-16)


### Security

* install a security patch for `hono` ([acb9762](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/acb97627df402bb0f1a518135517ad043df13df2))


### Maintenance

* update "@deno/kv" to version 0.14.0 ([a85a9cc](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/a85a9cc91bb272c01c30ce52dcbb43efa38dbd48))
* **dev:** replace "vite-plugin-dts" package with "unplugin-dts" ([e9beb90](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/e9beb9053f7243e8727e759ce8f02ff8691d7de1))
* upgrade "@hono/node-server" to v2 ([327c04f](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/327c04fc2ee14868bd4742c011ec5b8715d24201))
* update "hono" dependency ([71acde9](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/71acde917e57dc428debf9c81c321767dc943c86))
* update "vitest" dependency ([4ca76f9](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/4ca76f9c573973f33daa671e31636e5972ad55aa))

## [9.0.0](https://github.com/AbdulrhmanGoni/denokv-gui-client/compare/bridge-server@8.3.0...bridge-server@9.0.0) (2026-05-29)

### ⚠ BREAKING CHANGES

- convert set operation's result to an object with ok status and versionstamp

### Features

- convert `set` operation's result to an object with ok status and versionstamp ([f46eacd](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/f46eacd5e6f1fc12b74ebf2bdf1cc0ba424b582d))
- enable turning off escaping HTML characters and JS line terminators for `GET /watch` endpoint ([10d7015](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/10d7015f528929c2e6cbedcf7021e656f170e519))
- enable turning off escaping HTML characters and JS line terminators in string values ([8cc0d8d](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/8cc0d8d6c535ad0cf9a5abf0d458cd9f74007da1))
- export some KV utilities as a standalone entry point ([ec1cbf2](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/ec1cbf2f82195f74be4c3b8a8f1f5dc6535bee6b))

## [8.3.0](https://github.com/AbdulrhmanGoni/denokv-gui-client/compare/bridge-server@8.2.2...bridge-server@8.3.0) (2026-05-13)

### Features

- add `POST /watch` endpoint for `Deno.Kv.watch` method support ([d7089e9](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/d7089e94b837c767c4909c7cdc84f2b1b9cd8e6a))

### Security

- apply a security patch for `hono` package ([b5ecd47](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/b5ecd47720840872982f6af090fb6ae7701a9129))

## [8.2.2](https://github.com/AbdulrhmanGoni/denokv-gui-client/compare/bridge-server@8.2.1...bridge-server@8.2.2) (2026-04-24)

### Security

- update dependencies for security reasons ([a524f72](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/a524f72662b20ea0bea82bc14f63ce3f736d3018))

## [8.2.1](https://github.com/AbdulrhmanGoni/denokv-gui-client/compare/bridge-server@8.2.0...bridge-server@8.2.1) (2026-04-03)

### Security

- update dependencies to avoid some vulnerabilities ([a066e7f](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/a066e7f706e67894216eaf816a8fc99753bcbef2))

## 8.2.0 (2026-02-19)

### Features

- add "overwrite" option to `set` operation as `true` by default ([f267b34](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/f267b343a450ffbb28adc31d1877ba76f0605503))

## 8.1.0 (2026-02-10)

### Features

- add support for Deno KV atomic transactions ([e2fbe4f](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/e2fbe4f6677d0309171e7ea0785002ece215aa1e))

### Security

- upgrade from a vulnerable "hono" version to "4.11.7" ([7360d35](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/7360d359b30e379c13b8039e58f153dfc5ba9a0c))

## 8.0.0 (2026-02-05)

### ⚠ BREAKING CHANGES

- "keysIfUndelivered" option of "enqueue" operation is now expected to be a JS code
  as string representing an "array of deno kv keys" instead of array of strings where
  each string is a deno kv key in the serialized form.

### Bug Fixes

- fix and improve documentation ([28da566](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/28da5664fc95a8cacd3b231a4f51cf172b77df18))

### API Changes

- change how "keysIfUndelivered" option of enqueue operation is parsed ([7ac38fd](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/7ac38fd20d083dcb7b3fcf63439c7badc887601b))

## 7.1.0 (2026-01-21)

### Features

- implement enqueue operation support ([0ff6aa2](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/0ff6aa20ef5f776587ee25a2b35020d823a4a710))

### Bug Fixes

- throw on unexpected key parts in `serializeKvKey` function ([a23cf0e](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/a23cf0e38a22cebf8d67ef543e628e5cef1107cd))
- fix the return type of `BridgeServerClient`'s "set" and "delete" methods ([846a467](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/846a467d6cb2ee3b52c37f12651a1fe4a47c6dcf))

### Security

- update "hono" package to avoid a vulnerability ([69bd40c](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/69bd40c29df10d20803f425a1f0f6e88e503a321))

## 7.0.1 (2026-01-12)

### Bug Fixes

- **types:** add some missing fields and correct a return type ([6f4cf57](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/6f4cf57c6b36c59e809d2b17c06c7d13b53c67a1))

## 7.0.0 (2026-01-07)

### ⚠ BREAKING CHANGES

- the return type of `validateBrowseRequestParams` function changed,
  "limit" and "cursor" options now come inside "options" object in the returned
  object from the function.

### Features

- add "batchSize", "reverse" and "consistency" options support for `/browse` route ([02b2b6e](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/02b2b6e4212e489c030835a6caa96948eb6e58e7))
- use a new approach to deserialize top-level RegExp values ([0af8c9f](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/0af8c9fe7aea21653a0510b48aa8e78d8f7261ca))

### Bug Fixes

- return the actual success status of the `set` operation in `/set` route ([112b2ef](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/112b2ef446da11d3dc38bdbbf1b8ab8e439bfa2c))
- cover two additional cases in number key part deserialization ([6719416](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/671941602b3be2b0084dc5d97af5685fa80f7e47))
- fix "Infinity" and "NaN" top-level values serialization ([cebd066](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/cebd06656a81ce3c4ef46e71f5a33c52902652ce))

## 6.0.0 (2025-12-29)

### Features

- use a new approach to deserialize top-level RegExp values ([0af8c9f](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/0af8c9fe7aea21653a0510b48aa8e78d8f7261ca))

### Bug Fixes

- fix "Infinity" and "NaN" top-level values serialization ([cebd066](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/cebd06656a81ce3c4ef46e71f5a33c52902652ce))

**Moving the development of the Deno KV bridge server package from [denokv-bridge-server](https://github.com/AbdulrhmanGoni/denokv-bridge-server) repository to the current repository inside [packages/bridge-server](https://github.com/AbdulrhmanGoni/denokv-gui-client/tree/main/packages/bridge-server) directory**
