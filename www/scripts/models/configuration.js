var APP_ID = "ch.ethz.isn.learningcards";

/**
 * This model holds the data about the current configuration
 */
function ConfigurationModel(controller) {
	this.configuration = {};

	
//	this.configuration.appAuthenticationKey = "";
//	this.storeData();
//	
	console.log("Configuration Storage: "
			+ localStorage.getItem("configuration"));

	this.controller = controller;

	this.loadData();

	var clientKey = this.configuration.appAuthenticationKey;
	// this.clientKey = localStorage.getItem("ClientKey");
	if (!clientKey || clientKey.length == 0) {
		console.log("registration is done");
		this.register();
	} else {
		this.loadFromServer();
	}
	// initialize the configuration if it does not exist
	// this.createConfiguration();

}

/**
 * stores the data into the local storage (key = "configuration") therefor the
 * json object is converted into a string
 */
ConfigurationModel.prototype.storeData = function() {
	var configString;
	try {
		configString = JSON.stringify(this.configuration);
	} catch (err) {
		configString = "";
		console.log("error while storing");
	}
	console.log(configString);
	localStorage.setItem("configuration", configString);

	console.log("Configuration Storage after storeData: "
			+ localStorage.getItem("configuration"));
};

/**
 * loads the data from the local storage (key = "configuration") therefor the
 * string is converted into a json object
 */
ConfigurationModel.prototype.loadData = function() {
	var configObject;
	try {
		configObject = JSON.parse(localStorage.getItem("configuration"));
	} catch (err) {
		console.log("error! while loading");
	}

	console.log("configObject: " + JSON.stringify(configObject));

	if (!configObject) {
		configObject = {
			loginState : "loggedOut"
		};
	}

	// if (!configObject.loginState) { //if no configuration is available, a new
	// one is created
	// configObject = this.createConfiguration();
	// }

	this.configuration = configObject;

};

/**
 * loads the configuration data from the server and stores it in the local
 * storage when all data is loaded, the authenticationready event is triggered
 */
ConfigurationModel.prototype.loadFromServer = function() {
	var self = this;
	if (this.configuration.userAuthenticationKey
			&& this.configuration.userAuthenicationKey != "") {
		$.ajax({
					url : 'http://yellowjacket.ethz.ch/ilias_4_2/restservice/learningcards/authenticationBella.php',
					type : 'GET',
					dataType : 'json',
					success : function(data) {
						console.log("success");
						console.log("JSON: " + data);
						var authenticationObject;
						try {
							authenticationObject = data;
							console.log("authenticationData from server");
						} catch (err) {
							console
									.log("Error: Couldn't parse JSON for authentication");
							authenticationObject = {};
						}

						// if (!questionPoolObject[0]) { // if no courses are
						// available, new ones are created
						// console.log("no questionpool loaded");
						// questionPoolObject = self.createPool(data.courseID);
						// }

						console.log("Object: " + authenticationObject);
						// authenticationObject.loginState =
						// self.configuration.loginState;
						// check if configuration in local storage is the same
						// as the one from the server
						// change local data only if there are contradictions
						// with the backend
						self.configuration.learnerInformation = authenticationObject.learnerInformation;
						self.configuration.globalSynchronizationState = authenticationObject.globalSynchronizationState;
						self.storeData();

						$(document).trigger("authenticationready",
								authenticationObject.learnerInformation.userId);
					},
					error : function() {
						console.log("Error while authentication to server");
						$(document).trigger("authenticationfailed");
					},
					beforeSend : setHeader
				});

		function setHeader(xhr) {
			xhr.setRequestHeader('sessionkey',
					self.configuration.userAuthenticationKey);
		}

	}
};

/**
 * logs in user
 */
ConfigurationModel.prototype.login = function(username, password) {
	// this.configuration.loginState = "loggedIn";
	// this.storeData();
	// this.loadFromServer();
	// success();

	console.log("client key: " + this.configuration.appAuthenticationKey);

	passwordHash = faultylabs.MD5(password);
	console.log("md5 password: " + passwordHash);
	challenge = faultylabs.MD5(username + passwordHash.toUpperCase()
			+ this.configuration.appAuthenticationKey)
	var auth = {
		"username" : username,
		"challenge" : challenge
	};

	this.sendAuthToServer(auth);
};

/**
 * logs out user
 */
ConfigurationModel.prototype.logout = function() {
	// this.configuration.loginState = "loggedOut";
	// this.storeData();
	this.sendLogoutToServer();

	
};

/**
 * sends authentication data to the server
 */
ConfigurationModel.prototype.sendAuthToServer = function(authData) {
	var self = this;
	$
			.ajax({
				url : 'http://yellowjacket.ethz.ch/ilias_4_2/restservice/learningcards/authenticationBella.php/login',
				type : 'GET',
				dataType : 'json',
				success : function(data) {
					try {
						if (data && data.userAuthenticationKey != -1) {
							console.log("userAuthenticationKey: "
									+ data.userAuthenticationKey);
							self.configuration.userAuthenticationKey = data.userAuthenticationKey;
							self.configuration.learnerInformation = data.learnerInformation;
							self.storeData();
						}
					} catch (err) {
						console.log("Couldn't authenticate to server " + err);
						$(document).trigger("authenticationfailed");
						return false;
					}
					$(document).trigger("authenticationready",
							self.configuration.userAuthenticationKey);
				},
				error : function() {
					console.log("Error while authentication to server");
					$(document).trigger("authenticationfailed");
				},
				beforeSend : setHeader
			});

	function setHeader(xhr) {
		xhr.setRequestHeader('uuid', device.uuid);
		xhr.setRequestHeader('appid', APP_ID);
		xhr.setRequestHeader('authdata', authData.username + ":"
				+ authData.challenge);
	}
}

/**
 * invalidates the current session key
 */
ConfigurationModel.prototype.sendLogoutToServer = function() {
	var self = this;
	$
			.ajax({
				url : 'http://yellowjacket.ethz.ch/ilias_4_2/restservice/learningcards/authenticationBella.php/logout',
				type : 'GET',
				dataType : 'json',
				success : function() {
					console.log("user logged out");
					self.configuration.userAuthenticationKey = "";
					self.storeData();
				},
				error : function() {
					console.log("Error while logging out from server");
				},
				beforeSend : setHeader
			});

	function setHeader(xhr) {
		xhr.setRequestHeader('sessionkey',
				self.configuration.userAuthenticationKey);
	}
}

/**
 * @return true if user is logged in, otherwise false
 */
ConfigurationModel.prototype.isLoggedIn = function() {
	return (this.configuration.userAuthenticationKey && this.configuration.userAuthenticationKey != "") ? true
			: false;
};

/**
 * @return the full name of the user
 */
ConfigurationModel.prototype.getDisplayName = function() {
	return this.configuration.learnerInformation.displayName;
};

/**
 * @return the username
 */
ConfigurationModel.prototype.getUserName = function() {
	return this.configuration.learnerInformation.userName;
};

/**
 * @return the user id
 */
ConfigurationModel.prototype.getUserId = function() {
	return this.configuration.learnerInformation.userId;
};

/**
 * @return the email address of the user
 */
ConfigurationModel.prototype.getEmailAddress = function() {
	return this.configuration.learnerInformation.emailAddress;
};

/**
 * @return the session key of the user
 */
ConfigurationModel.prototype.getSessionKey = function() {
	return this.configuration.userAuthenticationKey;
};

/**
 * if no configuration is stored in the local storage, a new one is created
 */
ConfigurationModel.prototype.createConfiguration = function() {
	console.log("create configuration");

	if (!localStorage.configuration) {
		initConfiguration();
	}

	try {
		return JSON.parse(localStorage.getItem("configuration"));
	} catch (err) {
		return {};
	}
};

// it is called whenver my client(app) key is empty
ConfigurationModel.prototype.register = function() {
	var self = this;
	var deviceID = device.uuid;

	$.ajax({
				url : 'http://yellowjacket.ethz.ch/ilias_4_2/restservice/learningcards/registration.php',
				type : 'GET',
				dataType : 'json',
				success : appRegistration,
				error : function() {
					console
							.log("Error while registering the app with the backend");
				},
				beforeSend : setHeaders
			});

	function setHeaders(xhr) {
		xhr.setRequestHeader('AppID', APP_ID);
		xhr.setRequestHeader('UUID', deviceID);
		console.log("uuid:" + deviceID);

	}

	function appRegistration(data) {
		// localStorage.setItem(data.ClientKey);
		self.configuration.appAuthenticationKey = data.ClientKey;
		self.storeData();
		// we can now savely load the user data
		self.loadFromServer();
	}

};
