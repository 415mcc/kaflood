// let tabs = []; // for later use

function inject (tab, pin, name, callback) {
  chrome.tabs.executeScript(tab.id, {file: 'injector.js'}, () => {
    chrome.tabs.sendMessage(tab.id, {pin: pin, name: name}, () => {
      if (callback) callback();
    });
  });
}

function createTab (callback) {
  chrome.tabs.create({url: 'https://kahoot.it/#/', active: false}, tab => {
    // tabs.push(tab); // for later use
    if (callback) callback(tab);
  });
}

function newKahootTab (pin, name) {
  createTab(tab => { inject(tab, pin, name); });
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if ('pin' in msg && 'names' in msg) {
    let len = msg.names.length;
    for (let i = 0; i < len; i++) {
      newKahootTab(msg.pin, msg.names[i]);
    }
  }
});
