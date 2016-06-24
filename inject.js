/* global angular:false */

// time between checks for the form elements
const WAIT_ELEM_APPEAR = 50;
// time to wait before checking if game PIN submission was a success
const WAIT_CHECK_INVALID = 750;
// time to wait before trying to submit PIN again
const WAIT_AFTER_INVALID = 500;

function submitPIN (spanId, callback) {
  function send (elem) {
    angular.element(elem)
      .scope()
      .joinSession(document.getElementById(spanId).innerHTML);
  }

  function getElem () {
    let possibles = Array.prototype.filter.call(
      document.getElementsByClassName('ng-pristine ng-valid'),
      elem => elem.hasAttribute('ng-submit') &&
        elem.getAttribute('ng-submit') === 'joinSession(gameId)'
    );
    if (possibles.length > 0) return possibles[0];

    return null;
  }

  function submit () {
    let elem = getElem();
    if (elem) {
      send(elem);

      setTimeout(() => {
        let pinInput = document.getElementById('inputSession');
        if (pinInput !== null && pinInput.classList.contains('invalid')) {
          setTimeout(submit, WAIT_AFTER_INVALID);
        }
      }, WAIT_CHECK_INVALID);
    } else {
      setTimeout(submit, WAIT_ELEM_APPEAR);
    }
  }

  submit();

  if (callback) callback();
}

function submitName (spanId, callback) {
  function send (elem) {
    angular.element(elem)
      .scope()
      .join({name: document.getElementById(spanId).innerHTML});
  }

  function submit () {
    let possibles = Array.prototype.filter.call(
      document.getElementsByClassName('ng-pristine ng-valid'),
      elem => elem.hasAttribute('ng-submit') &&
        elem.getAttribute('ng-submit') === 'join(user)'
    );
    if (possibles.length > 0) {
      send(possibles[0]);
    } else {
      setTimeout(submit, WAIT_ELEM_APPEAR);
    }
  }

  submit();

  if (callback) callback();
}

submitPIN('kaflood-hidden-pin', () => submitName('kaflood-hidden-name'));
