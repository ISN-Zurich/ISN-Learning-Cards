var controller;

document.addEventListener("deviceready", init, false);

function init() {
    
    //initModels();
    
	//$("#splashScreen").show();
	//$("#loading").show();
    controller = new Controller();
    
	//setTimeout("start()", 1000);
	// start();
}

function testli() {};
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

// function coursesArrayToString() {
// var s = '{"numCourses":"' + courses.length + '","';
// for (var i in courses) {
// s += 'course' + i + '":{"id":"' + courses[i].getId() + '","title":"' +
// courses[i].getTitle() + '","synchDateTime":"' +
// course[i].getSynchDateTime() + '","synchState'
// }
//
// }

// [ {
// "id" : "1",
// "title" : "Course1",
// "questionpool" : {
// "i" : 0,
// "questions" : [ {
// "question" : "This is the question?",
// "answer" : "Pick this answer",
// "feedback" : "Congratulations!You picked the right answer!"
// }, {
// "question" : "This is also a question?",
// "answer" : "Choose this answer",
// "feedback" : "Well done!"
// } ],
// "currentQuestion" : "",
// "answer" : "",
// "feedback" : ""
// }
// }, {
// "id" : "2",
// "title" : "Course2",
// "questionpool" : {
// "i" : 0,
// "questions" : [ {
// "question" : "Choose an answer!",
// "answer" : "Answer",
// "feedback" : "Congratulations!"
// }, {
// "question" : "Again, choose an answer!",
// "answer" : "Answer",
// "feedback" : "Well done!"
// } ],
// "currentQuestion" : "",
// "answer" : "",
// "feedback" : ""
// }
// } ]

// function init() {
// console.log("0");
// var config = null;
//
// console.log("1");
//
// if (localStorage.configuration) { // user was already connected to LMS
// console.log("1a");
// config = JSON.parse(localStorage.configuration); //take the configuration
// from the local storage
// } else {
// console.log("1b");
// config = configurationModel; //create new configuration
// }
//
// console.log("2");
//
// if (isOffline()) { // user is offline
// console.log("3a");
// if (config.loginState == "loggedOut") {
// console.log("Sorry, you need to be online to connect to your LMS");
// } else if (config.loginState == "loggedIn") {
// //work with data from local storage
// config.loginState = "loggedOut";
// }
// } else { // user is online
// console.log("3b");
// console.log(config.loginState);
// if (config.loginState == "loggedOut") {
// // show login
// console.log("login");
// config.loginState = "loggedIn";
// } else if (config.loginState == "loggedIn") {
// // synchronize data
// console.log("logout");
// config.loginState = "loggedOut";
// }
// }
//
// console.log("4");
//
// localStorage.configuration = JSON.stringify(config);
//
// console.log("5");
//	
// }
