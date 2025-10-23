# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [1.7.3](https://github.com/AbdulrhmanGoni/denokv-gui-client/compare/v1.7.2...v1.7.3) (2025-10-23)


### Bug Fixes

* reset browsing params when switching kv stores ([3a4cc85](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/3a4cc852d5ae4d108270a262b50704e0e0de150b))
* fix disabling "next" button after deleting any entry in kv entries table ([397d3a6](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/397d3a6b58c71725aedf822b7bc33f9b151eecf2))

## [1.7.2](https://github.com/AbdulrhmanGoni/denokv-gui-client/compare/v1.7.1...v1.7.2) (2025-10-17)


### Bug Fixes

* fix "filtering kv entries doesn't work" issue ([5db1e40](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/5db1e406e54b5d92defc33806b620c60089234ee))
* correct creation and update timestamps of KV stores ([2243fc5](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/2243fc529fb468f36a8fda014c0ea982251c3ce4))

## [1.7.1](https://github.com/AbdulrhmanGoni/denokv-gui-client/compare/v1.7.0...v1.7.1) (2025-10-15)


### Bug Fixes

* selecting an entry no longer selects entries with same key in other KV stores ([62578d3](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/62578d3bd41608f17f83138c10e76eb227b52689))


### Enhancements

* close "Add New Kv Store" form automatically after successful creation ([38db43f](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/38db43fa9012f65653b52e9ef5e89fea8c00d9c6))

## [1.7.0](https://github.com/AbdulrhmanGoni/denokv-gui-client/compare/v1.6.1...v1.7.0) (2025-10-09)


### Features

* provide an option to copy Kv store path or URL ([e974860](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/e974860e04dde46e470977f57535324d9ffee665))
* make local kv stores paths clickable to quick open in file explorer ([aa19273](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/aa19273a438590bd15a93682fdabaf49408bdfed))


### Bug Fixes

* make "Copy Version" action in Kv Entries table work ([c264b7d](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/c264b7d3f311cb8d03f261ae2fd8940a5957ef36))


### User Interface Changes

* put actions buttons of Kv Store cards in a dropdown menu ([5ee6881](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/5ee6881d59234ed9d9ee5c93079d7781069fb14b))
* change the date format of "Created" and "Last Update" in Kv store cards ([f058e85](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/f058e85dc157316e8dffac6694df817d63e3929b))

## [1.6.1](https://github.com/AbdulrhmanGoni/denokv-gui-client/compare/v1.6.0...v1.6.1) (2025-10-02)


### Bug Fixes

* fix showing the current version as a new update issue ([8d7fa61](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/8d7fa61a866b5dc9767580760be113b5753d705e))


### Enhancements

* cache last fetched update info to improve app startup experience ([0d7ceff](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/0d7ceff52636347717f42500c9cc9d30a89f653f))

## [1.6.0](https://github.com/AbdulrhmanGoni/denokv-gui-client/compare/v1.5.0...v1.6.0) (2025-09-29)


### Features

* show release notes when new updates come ([e4e1724](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/e4e1724427f1df8958fc9e9fde487510233fd616))
* provide "auto check for updates" option ([7533563](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/7533563e9eea954309643112fe0c7162b21e6f60))


### Bug Fixes

* don't show an error when canceling update process ([94987de](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/94987ded5e739d50618a1872eead4a1aa0b67923))


### Enhancements

* show users since when new updates were released ([13a63a2](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/13a63a2cf16f031bb71703ae089ea2330b02a199))

## [1.5.0](https://github.com/AbdulrhmanGoni/denokv-gui-client/compare/v1.4.0...v1.5.0) (2025-09-27)


### Features

* add "update app" option to settings page ([cda9c6b](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/cda9c6bbfe6539ad3e480abeea64e58d05f4113b))
* disable automatic background updates without user awareness ([c0ae273](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/c0ae273c2588ff78a934956a297f43c1b5908fff))
* create settings page and put theme switcher in it ([586a1c0](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/586a1c0eb76b93a0e6dc7af89915043768146bee))
* add "system" option to the theme switcher and change its design ([7c877ab](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/7c877abcf2ad9badd14991fcc131a8d74985609d))


### Bug Fixes

* fix the incorrect format of top-level date values ([855895b](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/855895bf30e3c49fd96a930a7bb3dd04bd62807d))

## [1.4.0](https://github.com/AbdulrhmanGoni/denokv-gui-client/compare/v1.3.0...v1.4.0) (2025-09-17)


### Features

* enable deleting multiple kv entries at once ([78b2f24](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/78b2f24571760ac62475dfebbf8dd1abb252dd1f))


### Bug Fixes

* use keys as ids to ensure proper entry identification in kv entries table ([bd15527](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/bd15527b47adee4b6b36bf24ef4871d4abf40c4e))
* correct "copy key or  value to clipboard" functionality ([5450068](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/545006809bf3520a60bca140c51b3e72c970700b))

## [1.3.0](https://github.com/AbdulrhmanGoni/denokv-gui-client/compare/v1.2.2...v1.3.0) (2025-09-12)


### Features

* add remaning default kv stores option ([e64e97a](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/e64e97a3a090c53268a30bc6501e5e224799e4ee))

## [1.2.2](https://github.com/AbdulrhmanGoni/denokv-gui-client/compare/v1.2.1...v1.2.2) (2025-09-09)


### Enhancements

* disable "next" button when it's obvious there are no more entries ([9b0a1ab](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/9b0a1abba6ea4d81d158cb1cd2f3f1d2b92079b3))

## [1.2.1](https://github.com/AbdulrhmanGoni/denokv-gui-client/compare/v1.2.0...v1.2.1) (2025-09-08)


### Bug Fixes

* fix "app hangs in loading state when entering an invalid key" problem ([ccf374b](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/ccf374ba6f5e524c0b6e027225b30e2da5282572))

## [1.2.0](https://github.com/AbdulrhmanGoni/denokv-gui-client/compare/v1.1.0...v1.2.0) (2025-09-07)


### Features

* enable "expires" option when adding kv entries ([4a93329](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/4a93329a4f35e5a04602e697c16f4c7c499bf93e))


### Bug Fixes

* **ui:** fix the colors of bigints, dates and regexps when displaying ([1112f70](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/1112f706211833fd0afe82aab39034c3de426d40))

## [1.1.0](https://github.com/AbdulrhmanGoni/denokv-gui-client/compare/v1.0.0...v1.1.0) (2025-09-05)


### Features

* add "limit" option to browsing params ([cf89749](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/cf897494782e9068f50af3bbc4d1ae1245391aee))


### Bug Fixes

* **ui:** unlock app container element's height to screen's height ([7e43658](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/7e4365867d10623cdcc35171a6edc3df1a5b3a22))
* **ui:** correct app version display format ([92779de](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/92779de4eed1c87a56c37375db7f2e5f3a103fea))


### User Interface Changes

* display a diffrent Kv entry value icon based on mode (edit or show) ([aa76169](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/aa7616915bd617e3a238915bb7d45dfe5eedf4c2))


## 1.0.0 (2025-09-02)

**First Release**
