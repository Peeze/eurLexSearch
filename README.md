# EUR-Lex Search extension for Firefox

Firefox extension to integrate address bar search on the EUR-Lex portal for European law.

## Info

Created by [Peeze](https://github.com/Peeze) in summer 2023.

Find [EUR-Lex Search for Firefox on GitHub](https://github.com/Peeze/eurLexSearch).

## Installation

Installation from [Add-ons for Firefox](https://addons.mozilla.org) coming soon.

Package extenstion like [so](https://extensionworkshop.com/documentation/publish/package-your-extension/).

## Usage

The extension implements two ways to search directly on EUR-Lex.
1. **Omnibox:** Type `eu` plus space in the address bar, then type your search term and hit enter. If you do not enter any search term, the extension opens the EUR-Lex advanced search menu.
![EUR-Lex Search in the Omnibox](/images/readme_omnibox.png?raw=true)

2. **Context menu:** Select text on a website for which you want to search on EUR-Lex. Right-click on the selection and click on `EUR-Lex Search`.
![EUR-Lex Search in the Context menu](/images/readme_context_menu.png?raw=true)


In the search string, the extension will try to match the name of a file (e.g. a CELEX document number) and open it directly, discarding the remaining search string. If several file names appear, the first matching file will be opened. If no match is found, the entire string will be submitted to the EUR-Lex quick search function.
Currently, the following document types are supported:
- Legal acts (Regulations, Directives, Decisions, Framework Decisions, and Recommendations in CELEX format)
- CJEU case files (in the format `Case C-X/Y`, with `C`/`T`/`F` for the Court of Justice, General Court, and Civil Service Tribunal) will be opened on `curia.europa.eu` as it provides a more practical overview over all files connected to the case than EUR-Lex (can be disabled in the options)
- Staff Working Documents, Communications, and Joint Communications (in the format `SWD/X/Y` or `SWD(X) Y`, with `SWD`/`COM`/`JOIN` respectively)

The extension also matches a customisable list of common short names (e.g. `GDPR`, `AI Act`, etc.) and replace them with their relevant CELEX file number. The list can be modified in the options.
