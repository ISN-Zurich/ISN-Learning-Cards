var controller;

document.addEventListener("deviceready", init, false);

function init() {
    controller = new Controller();
}


function start() {
	initModels();
    
	if (localStorage.configuration) { // user was already connected to LMS
		configurationModel = JSON.parse(localStorage.configuration); // take the configuration from
        // the local storage
		//alert(configurationModel.loginState);
	}
	// if (localStorage.courses) {
	// local = localStorage.courses;
	// alert(local);
	// courses = JSON.parse(localStorage.courses);
	// alert(courses.id);
	// }
    
	if (isOffline()) { // user is offline
		if (configurationModel.loginState == "loggedOut") {
			alert("Sorry, you need to be online to connect to your LMS");
		} else if (configurationModel.loginState == "loggedIn") { // work with
			// data from
			// local
			// storage
			$("#courseList").show();
			$("#loginForm").hide();
			$("#splashScreen").hide();
            
			loadTransitions();
		}
	} else { // user is online
		if (configurationModel.loginState == "loggedOut") {
			console.log("login start");
			
            if (!transitionsLoaded) {
                loadTransitions();
            }
            
			console.log("transitions loaded");
            
			$("#loading").hide();
			$("#loginForm").show();
            
			console.log("login end");
		} else if (configurationModel.loginState == "loggedIn") {
			createCourseList();
            
			if (!transitionsLoaded) {
                loadTransitions();
            }
            
			
			$("#coursesListView").show();
			$("#loginForm").hide();
			$("#splashScreen").hide();
            
		}
	}
    
}