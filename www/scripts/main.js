var controller;

document.addEventListener("deviceready", init, false);

function init() {
    controller = new Controller();
    $(document).trigger("trackingEventDetected",["appStart"]);
}


