/* Explicit h:mm AM/PM in the visitor's local timezone, independent of locale. */
(() => {
  'use strict';
  function format(date) {
    const hours=date.getHours(),minutes=date.getMinutes();
    if(!Number.isFinite(hours)||!Number.isFinite(minutes))return '--:--';
    return (hours%12||12)+':'+String(minutes).padStart(2,'0')+' '+(hours<12?'AM':'PM');
  }
  window.TimClock=Object.freeze({format});
})();
