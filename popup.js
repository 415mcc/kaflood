let nameFields = [];
let listDiv = document.getElementById('name-list');

function addNameField () {
  let field = document.createElement('input');
  field.addEventListener('input', () => {
    if (nameFields[nameFields.length - 1].value !== '') addNameField();
  });

  field.addEventListener('blur', e => {
    if (e.target.value === '' &&
        nameFields[nameFields.length - 1] !== e.target) {
      listDiv.removeChild(e.target);
      nameFields.splice(nameFields.indexOf(e.target), 1);
    }
  });

  field.setAttribute('type', 'next');
  field.setAttribute('class', 'kt-field');
  nameFields.push(field);
  listDiv.appendChild(field);
}

function getNames () {
  return nameFields
    .map(elem => elem.value)
    .filter(elem => elem !== '');
}

function getPIN () {
  return document.getElementById('pin-input').value;
}

function completeInput () {
  chrome.extension.sendMessage({pin: getPIN(), names: getNames()});
  window.close();
}

document.getElementById('join-btn').addEventListener('click', completeInput);
document.addEventListener('keypress', e => {
  if (e.key === 'Enter') completeInput();
});

addNameField();
