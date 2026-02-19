# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [1.18.0](https://github.com/AbdulrhmanGoni/denokv-gui-client/compare/v1.17.0...v1.18.0) (2026-02-19)


### Features

* enable preventing "Add Kv Entry" action from overwriting existing entries ([feccae2](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/feccae266c6cf9b8b680e6e57165cc2e1bb49893))


### Enhancements

* show loading state while Atomic Operations are being comitted ([f09fe71](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/f09fe71ab4168ded29608c144d9566a38529c2bd))


### User Interface Changes

* make some text a bit darker in light mode for better readability ([33b55c3](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/33b55c3e516ec70efb49e1a37563527a2b917d97))
* refine release notes presentation and layout ([f6b38db](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/f6b38db806d6ab0f7108d9f303c4307ed353135a))

## [1.17.0](https://github.com/AbdulrhmanGoni/denokv-gui-client/compare/v1.16.1...v1.17.0) (2026-02-10)


### Features

* introduce atomic operations feature support ([35448aa](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/35448aa5343dc385cf1c459f44eb0f643ffa8385))


### Bug Fixes

* fix kv stores state conflict when switching between stores in kv entries browser ([4b9427b](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/4b9427bb79abf029c0340043030f6a1abea05f5e))


### User Interface Changes

* simplify labels of action buttons in kv entries browser page ([4cc2b7a](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/4cc2b7af71720b81f6c96ff7e9c72ad434ffa104))

## [1.16.1](https://github.com/AbdulrhmanGoni/denokv-gui-client/compare/v1.16.0...v1.16.1) (2026-02-05)


### Bug Fixes

* fix that kv stores are sometimes opened in unclean and confusing state ([a934a93](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/a934a93fc755e4943bd095ac26a084a62482d973))

## [1.16.0](https://github.com/AbdulrhmanGoni/denokv-gui-client/compare/v1.15.0...v1.16.0) (2026-01-21)


### Features

* make app's version a link takes to the release page when clicked ([813cda0](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/813cda0c99a6a1760ce59c2626933ffa308b9c92))
* enable enqueuing messages into Deno KV Queue ([f048f14](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/f048f14cad8594a8f6aaa066644aaf6bb82fcb30))


### Bug Fixes

* fix that "new update" indicator doesn't appear although a new update is available ([1ad0406](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/1ad0406067397064f591d31f98b3e97d0c3b5531))
* correct copying all types of Kv Keys/Values into clipboard as js values ([60c7f3d](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/60c7f3df6646825e0ee1d04379ddca141266cb1b))


### User Interface Changes

* limit the height of Kv value data type selector's dropdown menu ([408473f](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/408473f1b749e5e30d8a414e8bc6320267296a6c))

## [1.15.0](https://github.com/AbdulrhmanGoni/denokv-gui-client/compare/v1.14.0...v1.15.0) (2026-01-12)


### Features

* add support for "batchSize", "consistency", and "reverse" browse/filter options ([b9bb888](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/b9bb8881553c1c8d6f0a19ec9f384cbc63bb05dc))
* add confirmation dialog for deleting saved filters ([c3e2eb3](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/c3e2eb362e518a31854381026b0bd753a1edf6aa))
* enable adding an existing local kv db instead of always creating a new one ([92ae410](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/92ae4102ff0bf680c7c5cd2c5dbcc3de2645180e))


### Bug Fixes

* ensure previous KV store and bridge server are closed before starting a new one ([8c9914d](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/8c9914d7d1aeb8ff7064721a4a0c4110fc129356))
* fix ui overflow issue in saved filters list for long "Prefix", "Start", and "End" keys ([0f06853](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/0f0685362d0ff025654eb1d7f72136b03e063f78))
* apply saved parameters immediately when set as default ([b413b0b](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/b413b0b1e14fb180e1bcd20f251f0afee42551d8))


### User Interface Changes

* re-design the UI of the filters feature in the kv entries table ([8986507](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/8986507a2770f68baee23795e8ca6c2e5730b7ff))

## [1.14.0](https://github.com/AbdulrhmanGoni/denokv-gui-client/compare/v1.13.0...v1.14.0) (2026-01-07)

### Features

* add "Delete Entry" button to Kv entry dialog ([f7e241b](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/f7e241b0332f002cfce2a44fb68df624561f26d0))


### User Interface Changes

* convert settings page into an overlay window ([35aa58a](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/35aa58ae7e1db1b218ecb8d377463018457b2ae7))
* reposition Kv Store Type field in Kv Store Form ([5e91554](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/5e91554c33e4ede5e7ffdfb7b79c3a88acdd5556))

## [1.13.0](https://github.com/AbdulrhmanGoni/denokv-gui-client/compare/v1.12.0...v1.13.0) (2025-12-30)


### Features

* introduce a new RegExp input field in kv values editor ([f967fa6](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/f967fa6e3ccecf01fdc2f21184317ea67e1a68ce))


### Bug Fixes

* fix type & value mismatch after closing & re-opening kv value editor ([c3f8d40](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/c3f8d40bd0f995e76f3ab52528a0d25fe2f58115))
* fix "Infinity" and "NaN" top-level values serialization ([cebd066](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/cebd06656a81ce3c4ef46e71f5a33c52902652ce))

### User Interface Changes

* auto-highlight current boolean value in kv value editor ([2c2ec45](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/2c2ec45c53bc79aa3d426821a4a8350a0a20eedb))
* hide "Format" button in kv value editor when selected data type isn't formattable ([bbc0a4f](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/bbc0a4fc14c7e66a422a689a21770af3cf3ace3a))

## [1.12.0](https://github.com/AbdulrhmanGoni/denokv-gui-client/compare/v1.11.0...v1.12.0) (2025-12-11)


### Security

* enable token-based accees control for bridge servers ([36af16d](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/36af16dc58fd739b5756684d5af73ac810494065))

## [1.11.0](https://github.com/AbdulrhmanGoni/denokv-gui-client/compare/v1.10.0...v1.11.0) (2025-12-04)


### Features

* introduce data-type-specific input fields in Kv value editor ([b7d5aa9](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/b7d5aa9ccee5a3790019308970359a6ef89b09ca))


### Bug Fixes

* fix what causes the referred links in the app to not open ([0be3b60](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/0be3b60c58bfc03216fbd79fb177002245375c7d))


### User Interface Changes

* change the appearance of top-level Date values ([f614f67](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/f614f6757f8fef122a316bc5aa6114e0b5f524e3))

## [1.10.0](https://github.com/AbdulrhmanGoni/denokv-gui-client/compare/v1.9.0...v1.10.0) (2025-11-29)


### Features

* introduce `mac-x64` build support ([adc78f0](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/adc78f09623cd6811fbcd5e08b568d57331748c9))
* enable searching for a single kv entry by it's key ([4e2f62f](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/4e2f62f40d9b05871e018d2f2209a11bc5c4b068))
* add "Reload" button to Kv Entries table ([54c16c3](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/54c16c3bdf9c3cce234d6c7251f31a73dd50e74a))


### Bug Fixes

* fix how kv values are copied ([00813c2](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/00813c2412e094d2add8a6b496112a16a15affdc))


### Enhancements

* distinguish flags from the actual expression when rendering RegExp top-level value ([d9e584d](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/d9e584d880276f6b60a87decf6406933c25bead9))

## [1.9.0](https://github.com/AbdulrhmanGoni/denokv-gui-client/compare/v1.8.1...v1.9.0) (2025-11-24)


### Features

* support reading and updating "KvU64" values properly ([44a408c](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/44a408c8330502ef80c9a00673b35f38f45a525c))


### User Interface Changes

* change the icon of "Reset filter" button ([bc8431d](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/bc8431d38b77358e7b0d69e3a5d6ab286fe89a2f))

## [1.8.1](https://github.com/AbdulrhmanGoni/denokv-gui-client/compare/v1.8.0...v1.8.1) (2025-11-10)


### Bug Fixes

* prevent infinite loading state when network fails or bridge server is unreachable ([49b6d5a](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/49b6d5ae6bb911970d55639dd9357997317fc919))

## [1.8.0](https://github.com/AbdulrhmanGoni/denokv-gui-client/compare/v1.7.4...v1.8.0) (2025-10-29)


### Features

* enable saving filters for reuse and setting a default filter per kv store ([b5ab56e](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/b5ab56e7c005835789be2bedbed58aff03df7bfd))


### Enhancements

* fire a success toast message for successful Kv Store deletion ([cbad14a](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/cbad14aa27170860b450b4c7dd9027c171d698f9))

## [1.7.4](https://github.com/AbdulrhmanGoni/denokv-gui-client/compare/v1.7.3...v1.7.4) (2025-10-25)


### Bug Fixes

* fix "next" button sticks as disabled after reaching the last page ([78519c5](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/78519c5114b987b153fa702ffc8b22eaa47c0bb6))
* fix "next" button sticks as disabled after applying new filters ([0f8823a](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/0f8823a47ea0e0aff7512e4ef224363cdcc9aa54))
* add scrolling when filtering keys overflow ([746f601](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/746f601c07e2bf5c3e4ee4173ec254289ddfd36c))
* clear any previous error if "check for update" succeeded after a failure ([b7d2c33](https://github.com/AbdulrhmanGoni/denokv-gui-client/commit/b7d2c337fb33882eaee9dcc99d4aa3e907d1f316))

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
