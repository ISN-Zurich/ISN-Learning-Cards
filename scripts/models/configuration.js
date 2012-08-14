function ConfigurationModel() {
	this.configuration = {};
}

ConfigurationModel.prototype.storeData = function() {
	var configString;
	try {
		configString = JSON.stringify(this.configuration);
	} catch (err) {
		configString = "";
	}
	localStorage.setItem("configuration", configString);
};

ConfigurationModel.prototype.loadData = function() {
	var configObject;
	try {
		configObject = JSON.parse(localStorage.getItem("configuration"));
	} catch(err) {
		configObject = {};
	}
	this.configuration = configObject;
};

ConfigurationModel.prototype.login = function(username, password, success, error) {
	this.configuration.loginState = "loggedIn";
	success();
};

ConfigurationModel.prototype.logout = function() {
	this.configuration.loginState = "loggedOut";
};

ConfigurationModel.prototype.isLoggedIn = function() {
	return this.configuration.loginState == "loggedIn";
};



//function ConfigurationModel() {
//this.appId = "";
//this.appAuthenticationKey = "";
//this.userAuthenticationKey = "";
//this.urlToLMS = "";
//this.learnerInformation = {
//		userId : "",
//		userName : "",
//		displayName : "",
//		emailAddress : ""
//	};
//this.loginState = "loggedOut";
//this.globalSynchronizationState = "";
//}