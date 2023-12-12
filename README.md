# EUR-Lex Search extension for Firefox
Browser extension to integrate easier search on the EUR-Lex portal for European law.

## Info
Created by [Peeze](https://github.com/Peeze) in summer 2023.
Find [EUR-Lex Search for Firefox on GitHub](https://github.com/Peeze/eurLexSearchFirefox).

## Installation
Package extenstion like [so](https://extensionworkshop.com/documentation/publish/package-your-extension/).
Firefox prevents installation of unsigned extenstions. I do not currently distribute the signed package. To get it signed, follow [these instructions](https://extensionworkshop.com/documentation/publish/submitting-an-add-on/#self-distribution).

## Usage
The extension implements two ways to search directly on EUR-Lex.
1. Omnibox: Type "eu" plus space in the address bar, then type your search term and hit enter.
2. Context menu: Select text on a website for which you want to search on EUR-Lex. Right-click on the selection and click on "EUR-Lex Search" in the address bar.

In the search string, the extension will try to match the name of a file (e.g. a CELEX document number) and open it directly, discarding the remaining search string. If several file names appear, the first matching file will be opened. If no match is found, the entire string will be submitted to the EUR-Lex quick search function.
Currently, the following document types are supported:
- Legal acts (Regulations, Directives, Decisions, Framework Decisions, and Recommendations in CELEX format)
- Staff Working Documents, Communications, and Joint Communications (in the format "SWD/X/Y" or "SWD(X) Y", with "SWD"/"COM"/"JOIN" respectively)

I plan to implement the following one day:
- CJEU case files (in the format "Case C-X/Y", with "C"/"T"/"F" for the Court of Justice, General Court, and Civil Service Tribunal)

## Examples
"General Data Protection Regulation" will search for the GDPR in EUR-Lex quick search.
"Regulation (EU) 2016/679" will directly open the GDPR.
"foo Regulation 2016/679 bar" will also open the GDPR.
"COM/2012/011 was the proposal for Regulation (EU) 2016/679" will open COM(2012) 11.
