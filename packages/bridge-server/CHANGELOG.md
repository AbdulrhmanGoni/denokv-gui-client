# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## 7.0.1 (2026-01-12)

### Bug Fixes

* **types:** add some missing fields and correct a return type ([6f4cf57](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/6f4cf57c6b36c59e809d2b17c06c7d13b53c67a1))


## 7.0.0 (2026-01-07)


### ⚠ BREAKING CHANGES

* the return type of `validateBrowseRequestParams` function changed,
"limit" and "cursor" options now come inside "options" object in the returned
object from the function.

### Features

* add "batchSize", "reverse" and "consistency" options support for `/browse` route ([02b2b6e](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/02b2b6e4212e489c030835a6caa96948eb6e58e7))
* use a new approach to deserialize top-level RegExp values ([0af8c9f](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/0af8c9fe7aea21653a0510b48aa8e78d8f7261ca))


### Bug Fixes

* return the actual success status of the `set` operation in `/set` route ([112b2ef](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/112b2ef446da11d3dc38bdbbf1b8ab8e439bfa2c))
* cover two additional cases in number key part deserialization ([6719416](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/671941602b3be2b0084dc5d97af5685fa80f7e47))
* fix "Infinity" and "NaN" top-level values serialization ([cebd066](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/cebd06656a81ce3c4ef46e71f5a33c52902652ce))

## 6.0.0 (2025-12-29)

### Features

* use a new approach to deserialize top-level RegExp values ([0af8c9f](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/0af8c9fe7aea21653a0510b48aa8e78d8f7261ca))


### Bug Fixes

* fix "Infinity" and "NaN" top-level values serialization ([cebd066](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/cebd06656a81ce3c4ef46e71f5a33c52902652ce))

**Moving the development of the Deno KV bridge server package from [denokv-bridge-server](https://github.com/AbdulrhmanGoni/denokv-bridge-server) repository to the current repository inside [packages/bridge-server](https://github.com/AbdulrhmanGoni/denokv-gui-client/tree/main/packages/bridge-server) directory**