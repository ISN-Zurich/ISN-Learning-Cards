/*jslint vars: true, sloppy: true */

function AuthServiceModel(controller){
	var self=this;
	this.controller = controller;
	var featuredContent_id = FEATURED_CONTENT_ID;
	//initialization of model's variables
	this.configuration = {};
	this.urlToLMS = "";
	this.logoimage = "";
	this.logolabel = "";
		
	// load data from the local storage if any
	this.loadData();
	
	
	/**It is triggered after all statistics data are sent successful to the server. This happens when the user logsout.
	 * @event statisticssenttoserver
	 * @param:a callback function that sends pending data to the server and clears all information from the local storage.
	 * Only the application key remains in the local storage, because it is unique for a specific device for a specific application.
	* 
	* FIXME:
	* Take care that the session key and the server are stored with the pending information so we can send the data 
	* with the correct context to the backend i.e. if you have pening information and you login to a different server
	* then the pending information should be sent to the original server for the original user and not
	* to the new server and the new user. 
	*/

	$(document).bind("statisticssenttoserver", function() {
		moblerlog("statistics sent to server is binded");
		moblerlog("self.controller.appLoaded is "+self.controller.appLoaded);
		moblerlog("self.configuration.loginState is"+self.configuration.loginState);
		if (self.controller.appLoaded && self.configuration.loginState === "loggedOut") {
			moblerlog("before call sendLogoutToServer");
		self.sendLogoutToServer();
		moblerlog("user logged out");
		}
	});
	
}

/**
 * Stores the data into the local storage (key = "configuration") therefore the
 * json object is converted into a string
 * @prototype
 * @function storeData
 */
AuthServiceModel.prototype.storeData = function() {
	var configString;
	try {
		configString = JSON.stringify(this.configuration);
	} catch (err) {
		configString = "";
		moblerlog("error while storing");
	}
	moblerlog(configString);
	localStorage.setItem("configuration", configString);
	moblerlog("Configuration Storage after storeData: "+ localStorage.getItem("configuration"));
};


/**
 * Loads the data from the local storage (key = "configuration") therefore the
 * string is converted into a json object
 * @prototype
 * @function 
 */
AuthServiceModel.prototype.loadData = function() {
	var configObject;
	//if there is an item in the local storage with the name "configuration"
	//then get it by parsing the string and convert it into a json object
	try {
		configObject = JSON.parse(localStorage.getItem("configuration"));
	} catch (err) {
		moblerlog("error! while loading");
	}

	moblerlog("configObject: " + JSON.stringify(configObject));
	
	// when the app is launched and before the user logs in there is no local storage 
	// in this case there is no configuration object and it is stated in one of its properties
	// that its login status is set to "loggedOut".
	if (!configObject) {
		configObject = {
			loginState : "loggedOut",
			statisticsLoaded: "false"
		};
	}
	
 	this.configuration = configObject;
 	moblerlog("configuration login state in load data " +this.configuration.loginState);

};



