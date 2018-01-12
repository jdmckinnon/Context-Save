/*
MIT License

Copyright (c) [2018] [John McKinnon]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// let=block scoped, var=enclosing function scoped (can be global), const=immutable let
var globalCounter = 0;
var limit = 50;
var inputValid = new Boolean(true);
var divName = "dynamicInput";
var debugElementName = "debuggingBox";
var debuggingOption = false;
var scriptName = "options.js";

if (debuggingOption) {
  console.log(scriptName + " called");
}

function onError(error) {
  console.log(`Error: ${error}`);
}

function validateValue(item) {
  if (item.length < 1) {
    return false;
  } else {
    return true;
  }
}

function resetForm() {
  if (debuggingOption) {
    console.log(scriptName + ": resetForm() running");
  }
  var inputNodes = document.querySelectorAll("input[type=text]");

  for (var item of inputNodes) {
    item.value="";
  }
}

function removeAll() {
  if (debuggingOption) {
    console.log(scriptName + ": removeAll() running");
  }
  var inputDiv = document.getElementById(divName);

  while (inputDiv.hasChildNodes()) {
    inputDiv.removeChild(inputDiv.firstChild);
  }
  globalCounter = 0;
  addNewInput();
}

function setDebug() {
  if (debuggingOption) {
    console.log(scriptName + ": setDebug() running");
  }
  var debugToggle = document.getElementById("debuggingBox");

  browser.storage.local.set({
    debugging: debugToggle.checked
  });

  if (debugToggle.checked) {
    debuggingOption = true;
  } else {
    debuggingOption = false;
  }
}

function saveOptions(e) {
  if (debuggingOption) {
    console.log(scriptName + ": saveOptions() running");
  }
  e.preventDefault();
  var inputNodes = document.querySelectorAll("input[type=text]");
  var inputNodesMod = inputNodes.length % 2;
  var multiDimArray = new Array();
  var inputValid = new Boolean(true);

  if (inputNodesMod != 0) {
    onError("Invalid number of input items.");
    return;
  } else {
    inputNodes.forEach(
      function(currentValue, currentIndex, listObj) {
        if (!validateValue(currentValue.value)) {
          inputValid = false;
          return;
        }

        if (currentIndex % 2 == 0) {
          // We're at the beginning of a row, hold on to this value
          tempValue = currentValue.value;
        } else {
          // We're at the end of a row so push
          multiDimArray.push(tempValue, currentValue.value);
        }
      }
    );
  }

  if (inputValid) {
    browser.storage.local.set({
      storedLabels: multiDimArray
    });
  } else {
    alert("One of the values is empty");
  }
}

function addNewInput() {
  if (debuggingOption) {
    console.log(scriptName + ": addInput() called");
  }
  if (globalCounter == limit) {
    alert("Maximum of " + globalCounter + " labels reached");
  } else {
    var newdiv = document.createElement('div');
    newdiv.innerHTML = "Label: <input type='text' id='label'" + globalCounter + "> Path: <input type='text' id='directory'" + globalCounter + ">";
    document.getElementById(divName).appendChild(newdiv);
    globalCounter++;
  }
}

function onFound(item) {
  if (debuggingOption) {
    console.log(scriptName + ": onFound() running");
  }

  if (!item.storedLabels) {
    // No labels in storage, probably a fresh load of the add-on so just add the first input element
    addNewInput();
  } else {
    //Get the Object
    let list = Object.entries(item.storedLabels);
    var localCounter;
    let rowIndex = 0;

    for (localCounter = 0; localCounter < list.length; localCounter++) {
      if (localCounter % 2 == 0) {
        // We're at the beginning of a row, hold on to this value
        tempValue = list[localCounter][1];
      } else {
        // We're at the end of a row so push
        setFoundOptionsItem(rowIndex, tempValue, list[localCounter][1]);
        rowIndex++;
      }
    }
  }

  if (item.debugging) {
	debuggingOption = item.debugging;
	document.getElementById(debugElementName).checked=true;
  } else {
    debuggingOption = false;
	document.getElementById(debugElementName).checked=false;
  }
}

function setFoundOptionsItem(index, newLabel, newDir) {
  if (debuggingOption) {
    console.log(scriptName + ": setFoundOptionsItem() is running");
  }

  var divName = "dynamicInput";
  var newdiv = document.createElement('div');
  newdiv.innerHTML = "Label: <input type='text' id='label'"
    + index
    + " value='"
    + newLabel
    + "'> Path: <input type='text' id='directory'"
    + index
    + " value='"
    + newDir
    + "'>";
  document.getElementById(divName).appendChild(newdiv);
}

var addLabelButton = document.getElementById("addLabelButton");
var resetButton = document.getElementById("resetButton");
var removeAllButton = document.getElementById("removeAllButton");
var debugOption = document.getElementById("debuggingBox");
var foundLabels = browser.storage.local.get();

foundLabels.then(onFound, onError);
addLabelButton.addEventListener("click", addNewInput);
resetButton.addEventListener("click", resetForm);
removeAllButton.addEventListener("click", removeAll);
debugOption.addEventListener("change", setDebug);
document.querySelector("form").addEventListener("submit", saveOptions);