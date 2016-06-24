/* global chrome:false */

function addTabToStorage (tab, callback) {
  chrome.storage.local.get('tabs', items => {
    let setVal;
    if (items.tabs) {
      items.tabs.push(tab.id);
      setVal = items.tabs;
    } else {
      setVal = [tab.id];
    }
    chrome.storage.local.set({tabs: setVal}, () => {
      if (callback) callback();
    });
  });
}

function removeTabsFromStorage (tabIds, callback) {
  chrome.storage.local.get('tabs', items => {
    if (Array.isArray(items.tabs)) {
      tabIds = typeof tabIds === 'number' ? [tabIds] : tabIds;
      tabIds.forEach((elem, index, array) => {
        let i = items.tabs.indexOf(elem);
        if (i !== -1) items.tabs.splice(i, 1);
      });
      chrome.storage.local.set({tabs: items.tabs}, () => {
        if (callback) callback();
      });
    }
  });
}

function inject (tab, pin, name, callback) {
  chrome.tabs.executeScript(tab.id, {file: 'injector.js'}, () => {
    chrome.tabs.sendMessage(tab.id, {pin: pin, name: name}, () => {
      if (callback) callback();
    });
  });
}

function newKahootTab (pin, name, callback) {
  chrome.tabs.create({url: 'https://kahoot.it/#/', active: false}, tab => {
    addTabToStorage(tab, () => {
      inject(tab, pin, name, callback);
    });
  });
}

function newTabs (pin, names, callback) {
  newKahootTab(pin, names[0], () => {
    if (names.length > 1) {
      newTabs(pin, names.slice(1), callback);
    } else if (callback) {
      callback();
    }
  });
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if ('close' in msg) {
    let removeTab = (elem, index, array) => {
      chrome.tabs.remove(elem);
    };

    if (msg.close === 'all') {
      chrome.storage.local.get('tabs', items => {
        items.tabs.forEach(removeTab);
        chrome.storage.local.remove('tabs', () => {
          sendResponse();
        });
      });
    } else {
      if (typeof msg.close === 'number') chrome.tabs.remove(msg.close);
      else msg.close.forEach(removeTab);

      removeTabsFromStorage(msg.close, () => {
        sendResponse();
      });
    }
  } else if ('pin' in msg && 'names' in msg) {
    newTabs(msg.pin, msg.names, () => {
      sendResponse();
    });
  } else if ('choice' in msg) {
    // not implemented!
    console.log(msg.choice);
    return false;
  }
  return true;
});
