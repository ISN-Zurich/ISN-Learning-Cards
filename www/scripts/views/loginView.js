/**
 * View for displaying the login form
 */
function LoginView(controller) {
	var self = this;

	self.tagID = 'splashScreen';
	this.controller = controller;
	this.active = false;

	jester($('#loginButton')[0]).tap(function() {
		self.clickLoginButton();
	});

	// if keyboard is displayed, move the logos up
	// if keyboard is not displayed anymore, move logos down
	$("#usernameInput")[0].addEventListener("focus", focusLogos);
	$("#password")[0].addEventListener("focus", focusLogos);
	$("#usernameInput")[0].addEventListener("blur", unfocusLogos);
	$("#password")[0].addEventListener("blur", unfocusLogos);

	function focusLogos(e) {
		console.log("focus logos " + e.currentTarget.id);
		$("#logos").removeClass("bottom");
		$("#logos").addClass("static");
	}

	function unfocusLogos(e) {
		console.log("unfocus logos " + e.currentTarget.id);
		$("#logos").addClass("bottom");
		$("#logos").removeClass("static");
	}

}

/**
 * tap, swipe and pinch do nothing
 */
LoginView.prototype.handleTap = doNothing;
LoginView.prototype.handlePinch = doNothing;
LoginView.prototype.handleSwipe = doNothing;

/**
 * opens the view
 */
LoginView.prototype.openDiv = openView;

/**
 * shows the login form
 */
LoginView.prototype.open = function() {
	this.showForm();
	this.openDiv();

	this.active = true;
};
/**
 * closes the view
 */
LoginView.prototype.closeDiv = closeView;
LoginView.prototype.close = function() {
	$("#password").blur();
	$("#usernameInput").blur();
	this.active = false;

	this.closeDiv();
}

/**
 * click on the login button sends data to the authenication model data is only
 * send, if input fields contain some values after successful login, the course
 * list is displayed
 */
LoginView.prototype.clickLoginButton = function() {
	var user, password;
	var self = this;
	var offline = self.controller.models["connection"].isOffline();

	function cbLoginSuccess() {
		if (self.active) {
			console.log("is logIn");
			controller.transitionToCourses();
		}
	}

	function cbLoginFailure(e, errormessage) {
		console.log("authentication failed, reason: " + errormessage);
		switch (errormessage) {
		case "connectionerror":
			if (!offline) {
				self.showErrorMessage("Authentication failed! Please try again!");
			}
			break;
		case "nouser":
			console.log("no user error");
			self.showErrorMessage("Wrong username or password!");
			break;
		default:
			break;
		}
	}

	console.log("check logIn data");
	console.log("offline: " + offline);
	if ($("#usernameInput").val() && $("#password").val()) {
		if (!offline) {
		console.log("has logIn data");

		$(document).bind("authenticationready", cbLoginSuccess);

		$(document).bind("authenticationfailed", cbLoginFailure);

		// TODO make it visible to the user that we are waiting for the server
		controller.models['authentication'].login($("#usernameInput").val(), $(
				"#password").val());
//		$("#usernameInput").val("");
//		$("#password").val("");
		self.showErrorMessage("Authentication data is sent to the server. Please wait!");
		}
	} else {
		self.showErrorMessage("Please enter your username and password!");
	}
};

/**
 * displays the login form
 */
LoginView.prototype.showForm = function() {
	$("#loginForm").show();
};

LoginView.prototype.showErrorMessage = function(message) {
	$("#errormessage").text(message);
	$("#errormessage").show();
}

LoginView.prototype.hideErrorMessage = function() {
	$("#errormessage").text("");
	$("#errormessage").hide();
}
