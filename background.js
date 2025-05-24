// Browser extension for Firefox
// Created by [Peeze](https://github.com/Peeze/) some time in 2023
// Released under Mozilla Public License Version 2.0


// Regular expression, check this: https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2046255\
// Define regular expression patterns
const patternLegislation = "(Regulation|Directive|Framework Decision|Decision|Recommendation).*?(\\d{1,4})\\/(\\d{1,4})";
const patternCaseLaw = "(C|T|F|Case)(?:-|–|‑|\\s*)(\\d{1,4})\\/(\\d{2})";
const patternComDocs = "(SWD|COM|JOIN)\\s*\\(?\\/?(\\d{4})\\)?\\s*\\(?\\/?(\\d{1,4})\\)?";
const re = new RegExp(patternLegislation + "|" + patternCaseLaw  + "|" + patternComDocs, "i");

// Dicitionary to translate instrument types to CELEX encoding
const dictInstrument = {
  "regulation"         : "R",
  "directive"          : "L",
  "decision"           : "D",
  "recommendation"     : "H",
  "framework decision" : "F",
  "case"               : "CJ",  // For leniency
  "c"                  : "CJ",
  "t"                  : "TJ",
  "f"                  : "FJ",
  "swd"                : "SC",
  "com"                : "DC",  // "PC" for legislative proposals
  "join"               : "JC"
}

// Dicitionary of common names for legal act, to be replaced in search string
let commonNames = {
  "GDPR" : "Regulation 2016/679",
  "General Data Protection Regulation" : "Regulation 2016/679"
}
let globalOptions = {
  "lang": "EN",
  "docTab" : "TXT",  // Which EUR-Lex tab to open, TXT or ALL
  "curia"  : true    // Whether to open case law in curia.europa.eu
};

// Read globalOptions and commonNames from local storage
function readStorage() {
  let storedCommonNames = localStorage.getItem("commonNames");
  if (!storedCommonNames) {
    console.warn("Cannot load commonNames from storage. Use defaults.");
  } else {
    commonNames = JSON.parse(storedCommonNames);
  }

  let storedOptions = localStorage.getItem("globalOptions");
  if (!storedOptions) {
    console.warn("Cannot load globalOptions from storage. Use defaults.");
  } else {
    globalOptions = JSON.parse(storedOptions);
  }
}


// Construct CELEX number from re match
// CELEX documentation: https://eur-lex.europa.eu/content/help/eurlex-content/celex-number.html
function encodeCelex(reMatch, celexCodeInstrument) {
  var celexSector, celexYear, celexNumber;

  // Year is first or second part of doc nr, depending on instrument type
  if (["L", "D", "H", "F"].includes(celexCodeInstrument)) {
    // For Directives/Decisions/Recommendations/etc., the year comes first
    celexSector = "3";
    celexYear = reMatch[2];
    celexNumber = reMatch[3];

  } else if (["R"].includes(celexCodeInstrument)) {
    // For Regulations, the year comes first since 2015
    celexSector = "3";
    if (parseInt(reMatch[2]) >= 2015) {
      celexYear = reMatch[2];
      celexNumber = reMatch[3];
    } else {
      celexYear = reMatch[3];
      celexNumber = reMatch[2];
    }

  } else if (["CJ", "TJ", "FJ"].includes(celexCodeInstrument)) {
    // For case law, the year comes second
    celexSector = "6";
    celexYear = reMatch[6];
    celexNumber = reMatch[5];

  } else if (["SC", "JC"].includes(celexCodeInstrument)) {
    // For Staff Working Documents, the year comes first
    // (obsolete, the case is handled by constructURL)
    celexSector = "5";
    celexYear = reMatch[8];
    celexNumber = reMatch[9];

  } else {
    // Instrument type not yet implemented
    console.warn("Could not parse document number. No matching CELEX code \""+ celexCodeInstrument + "\".");
    return null;
  }

  // Ensure year is valid (either 2 or 4 digits)
  if (![2, 4].includes(celexYear.length)) {
    console.warn("Invalid year, trying document number instead");

    if ([2, 4].includes(celexNumber.length)) {
      // Swap year and document number
      [celexYear, celexNumber] = [celexNumber, celexYear];

    } else {
      // Give up
      console.warn("Could not parse document number. Invalid year \"" + celexYear + "\".");
      return null;
    }
  }

  // Make year 4-digit
  if (celexYear.length === 2) {
    if (parseInt(celexYear) > 50) {
      celexYear = "19" + celexYear;
    } else {
      celexYear = "20" + celexYear;
    }
  }

  // Ensure document number is four digit
  celexNumber = celexNumber.padStart(4, "0");

  // Construct CELEX and return
  return celexSector + celexYear + celexCodeInstrument + celexNumber;
}


// Construct url, depending on type of document
function constructURL(reMatch, searchString) {

  // Determine type of instrument
  if (reMatch[1] !== undefined) {
    // Secondary legislation, construct CELEX number
    let codeInstrument = dictInstrument[reMatch[1].toLowerCase()];
    let uri = "CELEX:" + encodeCelex(reMatch, codeInstrument);
    return `https://eur-lex.europa.eu/legal-content/${globalOptions["lang"]}/${globalOptions["docTab"]}/?uri=${encodeURIComponent(uri)}`;

  } else if (reMatch[4] !== undefined) {
    // Case law, open on curia.europa.eu if global option "curia" is set (recommended)
    if (globalOptions["curia"]) {
      // Open case file on curia.europa.eu
      let caseNum;
      if (reMatch[4].toLowerCase() === "case") {
        // For leniency, accept that "Case 12/34" should be "Case C-12/34"
        caseNum = "C-" + reMatch[5] + "/" + reMatch[6];
      } else {
        caseNum = reMatch[4] + "-" + reMatch[5] + "/" + reMatch[6];
      }
      return `https://curia.europa.eu/juris/liste.jsf?num=${caseNum}&language=${globalOptions["lang"].toLowerCase()}`
    } else {
      // Open case file on eur-lex.europa.eu
      let codeInstrument = dictInstrument[reMatch[4].toLowerCase()];
      let uri = "CELEX:" + encodeCelex(reMatch, codeInstrument);
      return `https://eur-lex.europa.eu/legal-content/${globalOptions["lang"]}/${globalOptions["docTab"]}/?uri=${encodeURIComponent(uri)}`;
    }

  } else if (reMatch[7] !== undefined) {
    // Commission documents
    let docType = reMatch[7].toUpperCase();
    let docYear = reMatch[8];
    let docNumber = reMatch[9];

    let uri = docType + ":" + docYear + ":" + docNumber + ":FIN";
    return `https://eur-lex.europa.eu/legal-content/${globalOptions["lang"]}/${globalOptions["docTab"]}/?uri=${encodeURIComponent(uri)}`;

  } else {
    console.warn("Could not parse document number");
    return `https://eur-lex.europa.eu/search.html?scope=EURLEX&lang=${globalOptions["lang"].toLowerCase()}&type=quick&text=${encodeURIComponent(searchString)}`;
  }
}


// Take text input, run search
function runSearch(searchString) {
  console.log("EUR-Lex Search: " + searchString);

  // Update options
  readStorage();

  if (searchString === "") {
    // If search string empty, open advanced search
    const advancedSearchURL = 'https://eur-lex.europa.eu/advanced-search-form.html';
    browser.tabs.create({ url: advancedSearchURL });

  } else {
    // If search string not empty
    // Replace common names
    let originalSearchString = searchString;
    for (commonName of Object.keys(commonNames)) {
        searchString = searchString.replaceAll(new RegExp(commonName, "ig"), commonNames[commonName]);
        // Optional TODO: pre-compile regex for improved performance
    }

    // Check for match
    let reMatch = searchString.match(re);
    console.log(reMatch);

    if (reMatch === null) {
      // If no match, start simple search
      const newURL = `https://eur-lex.europa.eu/search.html?scope=EURLEX&lang=${globalOptions["lang"].toLowerCase()}&type=quick&text=${encodeURIComponent(originalSearchString)}`;
      browser.tabs.create({ url: newURL });

    /*} else if (originalSearchString[0] === "\"") {
      // If literal search
      const newURL = `https://eur-lex.europa.eu/search.html?scope=EURLEX&lang=${globalOptions["lang"]}&type=quick&text=${encodeURIComponent(originalSearchString)}`;
      browser.tabs.create({ url: newURL });
    */

    } else {
      // If match, construct CELEX number and open document
      const newURL = constructURL(reMatch, originalSearchString);
      console.debug(newURL);
      browser.tabs.create({ url: newURL });
    }
  }
}


// Add omnibox search
browser.omnibox.onInputEntered.addListener((searchString) => {
  runSearch(searchString);
});


// Add context menu
let contextMenuItem = {
  "id": "eur-lex-search",
  "title": "EUR-Lex Search",
  "contexts": ["selection"],
};
browser.contextMenus.create(contextMenuItem);

browser.contextMenus.onClicked.addListener(
  function(info, tab) { runSearch(info.selectionText); }
);
