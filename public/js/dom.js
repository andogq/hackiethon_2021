// Elements referenced in the code
let el = {};
[
    "container_landing",
    "container_app",
    "container_output",
    "container_sign_in",
    "container_account_manager",
    "container_alert",
    "container_alert_blur",
    "container_exclude_exercises",

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

        let el_header = document.createElement("h4");
        el_header.innerText = header;
        el.container_alert.appendChild(el_header);

        let el_description = document.createElement("p");
        el_description.innerText = description;
        el.container_alert.appendChild(el_description);

        let el_button = document.createElement("button");
        el_button.innerText = "Continue";
        el_button.addEventListener("click", () => {
            hide("container_alert_blur");
            if (callback) callback();
        });
        el.container_alert.appendChild(el_button);

        show("container_alert_blur");
    },
    container_exclude_exercises: function(exercises) {
        el.container_exclude_exercises.innerHTML = "";

        for (let exercise_name of Object.keys(exercises)) {
            let el_checkbox = document.createElement("input");
            el_checkbox.type = "checkbox";
            el_checkbox.name = exercise_name;
            el_checkbox.checked = exercises[exercise_name].excluded;
            el.container_exclude_exercises.appendChild(el_checkbox);

            let el_label = document.createElement("label");
            el_label.for = exercise_name;
            el_label.innerText = exercises[exercise_name].name;
            el.container_exclude_exercises.appendChild(el_label);
        }
    },
    span_name: function(name) {
        el.span_name.innerText = name;
    }
}

function show(element) {
    console.log(element)
    if (element in el) el[element].classList.remove("hidden");
}

function hide(element) {
    if (element in el) el[element].classList.add("hidden");
}

export {el, update, show, hide};