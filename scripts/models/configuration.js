function ConfigurationModel() {
	this.configuration = {};
    this.loadData();
    
    console.log(this.configuration.learnerInformation.userName);
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
		configObject = {};
        console.log("error! while loading");
	}
	this.configuration = configObject;
    
    console.log(this.configuration ? "have data" : "no data" );
    console.log(this.configuration.loginState);
};

ConfigurationModel.prototype.login = function(username, password, success, error) {
	this.configuration.loginState = "loggedIn";
    this.storeData();
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

ConfigurationModel.prototype.getEmailAddress = function() {
	return this.configuration.learnerInformation.emailAddress;
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