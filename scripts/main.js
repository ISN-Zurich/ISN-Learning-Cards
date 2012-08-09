$(document).ready(function() {

	$("#loading").show();
	
	initModels();
	
	if (localStorage.configuration) { // user was already connected to LMS
        configurationModel = JSON.parse(localStorage.configuration);	//take the configuration from the local storage
    }
	if (localStorage.courses) {
		courses = JSON.parse(localStorage.courses);
	}
	
	if (isOffline()) { // user is offline
		if (configurationModel.loginState == "loggedOut") {
			alert("Sorry, you need to be online to connect to your LMS");
		} else if (configurationModel.loginState == "loggedIn") {
			//work with data from local storage
			$("#courseList").show();
			$("#loginForm").hide();
			$("#splashScreen").hide();
			
			loadTransitions();
		}
	} else { // user is online
		if (configurationModel.loginState == "loggedOut") {
			loadTransitions();
			
			$("#loading").hide();
			$("#loginForm").show();
			
			
			
		} else if (configurationModel.loginState == "loggedIn") {
			loadTransitions();
			$("#courseList").show();
//			$("#loginForm").hide();
			$("#splashScreen").hide();		
			
			
		}
	}
	
});


//function init() {
//	console.log("0");
//	var config = null;
//	
//	console.log("1");
//
//	if (localStorage.configuration) { // user was already connected to LMS
//        console.log("1a");
//        config = JSON.parse(localStorage.configuration);	//take the configuration from the local storage
//    } else {
//        console.log("1b");
//		config = configurationModel;	//create new configuration
//	}
//	
//	console.log("2");
//
//	if (isOffline()) { // user is offline
//		console.log("3a");
//		if (config.loginState == "loggedOut") {
//			console.log("Sorry, you need to be online to connect to your LMS");
//		} else if (config.loginState == "loggedIn") {
//			//work with data from local storage
//			config.loginState = "loggedOut";
//		}
//	} else { // user is online
//		console.log("3b");
//        console.log(config.loginState);
//		if (config.loginState == "loggedOut") {
//			// show login
//			console.log("login");
//			config.loginState = "loggedIn";
//		} else if (config.loginState == "loggedIn") {
//			// synchronize data
//			console.log("logout");
//			config.loginState = "loggedOut";
//		}
//	}
//	
//	console.log("4");
//	
//	localStorage.configuration = JSON.stringify(config);
//
//	console.log("5");
//	
//}