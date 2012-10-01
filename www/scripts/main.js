var controller;

document.addEventListener("deviceready", init, false);

/**
 * starts the app
 */
function init() {
    controller = new Controller();
    $(document).trigger("trackingEventDetected",["appStart"]);
}