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

self.addEventListener("notificationclick", (e) => {
    // Close notification
    e.notification.close();
    
    // Hold the event until something is opened
    e.waitUntil(clients.matchAll({type: "window"}).then(clients => {
        let p = Promise.resolve();

        // Try find an open window
        for (let client of clients) {
            if ("focus" in client) {
                p = client.focus();
                break;
            }
        }

        return p;
    }));
});