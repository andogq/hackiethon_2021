function trigger_exercise() {
    self.clients.matchAll({type: "window"}).then(clients => {
        let notified = false;

        // Go through each client attached to the service worker
        clients.forEach(client => {
            // If there is one that is focused, notify it
            if (client.focused) {
                client.postMessage({
                    command: "trigger_exercise"
                });
                notified = true;
            }
        });

        // If no clients are focused, send a notification to the user
        if (!notified) {
            commands.notify({title: "Time to exercise!"});
        }
    });
}

const commands = {
    notify: function(parameters) {
        self.registration.showNotification(parameters.title, parameters.options);
    },
    log: function(message) {
        console.log(`[sw] ${message}`);
    }
}

// Service worker is being installed
self.addEventListener("install", () => {
    commands.log("Service worker installed");
    self.skipWaiting();
});

// Service worker has been activated and is running
self.addEventListener("activate", () => {
    commands.log("Service worker activated");

    setInterval(trigger_exercise, 5 * 60 * 1000);
});

// Service worker receives a message from the web page
self.addEventListener("message", e => {
    if ("command" in e.data && "parameters" in e.data) {
        let {command, parameters} = e.data;

        if (command in commands) {
            commands[command](parameters);
        }
    }
});