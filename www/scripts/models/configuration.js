function ConfigurationModel(controller) {
	this.configuration = {};
	
	this.controller = controller;
    
	this.firstLogin = true;
    // initialize the configuration if it does not exist
//    this.createConfiguration();
    
}

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

ConfigurationModel.prototype.loadData = function() {
	var configObject;
	try {
		configObject = JSON.parse(localStorage.getItem("configuration"));
	} catch(err) {
        console.log("error! while loading");
	}
	
	if (!configObject) {
		configObject = {loginState: "loggedOut"};
	}
	
//	if (!configObject.loginState) { //if no configuration is available, a new one is created
//		configObject = this.createConfiguration();
//	}
	
	this.configuration = configObject;
    
};

ConfigurationModel.prototype.login = function(username, password, success, error) {
	this.configuration.loginState = "loggedIn";
    this.storeData();
    this.loadFromServer();
    success();
};

ConfigurationModel.prototype.logout = function() {
	this.configuration.loginState = "loggedOut";
    this.storeData();
};

ConfigurationModel.prototype.isLoggedIn = function() {
	return this.configuration.loginState == "loggedIn" ? true : false;
};

ConfigurationModel.prototype.getDisplayName = function() {
	return this.configuration.learnerInformation.displayName;
};

ConfigurationModel.prototype.getUserName = function() {
	return this.configuration.learnerInformation.userName;
};

ConfigurationModel.prototype.getUserId = function() {
	return this.configuration.learnerInformation.userId;
};

ConfigurationModel.prototype.getEmailAddress = function() {
	return this.configuration.learnerInformation.emailAddress;
};


ConfigurationModel.prototype.createConfiguration = function() {
	console.log("create configuration");
    
    if(!localStorage.configuration) {
		initConfiguration();
	}
	
    try {
		return JSON.parse(localStorage.getItem("configuration"));
	} catch(err) {
		return {};
	}
};

ConfigurationModel.prototype.loadFromServer = function() {

	var self = this;
	jQuery
			.getJSON(
					"http://yellowjacket.ethz.ch/ilias_4_2/restservice/learningcards/authentication.php/1.json", function(data) {
						console.log("success");
						console.log("JSON: " + data);
						var authenticationObject;
						try {
							authenticationObject = data; // JSON.parse(data);
							// controller.models["courses"].courseLoaded(data.courseID);
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
//						if (authenticationObject[0]) {
							console.log("Object: " + authenticationObject);
							authenticationObject.loginState = self.configuration.loginState;
							self.configuration = authenticationObject;
							self.storeData();
							
							$(document).trigger("authenticationready", authenticationObject.learnerInformation.userId);
							
							//						}
					});
};