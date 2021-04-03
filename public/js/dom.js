// Elements referenced in the code
let el = {};
[
    "container_output",
    "container_signed_in",
    "container_signed_out",

    "form_account",
    "form_update_profile",

    "button_register",
    "button_sign_in",
    "button_update_profile",
    "button_sign_out",
    
    "span_name"
].forEach(e => {
    el[e] = document.getElementById(e);
});

const update = {
    container_output: function(header, description) {
        el.container_output.innerHTML = "";

        let el_header = document.createElement("h3");
        el_header.innerText = header;
        el.container_output.appendChild(el_header);
    
        let el_description = document.createElement("p");
        el_description.innerText = description;
        el.container_output.appendChild(el_description);
    },
    span_name: function(name) {
        el.span_name.innerText = name;
    }
}

function show(element) {
    if (element in el) el[element].style.display = "";
}

function hide(element) {
    if (element in el) el[element].style.display = "none";
}

export {el, update, show, hide};