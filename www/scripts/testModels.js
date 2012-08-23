function initModels() {

	if (!localStorage.configuration) {
		initConfiguration();
	}
	if (!localStorage.courses) {
		initCourses();
	}
	// if(!localStorage.questionpool_1) {
	initQuPo1();
	// }
	//if (!localStorage.questionpool_2) {
		initQuPo2();
//	}

}

function initConfiguration() {
	var configurationModel = {
		appId : "",
		appAuthenticationKey : "",
		userAuthenticationKey : "",
		urlToLMS : "",
		learnerInformation : {
			userId : "123",
			userName : "Test",
			displayName : "Test Test",
			emailAddress : "testjcdak"
		},
		loginState : "loggedOut",
		globalSynchronizationState : ""
	};

	localStorage.configuration = JSON.stringify(configurationModel);

}

function initQuPo1() {
	var questionpool_1 = [
			{
				type : "Single Choice Question",
				question : "1 - Choose the correct answer taking into account..Choose the correct answer taking into account..",
				answer : [ {
					text : "answer1",
					score : "0"

				},

				{
					text : "answer2",
					score : "1"

				},

				{
					text : "answer3",
					score : "0"

				}, {
					text : "answer1iiiiiiiiiiiiiiiiiiiiiiiiiiiii",
					score : "0"

				}

				],
				correctFeedback : "Excellent", // it is the body of the
				// feedback view if the answer
				// is correct, the feedback
				// title wlll be calculated
				// based on the
				errorFeedback : "In order to asnwer this question better you should also take into account the impact of.."

			},

			{
				type : "Single Choice Question",
				question : "2 - Choose the correct answer taking into account..Choose the correct answer taking into account..",
				answer : [ {
					text : "answer1",
					score : "0"

				},

				{
					text : "answer2",
					score : "1"

				},

				{
					text : "answer3",
					score : "0"

				}, {
					text : "answer1iiiiiiiiiiiiiiiiiiiiiiiiiiiii",
					score : "0"

				}

				],
				correctFeedback : "Excellent", // it is the body of the
				// feedback view if the answer
				// is correct, the feedback
				// title wlll be calculated
				// based on the
				errorFeedback : "In order to asnwer this question better you should also take into account the impact of.."

			},

			{
				type : "Multiple Choice Question",
				question : "3 - How could an organization contribute to ..after weighing the pros and cos",
				answer : [ {
					text : "by lending money",
					score : "0"

				},

				{
					text : "by developing a new business model",
					score : "1"

				},

				{
					text : "by collaborating with",
					score : "1"

				}

				],

				correctFeedback : "",
				errorFeedback : "In order to asnwer this question better you should also take into account the impact of.."

			},
			{
				type : "Multiple Choice Question",
				question : "4 - What would you choose...",
				answer : [ {
					text : "uni",
					score : "0"

				},

				{
					text : "market",
					score : "1"

				},

				{
					text : "any other",
					score : "1"

				},

				{
					text : "institution",
					score : "1"

				},

				{
					text : "non for profit organisation",
					score : "1"

				}

				],

				correctFeedback : "",
				errorFeedback : "In order to asnwer this question better you should also take into account the impact of.."

			},

			{
				type : "Single Choice Question",
				question : "5 - Choose the correct answer taking into account..Choose the correct answer taking into account..",
				answer : [ {
					text : "answer1",
					score : "0"

				},

				{
					text : "answer2",
					score : "1"

				},

				{
					text : "answer3",
					score : "0"

				}, {
					text : "answer1iiiiiiiiiiiiiiiiiiiiiiiiiiiii",
					score : "0"

				}

				],
				correctFeedback : "Excellent", // it is the body of the
				// feedback view if the answer
				// is correct, the feedback
				// title wlll be calculated
				// based on the
				errorFeedback : "In order to asnwer this question better you should also take into account the impact of.."

			}, {
				type : "Multiple Choice Question",
				question : "6 - How could an organization contribute to ..after weighing the pros and cos",
				answer : [ {
					text : "by lending money",
					score : "0"

				},

				{
					text : "by developing a new business model",
					score : "1"

				},

				{
					text : "by collaborating with",
					score : "1"

				}

				],

				correctFeedback : "",
				errorFeedback : "In order to asnwer this question better you should also take into account the impact of.."

			},
			{
				type : "Numeric Question",
				question : '9 - What is the number',
				answer : "45",
				correctFeedback : "",
				errorFeedback : "In order to asnwer this question better you should also take into account the impact of.."

			},
			{
				type : "Numeric Question",
				question : '20 - testing question',
				answer : "",
				correctFeedback : "",
				errorFeedback : "In order to asnwer this question better you should also take into account the impact of.."

			},
			
			{
				type : "Single Choice Question",
				question : '21 - testing question 2',
				answer : [
				         {
				        	 text:"",
				        	 score:"1"
				         }, {
				        	 
				        	 text:"",
				        	 score:"0"
				         }
				          
				          ],
				correctFeedback : "",
				errorFeedback : "In order to asnwer this question better you should also take into account the impact of.."

			},
			{
				type : "Multiple Choice Question",
				question : "7 - What would you choose...",
				answer : [ {
					text : "uni",
					score : "0"

				},

				{
					text : "market",
					score : "1"

				},

				{
					text : "any other",
					score : "1"

				},

				{
					text : "institution",
					score : "1"

				},

				{
					text : "non for profit organisation",
					score : "1"

				}

				],

				correctFeedback : "",
				errorFeedback : "In order to asnwer this question better you should also take into account the impact of.."

			} ];

	localStorage.questionpool_1 = JSON.stringify(questionpool_1);
}

function initQuPo2() {
	var questionpool_2 = [
			{
				type : "Numeric Question",
				question : '1 - What is the number',
				answer : "45",
				correctFeedback : "",
				errorFeedback : "In order to asnwer this question better you should also take into account the impact of.."

			},
			{
				type : "Numeric Question",
				question : '2 - How many times..',
				answer : "21",
				correctFeedback : "This is the correct feedback of this answer",
				errorFeedback : " "

			} ];

	localStorage.questionpool_2 = JSON.stringify(questionpool_2);

}
function initCourses() {
	var courseList = [ {
		id : "1",
		title : "Math",
		syncDateTime : "",
		syncState : "",
		isLoaded : true
	}, {
		id : "2",
		title : "German",
		syncDateTime : "",
		syncState : "",
		isLoaded : true
	} ];

	localStorage.courses = JSON.stringify(courseList);
}

// var question1 = new Question("Solve the equation! 1x1=?", "1",
// "Congratulations! You picked the right answer!");
//
// var question2 = new Question("Solve the equation! 5x1=?",
// "5", "Well done!");
//
// var question3 = new Question('Choose the correct translation for the
// following word! "Car"', "Auto",
// "Congratulations!");
//
// var question4 = new Question('Choose the correct translation for the
// following word! "Apple"', "Apfel",
// "Well done!");
//
// var questionpool1 = new Questionpool();
// questionpool1.addQuestion(question1);
// questionpool1.addQuestion(question2);
//
// var questionpool2 = new Questionpool();
// questionpool2.addQuestion(question3);
// questionpool2.addQuestion(question4);
//
// new Course("1", "Math", questionpool1);
// new Course("2", "German", questionpool2);

