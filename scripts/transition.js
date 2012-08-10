function createCourseList() {
	for (var c in courses) {
		$("#list").append(
				"<li class='listItem' id='course" + courses[c].getId() + "'>" + courses[c].getTitle()
						+ "</li>");
		
		// from course list view to card question view by tapping on a
		// list item
		jester($("#course" + courses[c].getId())[0]).tap(function() {
			currentCourse = getCourse($(this).attr('id').substring(6));
			currentCourse.nextQuestion();
			$("#cardQuestion p").text(currentCourse.getCurrentQuestion());
			$("#cardQuestion").show();
			$("#courseList").hide();
			$("#splashScreen").hide();

		});
		
	}
}

function loadTransitions() {

	// //from splash screen to login by tapping
	//  
	// jester($("#splashScreen")[0]).tap(function(){
	// $("#loading").toggle();
	// $("#loginForm").toggle();
	// });

	// from login view to course list by tapping on the login button
	jester($("#loginButton")[0]).tap(
			function() {
				configurationModel.loginState = "loggedIn";
				localStorage.configuration = JSON.stringify(configurationModel);
				localStorage.courses = JSON.stringify(courses);
				
				createCourseList();
				
				$("#courseList").show();
				$("#loginForm").hide();
				$("#splashScreen").hide();
			});
	
	// from course list view to settings view by swiping (it should be
	// done by pinching)
	jester($("#list")[0]).swipe(function() {
		$("#settings").show();
		$("#courseList").hide();
		$("#splashScreen").hide();

	});
	
	// from course list view to settings view by button (it should be
	// done by pinching)
	jester($("#btnToSettings")[0]).tap(function() {
		$("#settings").show();
		$("#courseList").hide();
		$("#splashScreen").hide();

	});

	// from settings to course list by taping on the close button
	jester($("#closeSettings")[0]).tap(function() {
		$("#settings").hide();
		$("#courseList").toggle();
		$("#splashScreen").hide();

	});

	// from settings to course list by swipping (it should be done by
	// stretching)
	jester($("#settings")[0]).swipe(function() {
		$("#settings").hide();
		$("#courseList").toggle();
		$("#splashScreen").hide();

	});

	// from settings to confirmation screen by clicking on the logout
	// button, the same result sould be obtained by pinching)
	jester($("#logOutSettings")[0]).tap(function() {
		$("#settings").hide();
		$("#logoutConfirmation").toggle();
		$("#splashScreen").hide();

	});

	// from logouts confirmation screen to settings by swiping. the same
	// result should be obtained by pinching and stretching
	jester($("#logoutConfirmation")[0]).swipe(function() {
		$("#logoutConfirmation").hide();
		$("#settings").show();
		$("#splashScreen").hide();

	});

	// from logout confirmation screen to splash screen by taping on the
	// logout button (the final one)
	jester($("#logOut")[0]).tap(function() {
		$("#logoutConfirmation").hide();
		//$("#splashScreen").show();
		//$("#loading").show();
		configurationModel.loginState = "loggedOut";
		console.log("before storing");
		localStorage.configuration = JSON.stringify(configurationModel);
		localStorage.courses = JSON.stringify(courses);
		console.log("after storing");
		window.close();

	});

	// from card question view 1 to next one by swiping (in the future
	// to implement this by an algorithm ..based on the weight of each
	// learning card

	jester($("#cardQuestion")[0]).swipe(function() {
//		$("#cardQuestion1").hide();
//		$("#cardQuestion2").toggle();
//		$("#splashScreen").hide();
		currentCourse.nextQuestion();
		$("#cardQuestion p").text(currentCourse.getCurrentQuestion());

	});

	// from card question view to answer view by tapping anywhere on the
	// screen
	jester($("#cardQuestion")[0]).tap(function() {
		$("#cardQuestion").hide();
		$("#cardAnswer").text(currentCourse.getAnswer());
		$("#cardAnswer").show();
//		$("#splashScreen").hide();

	});

	// from card question view to course list by tapping on the course
	// list view button. It should be done by pinching
	jester($("#CourseList_FromQuestion")[0]).tap(function() {
		$("#cardQuestion").hide();
		$("#cardAnswer").hide();
		$("#courseList").show();
//		$("#cardQuestion1").hide();
//		$("#courseList").toggle();
//		$("#splashScreen").hide();

	});

	jester($("#cardAnswer")[0]).swipe(function() {
		$("#cardAnswer").hide();
		currentCourse.nextQuestion();
		$("#cardQuestion p").text(currentCourse.getCurrentQuestion());
		$("#cardQuestion").show();
//		$("#splashScreen").hide();

	});

	// from card answer view to question view by tapping on the title
	// area of it
	jester($("#titleAnswer")[0]).tap(function() {
		$("#cardAnswer").hide();
		$("#cardQuestion").show();
//		$("#splashScreen").hide();

	});

	// tap on done button in answer view page so that to navigate to
	// feedback view
	jester($("#done")[0]).tap(function() {
		$("#cardAnswer").hide();
		$("#cardFeedback p").text(currentCourse.getFeedback());
		$("#cardFeedback").show();
//		$("#splashScreen").hide();

	});
	
	// tap anywhere in answer view page so that to navigate to
	// feedback view
	jester($("#cardAnswer")[0]).tap(function() {
		$("#cardAnswer").hide();
		$("#cardFeedback p").text(currentCourse.getFeedback());
		$("#cardFeedback").show();
//		$("#splashScreen").hide();

	});

	// to do the navigation from card answer view to course list view by
	// pinching

	// code

	// from feedback view to question view by swiping
	jester($("#cardFeedback")[0]).swipe(function() {
		console.log("Feedback swipe");
		$("#cardFeedback").hide();
		currentCourse.nextQuestion();
		$("#cardQuestion p").text(currentCourse.getCurrentQuestion());
		$("#cardQuestion").show();
//		$("#splashScreen").hide();

	});
	
	// from feedback view to question view by tap
	jester($("#cardFeedback")[0]).tap(function() {
		console.log("Feedback tap");
		$("#cardFeedback").hide();
		currentCourse.nextQuestion();
		$("#cardQuestion p").text(currentCourse.getCurrentQuestion());
		$("#cardQuestion").show();
//		$("#splashScreen").hide();

	});

	// to do the navigation from feedback view to course list view by
	// pinching

	
	
}