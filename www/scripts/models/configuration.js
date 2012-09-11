/**
 * This model holds the data about the current configuration
 */
function ConfigurationModel(controller) {
	this.configuration = {};

	this.controller = controller;
	
	this.loadData();
	
	clientKey = this.configuration.appAuthenticationKey;
	//this.clientKey = localStorage.getItem("ClientKey");
	if ( !this.clientKey || 
		 !this.clientKey.length) {
		this.register();
	}
	else {
		this.loadFromServer();
	}
	// initialize the configuration if it does not exist
	// this.createConfiguration();

}

/**
 * stores the data into the local storage (key = "configuration") 
 * therefor the json object is converted into a string
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
};

/**
 * loads the data from the local storage (key = "configuration") 
 * therefor the string is converted into a json object
 */
ConfigurationModel.prototype.loadData = function() {
	var configObject;
	try {
		configObject = JSON.parse(localStorage.getItem("configuration"));
	} catch (err) {
		console.log("error! while loading");
	}

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
 * loads the configuration data from the server and stores it in the local storage
 * when all data is loaded, the authenticationready event is triggered
 */
ConfigurationModel.prototype.loadFromServer = function() {
    // FIXME: Only authenticate if the client key is present
	var self = this;
	jQuery
			.getJSON(
					"http://yellowjacket.ethz.ch/ilias_4_2/restservice/learningcards/authentication.php/1.json",
					function(data) {
						console.log("success");
						console.log("JSON: " + data);
						var authenticationObject;
						try {
							authenticationObject = data;
							console.log("authenticationData from server");
						} catch (err) {
							console.log("Error: Couldn't parse JSON for authentication");
							authenticationObject = {};
						}

						// if (!questionPoolObject[0]) { // if no courses are
						// available, new ones are created
						// console.log("no questionpool loaded");
						// questionPoolObject = self.createPool(data.courseID);
						// }

						console.log("Object: " + authenticationObject);
						authenticationObject.loginState = self.configuration.loginState;
						self.configuration = authenticationObject;
						self.storeData();

						$(document).trigger("authenticationready",
								authenticationObject.learnerInformation.userId);

					});
};

/**
 * TODO: should send authentication data to the server?
 */
ConfigurationModel.prototype.login = function(username, password, success,
		error) {
	this.configuration.loginState = "loggedIn";
	this.storeData();
	this.loadFromServer();
	success();
};

/**
 * TODO: should delete all data?
 */
ConfigurationModel.prototype.logout = function() {
	this.configuration.loginState = "loggedOut";
	this.storeData();
};

/**
 * @return true if user is logged in, otherwise false
 */
ConfigurationModel.prototype.isLoggedIn = function() {
	return this.configuration.loginState == "loggedIn" ? true : false;
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

//it is called whenver my client(app) key is empty
ConfigurationModel.prototype.register = function() {
	var appID = "ch.ethz.isn.learningcards";
	var deviceID =  device.uuid;
	
	

		$.ajax({
			url : 'http://yellowjacket.ethz.ch/ilias_4_2/restservice/learningcards/registration.php',
			type : 'GET',
			dataType : 'json',
			success : appRegistration,
			error: function() { console.log("Error while registering the app with the backend"); },
			beforeSend : setHeaders
		});
	
		
	function setHeaders(xhr) {
			xhr.setRequestHeader('AppID', appID);
			xhr.setRequestHeader('UUID', deviceID);
			console.log("uuid:" +deviceID);
	
	}
	
	
	function appRegistration(data){
		//localStorage.setItem(data.ClientKey);
		this.configuration.appAuthenticationKey = data.ClientKey;
		this.storeData();
		// we can now savely load the user data
		this.loadFromServer();
	}
	
	
	
	
	
};
