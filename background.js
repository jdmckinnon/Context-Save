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

var requestURL ='';
var label;
var directoryMap = new Map();
var debuggingOption = false;
var scriptName = "background.js";

if (debuggingOption) {
  console.log(scriptName + " called");
}

function onError(error) {
  console.log(`Error: ${error}`);
}

function onCreated() {
  if (browser.runtime.lastError) {
    console.log(`Error: ${browser.runtime.lastError}`);
  } else {
    if (debuggingOption) {
      console.log(scriptName + ": ContextSave loaded successfully");
    }
  }
}

function onChange(item) {
  if (debuggingOption) {
    console.log(scriptName + ": onChange() running");
  }

  if (item.storedLabels) {
    browser.menus.removeAll();

    //Get the Object
    let list = Object.entries(item.storedLabels);
    setLabels(list);
  }

  if (item.debugging) {
	debuggingOption = item.debugging;
  } else {
    debuggingOption = false;
  }
}

function setLabels(list) {
  if (debuggingOption) {
    console.log(scriptName + ": setLabels() running");
  }

  var counter;

  for (counter = 0; counter < list.length; counter++) {
    if (counter % 2 == 0) {
      // We're at the beginning of a row, hold on to this value
      tempValue = list[counter][1];
    } else {
      // We're at the end of a row so push
      setContextItem(tempValue, list[counter][1]);
    }
  }
}

function setContextItem(newLabel, newDir) {
  if (debuggingOption) {
    console.log(scriptName + ": setContextItem() running");
  }

  directoryMap.set(newLabel, newDir);

  browser.menus.create({
    id: newLabel,
	type: "normal",
	title: newLabel,
	contexts: ["all"]
  });
}

function updateOnChange(changes, area) {
  if (debuggingOption) {
    console.log(scriptName + ": updateOnChange() running");
  }

  aChange = browser.storage.local.get();
  aChange.then(onChange, onError);
}

function saveFile(downloadURL, downloadDir) {
  if (debuggingOption) {
    console.log(scriptName + ": saveFile() running");
  }
  var downloadFilename = downloadURL.substring(downloadURL.lastIndexOf("/") + 1).split("?")[0];
  var saveFile = downloadDir + '/' + downloadFilename;

  var downloadResult = browser.downloads.download({
    url: downloadURL,
    filename : saveFile,
    conflictAction : 'uniquify'
  });
}

function handleMessage(request, sender, sendResponse) {
  if (debuggingOption) {
    console.log(scriptName + ": handleMessage() running");
  }
  requestURL = request.url;
}

browser.menus.onClicked.addListener((info, tab) => {
  if (debuggingOption) {
    console.log("Context Save will save file at URL=" + requestURL + " and to directory=" + directoryMap.get(info.menuItemId));
  }
  saveFile(requestURL, directoryMap.get(info.menuItemId));
});

browser.storage.onChanged.addListener(updateOnChange);
var storedLabels = browser.storage.local.get("storedLabels");
storedLabels.then(onChange, onError);
browser.runtime.onMessage.addListener(handleMessage);
