

// DOM Elements
const aShowDivHidden = document.querySelector(".a-show-div-hidden");
const divHidden = document.querySelector(".div-hidden");
const selectGroup = document.querySelector(".select-group");
const btnRego = document.querySelector(".btn-rego");
const popupRego = document.querySelector(".popup-rego");

// hide GIFS on load i.e. unscrollable until user clicks .a-show-div-hidden
window.onload = function() {
    popupRego.hidden = true;
    divHidden.hidden = true;
}

btnRego.onclick = showPopupRego;
function showPopupRego() {
    popupRego.hidden = false;
}
// display hidden div onclick
aShowDivHidden.onclick = showDivHidden;
function showDivHidden() {
    divHidden.hidden = false;
}


// populate selectGroup with registered Group names


