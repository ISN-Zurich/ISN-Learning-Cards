//***********************************************************NUMERIC CHOICE WIDGET**********************************************************************************
//The Multiple choice widget has two views, an answer and a feedback view.



//********************************************************** CONSTRUCTOR *******************************************************

function NumericQuestionWidget(interactive) {
	var self = this;

	self.tickedAnswers = controller.models["answers"].getAnswers(); // a list with the typed answer

	self.interactive = interactive;
	this.didApologize = false; // a flag tracking when questions with no data are loaded and an error message is displayed on the screen
	//Check the boolean value of intractive. This is set through the answer and feedback view.
	if (self.interactive) { 
		// when answer view is active, then interactive variable is set to true. 
		self.showAnswer(); //displays the answer body of the multiple choice widget
		console.log("interactive true");
	} else {
		//when feedback view is active, then interactive is set to false. 
		console.log("interactive false");
		self.showFeedback(); //displays the feedback body of the multiple choice widget
	}
} // end of consructor


//**********************************************************METHODS***************************************


//Creation of answer body for numeric questions. It contains a input field.


NumericQuestionWidget.prototype.showAnswer = function() {

	var self = this;
	
	var questionpoolModel = controller.models['questionpool'];
		$("#cardAnswerBody").empty();

		// Check if there is a question pool and if there are answers for a specific question in order to display the answer body
		if (questionpoolModel.questionList && questionpoolModel.getAnswer()) {
		console.log("entered numeric answer body");

		var div = $("<div/>", {
			"id": "numberInputContainer",
			"class": "inputBorder"
		}).appendTo("#cardAnswerBody");
		
		var input = $("<input/>", {
			"id" : "numberInput",
			"class" : "loginInput",
			"type" : "number",
			"value": self.tickedAnswers.length != 0 ? self.tickedAnswers : "",
			"placeholder": "Enter number here"
		}).appendTo(div);
		
		
		$("#numberInput")[0].addEventListener("blur", function() {setButtonHeight();});
//		$("#numberInput")[0].focus();
		
	} else {
		//if there are no data for a question or there is no questionpool then display the error message
		this.didApologize = true;
		doApologize();
	}

};

//Creation of feedback body for numeric questions. It contains one or two input fields, based on the answer results

NumericQuestionWidget.prototype.showFeedback = function() {
	console.log("start show feedback in numeric choice");


	$("#feedbackBody").empty();
	$("#feedbackTip").empty();
	
	$("#numberInput").blur();
	
	var questionpoolModel = controller.models["questionpool"];
	var answerModel = controller.models["answers"];
	var typedAnswer = answerModel.getAnswers();
	var correctAnswer = questionpoolModel.getAnswer()[0];
	var currentFeedbackTitle = controller.models["answers"].getAnswerResults();


	var div = $("<div/>", {
		"id": "typedAnswer",
		"class": "inputBorder",
		text: typedAnswer
	}).appendTo("#feedbackBody");
	
	
	if (currentFeedbackTitle == "Excellent") {

		$("#typedAnswer").addClass("correctAnswer");
		
		var correctText = questionpoolModel.getCorrectFeedback();
		if (correctText.length > 0) {
			$("#FeedbackMore").show();
			$("#feedbackTip").text(correctText);
		} else {
			$("#FeedbackMore").hide();
		}
	} else { // current feedback title is wrong
		console.log('handle answer results');

		$("<div/>", {
			"id" : "numericFeedback",
			text : "the correct answer is"
		}).appendTo("#feedbackBody");

		$("<div/>", {
			"id" : "correctNumericFeedback",
			"class" : "inputBorder correctAnswer",
			text : correctAnswer
		}).appendTo("#feedbackBody");

		var wrongText = questionpoolModel.getWrongFeedback();
		console.log("XX " + wrongText);
		if (wrongText && wrongText.length > 0) {
			$("#FeedbackMore").show();
			$("#feedbackTip").text(wrongText);
		} else {
			$("#FeedbackMore").hide();
		}

	}

};

NumericQuestionWidget.prototype.storeAnswers = function() {

	var questionpoolModel = controller.models["questionpool"];

	var numericAnswer = $("#numberInput").val();

	controller.models["answers"].setAnswers(numericAnswer);
};

NumericQuestionWidget.prototype.clickDoneButton = function() {

	var questionpoolModel = controller.models['questionpool'];

	if (questionpoolModel.getAnswer()) {

		this.widget.storeAnswers();
		questionpoolModel.queueCurrentQuestion();
		controller.transitionToFeedback();
	} else {

		questionpoolModel.nextQuestion();
		controller.transitionToQuestion();

	}

};

console.log("end of numeric choice widget");
