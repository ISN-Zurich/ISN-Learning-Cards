//****VIEW HELPERS******

// does nothing


function doNothing() {}

//opens a view
 
function openView() {
	$(document).trigger("trackingEventDetected",[this.tagID]);
	$("#" + this.tagID).show();
}

// closes a view
 
function closeView() {
	$("#" + this.tagID).hide();
}

// shows apologize message if not question data is loaded

function doApologize() {
	$("#feedbackBody").empty();
	$("<span/>", {
		text : "Apologize, no data are loaded"
	}).appendTo($("#dataErrorMessage"));
	$("#dataErrorMessage").show();
}




/* function that activates and deactivates web console log messages in all scripts */

function moblerlog(messagestring) {
    if (MOBLERDEBUG === 1) {
        console.log(messagestring);
    }
}