function initModels() {
	
	if(!localStorage.configuration) {
		initConfiguration();
	}
	if(!localStorage.courses) {
		initCourses();
	}
	if(!localStorage.questionpool_1) {
		initQuPo1();
	}
	if(!localStorage.questionpool_2) {
		initQuPo2();
	}
	
}


function initConfiguration() {
	var configurationModel = {
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
	
	localStorage.configuration = JSON.stringify(configurationModel);
	
}

function initQuPo1() {
	var questionpool_1 = [
	                      {
	                    	  question: "Solve the equation! 1x1=?",
	                    	  answer: "1" 
	                      }, {
	                          question: "Solve the equation! 5x1=?",
	                       	  answer: "5"
	                      }
	                     ];
	
	localStorage.questionpool_1 = JSON.stringify(questionpool_1);
}

function initQuPo2() {
	var questionpool_2 = [
	                      {
	                    	  question: 'Choose the correct translation for the following word! "Car"',
	                    	  answer: "Auto" 
	                      }, {
	                          question: 'Choose the correct translation for the following word! "Apple"',
	                       	  answer: "Apfel"
	                      }
	                    ];
	
	localStorage.questionpool_2 = JSON.stringify(questionpool_2);
	
}
function initCourses() {
	var courseList = [
	                  {
	                	  id: "1",
	                	  title: "Math",
	                	  syncDateTime: "",
	                	  syncState: ""
	                  }, {
	                	  id: "2",
	                	  title: "German",
	                	  syncDateTime: "",
	                	  syncState: ""
	                  }
	                 ];
	
	localStorage.courses = JSON.stringify(courseList);
}

	
	
	
	
	
	
	
	
	
//	var question1 = new Question("Solve the equation! 1x1=?", "1",
//			"Congratulations! You picked the right answer!");
//
//	var question2 = new Question("Solve the equation! 5x1=?",
//			"5", "Well done!");
//
//	var question3 = new Question('Choose the correct translation for the following word! "Car"', "Auto",
//			"Congratulations!");
//
//	var question4 = new Question('Choose the correct translation for the following word! "Apple"', "Apfel",
//			"Well done!");
//
//	var questionpool1 = new Questionpool();
//	questionpool1.addQuestion(question1);
//	questionpool1.addQuestion(question2);
//
//	var questionpool2 = new Questionpool();
//	questionpool2.addQuestion(question3);
//	questionpool2.addQuestion(question4);
//
//	new Course("1", "Math", questionpool1);
//	new Course("2", "German", questionpool2);
	
