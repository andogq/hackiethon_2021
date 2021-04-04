// Elements referenced in the code
let el = {};
[
    "container_landing",
    "container_app",
    "container_sign_in",
    "container_settings",
    "container_alert",
    "container_alert_blur",
    "container_exclude_exercises",
    "container_exercise_popup",
    "container_exercise_popup_blur",
    "container_user_statistics",

    "form_account_details",
    "form_update_profile",

    "button_register",
    "button_sign_in",
    "button_update_profile",
    "button_sign_out",
    "button_settings",
    "button_back",
    
    "span_name",

    "text_user_points",
    "text_user_points_today",
    "text_user_streak",
    "text_exercise_timer"
].forEach(e => {
    el[e] = document.getElementById(e);
});

const update = {
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
    container_exercise_popup: function(exercise, doneCallback, skipCallback) {
        el.container_exercise_popup.innerHTML = "";

        let el_exercise = document.createElement("h3");
        el_exercise.innerText = exercise.name;
        el.container_exercise_popup.appendChild(el_exercise);

        let el_timer = document.createElement("h4");
        el_timer.innerText = "00:00";
        el.container_exercise_popup.appendChild(el_timer);

        let el_description = document.createElement("p");
        el_description.innerText = exercise.description;
        el.container_exercise_popup.appendChild(el_description);

        let el_buttons = document.createElement("div");
        el_buttons.id = "container_exercise_buttons";
        el.container_exercise_popup.appendChild(el_buttons);

        let el_done = document.createElement("button");
        el_done.id = "button_exercise_done";
        el_done.addEventListener("click", () => {
            hide("container_exercise_popup_blur");
            if (doneCallback) doneCallback();
        });
        el_buttons.appendChild(el_done);

        let el_done_img = document.createElement("img");
        el_done_img.src = "/assets/tick.svg";
        el_done.appendChild(el_done_img);

        let el_skip = document.createElement("button");
        el_skip.id = "button_exercise_skip";
        el_skip.addEventListener("click", () => {
            hide("container_exercise_popup_blur");
            if (skipCallback) skipCallback();
        });
        el_buttons.appendChild(el_skip);

        let el_skip_img = document.createElement("img");
        el_skip_img.src = "/assets/cross.svg";
        el_skip.appendChild(el_skip_img);

        show("container_exercise_popup_blur");
    },
    container_exclude_exercises: function(exercises) {
        el.container_exclude_exercises.innerHTML = "";

        for (let exercise_name of Object.keys(exercises)) {
            let el_container = document.createElement("div");

            let el_checkbox = document.createElement("input");
            el_checkbox.type = "checkbox";
            el_checkbox.name = exercise_name;
            el_checkbox.checked = exercises[exercise_name].excluded;
            el_container.appendChild(el_checkbox);

            let el_label = document.createElement("label");
            el_label.for = exercise_name;
            el_label.innerText = exercises[exercise_name].name;
            el_container.appendChild(el_label);

            el.container_exclude_exercises.appendChild(el_container);
        }
    },
    container_user_statistics: function(total, today, streak) {
        el.text_user_points.innerText = total;
        el.text_user_points_today.innerText = today;
        el.text_user_streak.innerText = streak;
    },
    span_name: function(name) {
        el.span_name.innerText = name;
    }
}

function show(element) {
    if (element in el) el[element].classList.remove("hidden");
}

function hide(element) {
    if (element in el) el[element].classList.add("hidden");
}

export {el, update, show, hide};