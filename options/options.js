let commonNames = {
  "GDPR" : "Regulation 2016/679",
  "General Data Protection Regulation" : "Regulation 2016/679"
}
let globalOptions = {
  "lang": "EN",
  "docTab": "TXT",
  "curia": true,
};

// Read globalOptions and commonNames from local storage
function readStorage() {
  chrome.storage.local.get(["commonNames"])
    .then((result) => {
      commonNames = JSON.parse(result.commonNames);
    })
    .catch((result) => {
      console.warn("Cannot load commonNames from storage. Use defaults.");
    })
    .finally(() => {
      setCommonNamesList();
    });

  chrome.storage.local.get(["globalOptions"])
    .then((result) => {
      globalOptions = JSON.parse(result.globalOptions);
    })
    .catch((result) => {
      console.warn("Cannot load globalOptions from storage. Use defaults.");
    })
    .finally(() => {
      setInputs();
    });
}

// Write globalOptions and commonNames to local storage
function writeStorage() {
  chrome.storage.local.set({"commonNames": JSON.stringify(commonNames)});
  chrome.storage.local.set({"globalOptions": JSON.stringify(globalOptions)});
}

// Options //
let inputLang = document.getElementById("inputLang");
let inputDocTab = document.getElementById("inputDocTab");
let inputCuria = document.getElementById("inputCuria");

// Set inputs according to values (does not read from storage!)
function setInputs() {
  inputLang.value = globalOptions["lang"];
  inputDocTab.value = globalOptions["docTab"];
  inputCuria.checked = globalOptions["curia"];
}

// Set values according to inputs and save to storage
function getInputs() {
  globalOptions["lang"] = inputLang.value;
  globalOptions["docTab"] = inputDocTab.value;
  globalOptions["curia"] = inputCuria.checked;
  writeStorage();
}

inputLang.addEventListener("input", (e) => {getInputs();});
inputDocTab.addEventListener("input", (e) => {getInputs();});
inputCuria.addEventListener("input", (e) => {getInputs();});

// Common names //
// Redraw commonNamesList in HTML from current commonNames dictionary
function setCommonNamesList() {
  let commonNamesList = document.getElementById("commonNamesList");

  // Empty list
  commonNamesList.innerHTML = "";
  // Add common names
  for (commonName of Object.keys(commonNames)) {
    let li = document.createElement("li");

    // Add delete button
    let button = document.createElement("button");
    button.value = commonName;
    let buttonText = document.createTextNode("Delete");
    button.appendChild(buttonText);
    button.addEventListener("click", (e) => {
      removeCommonName(button.value);
    });
    li.appendChild(button);

    // Add text
    let bold = document.createElement("b");
    bold.innerText = commonName + " : ";
    li.appendChild(bold);

    let text = document.createTextNode(commonNames[commonName]);
    li.appendChild(text);

    // Add element to list
    commonNamesList.appendChild(li);
  }
}

// Add commonName to dictionary, write to storage, redraw commonNamesList
// If commonName is already a key in commonNames, overwrite
function addCommonName(commonName, identifier) {
  commonNames[commonName] = identifier;
  writeStorage();
  setCommonNamesList();
}

// Remove commonName from dictionary, write to storage, redraw commonNamesList
function removeCommonName(commonName) {
  console.log("Delete " + commonName);
  delete commonNames[commonName];
  writeStorage();
  setCommonNamesList();
}

// "Add" button listener
let commonNameInput = document.getElementById("commonName");
let identifierInput = document.getElementById("identifier");
document.getElementById("addCommonName").addEventListener("click", (e) => {
  addCommonName(commonNameInput.value, identifierInput.value);
});


// Run //
readStorage();
