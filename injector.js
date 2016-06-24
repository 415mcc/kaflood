/* global chrome:false */

function injectScript (fileName) {
  let script = document.createElement('script');
  script.src = chrome.extension.getURL(fileName);
  script.onload = () => {
    script.parentNode.removeChild(script);
  };
  document.body.appendChild(script);
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if ('pin' in msg && 'name' in msg) {
    for (let key of ['pin', 'name']) {
      let hiddenSpan = document.createElement('span');
      hiddenSpan.id = 'kaflood-hidden-' + key;
      hiddenSpan.style.display = 'none';
      hiddenSpan.innerHTML = msg[key];
      document.body.appendChild(hiddenSpan);
    }
    injectScript('inject.js');
  }
});
