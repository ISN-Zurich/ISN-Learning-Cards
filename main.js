function init() {
	var connectionState = new ConnectionState();
	var config = null;
	var statistics = null;

	if (localStorage.configuration) { // user was already connected to LMS
		config = JSON.parse(localStorage.configuration);	//take the configuration from the local storage
	} else {
		config = {				//create a new configuration
			appId : "",
			appAuthenticationKey : "",
			userAuthenticationKey : "",
			urlToLMS : "",
			learnerInformation : {
				userId : "",
				userName : "",
				displayName : "",
				emailAddress : ""
			},
			loginState : "loggedOut",
			globalSynchronizationState : ""
		};
	}
	
	if (localStorage.statistics) { // statistics already exist
		config = JSON.parse(localStorage.statistics);	//take the statistics from the local storage
	} else {
		statistics = {				//create new statistics
		};
	}

	if (connectionState.isOffline()) { // user is offline
		if (config.loginState == "loggedOut") {
			alert("Sorry, you need to be online to connect to your LMS");
		} else if (config.loginState == "loggedIn") {
			//work with data from local storage
		}
	} else { // user is online
		if (config.loginState == "loggedOut") {
			// show login
		} else if (config.loginState == "loggedIn") {
			// synchronize data
		}
	}

}