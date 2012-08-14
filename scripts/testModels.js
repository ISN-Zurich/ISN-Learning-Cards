function initModels() {
	
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
	
	var questionpool_1 = [
	                      {
	                    	  question: "Solve the equation! 1x1=?",
	                    	  answer: "1" 
	                      }, {
	                          question: "Solve the equation! 5x1=?",
	                       	  answer: "5"
	                      }
	                     ];
	
	var questionpool_2 = [
	                      {
	                    	  question: 'Choose the correct translation for the following word! "Car"',
	                    	  answer: "Auto" 
	                      }, {
	                          question: 'Choose the correct translation for the following word! "Apple"',
	                       	  answer: "Apfel"
	                      }
	                    ];
	
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
	
	localStorage.configuration = JSON.stringify(configurationModel);
	localStorage.questionpool_1 = JSON.stringify(questionpool_1);
	localStorage.questionpool_2 = JSON.stringify(questionpool_2);
	localStorage.courses = JSON.stringify(courseList);
	
	
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
	
}