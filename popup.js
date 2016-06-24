const nameFields = [];
const nameList = document.getElementById('name-list');
const startUI = document.getElementById('start-ui');
const gameUI = document.getElementById('game-ui');
const pinInput = document.getElementById('pin-input');
const loadingDiv = document.getElementById('loading');
const joinBtn = document.getElementById('join-btn');
const tabList = document.getElementById('tab-list');
const clearAllBtn = document.getElementById('clear-all-btn');
const triangleBtn = document.getElementById('triangle-btn');
const hexBtn = document.getElementById('hex-btn');
const circleBtn = document.getElementById('circle-btn');
const squareBtn = document.getElementById('square-btn');

function createField (id) {
  let field = document.createElement('input');
  field.setAttribute('type', 'text');
  field.classList.add('kt-field');
  if (id) field.id = id;
  return field;
}

function createSpan (text, id) {
  let span = document.createElement('span');
  span.appendChild(document.createTextNode(text));
  if (id) span.id = id;
  return span;
}

function getTabsData (callback) {
  chrome.storage.local.get('tabs', items => {
    // [] isnt falsy in JS so make it null
    if (Array.isArray(items.tabs) && items.tabs.length < 1) items.tabs = null;
    callback(items.tabs);
  });
}

function makeTabRemover (elem, tabId) {
  return () => {
    chrome.runtime.sendMessage({close: tabId}, response => {
      elem.parentElement.removeChild(elem);
      getTabsData(tabs => {
        if (!tabs) switchInterface();
      });
    });
  };
}

function createTabListItem (tabId) {
  let li = document.createElement('li');
  let span1 = createSpan('X');
  span1.addEventListener('click', makeTabRemover(li, tabId));
  li.appendChild(span1);
  li.appendChild(createSpan(' - '));
  li.appendChild(document.createTextNode(tabId));
  return li;
}

function addNameField () {
  let field = createField();
  field.addEventListener('input', () => {
    if (nameFields[nameFields.length - 1].value !== '') addNameField();
  });

  field.addEventListener('blur', e => {
    if (e.target.value === '' &&
        nameFields[nameFields.length - 1] !== e.target) {
      nameList.removeChild(e.target);
      nameFields.splice(nameFields.indexOf(e.target), 1);
    }
  });

  nameFields.push(field);
  nameList.appendChild(field);
}

function getNames () {
  return nameFields
    .map(elem => elem.value)
    .filter(elem => elem !== '');
}

function getPIN () {
  return pinInput.value;
}

function completeInput () {
  document.activeElement.blur();
  loadingDiv.hidden = false;
  chrome.runtime.sendMessage({pin: getPIN(), names: getNames()}, () => {
    loadingDiv.hidden = true;
    switchInterface();
  });
}

function isStartUI () {
  return !startUI.hidden && loadingDiv.hidden;
}

function isGameUI () {
  return !gameUI.hidden && loadingDiv.hidden;
}

function makeChoiceSubmitter (choice, callback) {
  return () => {
    chrome.runtime.sendMessage({choice: choice}, () => {
      if (callback) callback();
    });
  };
}

function setup () {
  // start ui
  joinBtn.addEventListener('click', completeInput);
  document.addEventListener('keypress', e => {
    if (isStartUI() && e.key === 'Enter') completeInput();
  });
  addNameField();

  // game ui
  clearAllBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({close: 'all'}, () => {
      switchInterface();
    });
  });
  triangleBtn.addEventListener('click', makeChoiceSubmitter(0));
  hexBtn.addEventListener('click', makeChoiceSubmitter(1));
  circleBtn.addEventListener('click', makeChoiceSubmitter(2));
  squareBtn.addEventListener('click', makeChoiceSubmitter(3));
}

function startInterface () {
  gameUI.hidden = true;
  startUI.hidden = false;
}

function gameInterface (tabs) {
  startUI.hidden = true;
  tabs.forEach((elem, index, array) => {
    tabList.appendChild(createTabListItem(elem));
  });
  gameUI.hidden = false;
}

function switchInterface () {
  if (isGameUI()) {
    startInterface();
  } else {
    getTabsData(tabs => {
      gameInterface(tabs);
    });
  }
}

setup();
getTabsData(tabs => {
  if (tabs) {
    gameInterface(tabs);
  } else {
    startInterface();
  }
});
