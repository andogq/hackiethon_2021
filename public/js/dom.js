// Elements referenced in the code
let el = {};
[
    "container_output",
    "container_sign_in",
    "container_account_manager",
    "container_alert",

    "form_account_details",
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
    container_alert: function(header, description, callback) {
        el.container_alert.innerHTML = "";

        let el_header = document.createElement("h3");
        el_header.innerText = header;
        el.container_alert.appendChild(el_header);

        let el_description = document.createElement("h3");
        el_description.innerText = description;
        el.container_alert.appendChild(el_description);

        let el_button = document.createElement("button");
        el_button.innerText = "Continue";
        el_button.addEventListener("click", () => {
            hide("container_alert");
            if (callback) callback();
        });
        el.container_alert.appendChild(el_button);

        show("container_alert");
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