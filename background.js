// Regular expression, check this: https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2046255\

//           Secondary legislation                                                                  | Case law                                  | Commission documents
const re = /(Regulation|Directive|Framework Decision|Decision|Recommendation).*?(\d{1,4})\/(\d{1,4})|(Case C-|Case T-|Case F-)(\d{1,4})\/(\d{2})|(SWD|COM|JOIN)\s*\(?\/?(\d{4})\)?\s*\(?\/?(\d{1,4})\)?/i

// Dicitionary to translate instrument types to CELEX encoding
const dictInstrument = {
  "regulation"         : "R",
  "directive"          : "L",
  "decision"           : "D",
  "recommendation"     : "H",
  "framework decision" : "F",
  "case c-"            : "CJ",
  "case t-"            : "TJ",
  "case f-"            : "FJ",
  "swd"                : "SC",
  "com"                : "DC",  // "PC" for legislative proposals
  "join"               : "JC"
}

// Construct CELEX number from re match
// CELEX documentation: https://eur-lex.europa.eu/content/help/eurlex-content/celex-number.html
function encodeCelex(reMatch, celexCodeInstrument) {
  var celexSector, celexYear, celexNumber;

  /*// Determine type of instrument
  if (reMatch[1] != undefined) {
    celexCodeInstrument = dictInstrument[reMatch[1].toLowerCase()];
  } else if (reMatch[4] != undefined) {
    celexCodeInstrument = dictInstrument[reMatch[4].toLowerCase()];
  } else if (reMatch[7] != undefined) {
    celexCodeInstrument = dictInstrument[reMatch[7].toLowerCase()];
  } else {
    console.warn("Could not parse document number");
    return null;
  }*/

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

  } else if (["SC", "JC"].includes(celexCodeInstrument)) {
    // For Staff Working Documents, the year comes first
    // (obsolete, the case is handled by constructURI)
    celexSector = "5";
    celexYear = reMatch[8];
    celexNumber = reMatch[9];

  } else {
    // Instrument type not yet implemented
    console.warn("Could not parse document number");
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
      console.warn("Could not parse document number");
      return null;
    }
  }

  // Make year 4-digit
  if (celexYear.length == 2) {
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


// Construct uri, depending on type of document
function constructURI(reMatch) {

  // Determine type of instrument
  if (reMatch[1] != undefined) {
    // Secondary legislation, construct CELEX number
    let codeInstrument = dictInstrument[reMatch[1].toLowerCase()];
    return "CELEX:" + encodeCelex(reMatch, codeInstrument);

  } else if (reMatch[4] != undefined) {
    // Case law, not yet implemented
    //let codeInstrument = dictInstrument[reMatch[4].toLowerCase()];
    console.warn("Could not parse document number");
    return null;

  } else if (reMatch[7] != undefined) {
    // Preparatory documents
    let docType = reMatch[7].toUpperCase();
    let docYear = reMatch[8];
    let docNumber = reMatch[9];

    return docType + ":" + docYear + ":" + docNumber + ":FIN";

  } else {
    console.warn("Could not parse document number");
    return null;
  }
}


// Take text input, run search
function runSearch(text) {
  console.log("EUR-Lex Search.");

  if (text === "") {
    // If search string empty, open advanced search
    const advancedSearchURL = 'https://eur-lex.europa.eu/advanced-search-form.html';
    browser.tabs.create({ url: advancedSearchURL });

  } else {
    // If search string not empty, check for match
    var reMatch = text.match(re);
    console.log(reMatch);

    if (reMatch === null) {
      // If no match, start simple search
      const newURL = `https://eur-lex.europa.eu/search.html?scope=EURLEX&lang=en&type=quick&text=${encodeURIComponent(text)}`;
      browser.tabs.create({ url: newURL });

    /*} else if (text[0] === "\"") {
      // If literal search
      const newURL = `https://eur-lex.europa.eu/search.html?scope=EURLEX&lang=en&type=quick&text=${encodeURIComponent(text)}`;
      browser.tabs.create({ url: newURL });
    */

    } else {
      // If match, construct CELEX number and open document
      let uri = constructURI(reMatch);

      if (uri === null) {
        // Could not be parsed
        const newURL = `https://eur-lex.europa.eu/search.html?scope=EURLEX&lang=en&type=quick&text=${encodeURIComponent(text)}`;
        browser.tabs.create({ url: newURL });

      } else {
        // Open CELEX directly
        const newURL = `https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=${encodeURIComponent(uri)}`;
        browser.tabs.create({ url: newURL });
      }
    }
  }
}


// Add omnibox search
browser.omnibox.onInputEntered.addListener((text) => {
  runSearch(text);
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