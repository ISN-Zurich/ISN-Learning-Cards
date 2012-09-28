//***********************************************************MULTIPLE CHOICE WIDGET**********************************************************************************
//The Multiple choice widget has two views, an answer and a feedback view.
//The anwer view contains a list with possible solutions and is highligted by selected answers of users.
//The feedback view contains the list with the possible solutions highlighted by both the correct answers and learner's ticked answers.
//Sometimes when available, the feedback view provides extra feedback information, both for correct and wrong feedback.





//********************************************************** CONSTRUCTOR *******************************************************

function MultipleChoiceWidget(interactive) {
	var self = this;

	self.tickedAnswers = controller.models["answers"].getAnswers(); // a list with the currently selected answers
	self.interactive = interactive;
	
	this.didApologize = false;  // a flag tracking when questions with no data are loaded and an error message is displayed on the screen
	
	
	//Check the boolean value of intractive. This is set through the answer and feedback view.
	if (self.interactive) { 
		self.showAnswer(); 
		console.log("interactive true");
	} else {
		console.log("interactive false");
		self.showFeedback(); //displays the feedback body of the multiple choice widget
	}
} // end of consructor


//**********************************************************METHODS***************************************

MultipleChoiceWidget.prototype.cleanup = doNothing;


// Creation of answer body for multiple choice questions. It contains a list with the possible solutions.

MultipleChoiceWidget.prototype.showAnswer = function() {
	var questionpoolModel = controller.models['questionpool'];

	$("#cardAnswerBody").empty();

	// Check if there is a question pool and if there are answers for a specific question in order to display the answer body
	if (questionpoolModel.questionList && questionpoolModel.getAnswer()[0].answertext) {
		var self = this;

		var questionpoolModel = controller.models["questionpool"];
		var answers = questionpoolModel.getAnswer(); //returns an array containing the possible answers

		var mixedAnswers;
		if (!questionpoolModel.currAnswersMixed()) {
			questionpoolModel.mixAnswers();
		}			
		mixedAnswers = questionpoolModel.getMixedAnswersArray();
		
		//creation of an unordered list to host the possible answers
		var ul = $("<ul/>", {
		}).appendTo("#cardAnswerBody");

		
		for ( var c = 0; c < mixedAnswers.length; c++) {
			// when an answer item is clicked a highlighted background color is
			// applied to it via "ticked" class
			var li = $(
					"<li/>",
					{
						"id" : "answer" + mixedAnswers[c],
						"class" : (self.tickedAnswers.indexOf(mixedAnswers[c]) != -1 ? " ticked" : ""),
					}).appendTo(ul);
			// handler when taping on an item on the answer list
			jester(li[0]).tap(function() {
				self.clickMultipleAnswerItem($(this));
			});
			// displays the text value for each answer item on the single choice
			// list
			var div = $("<div/>", {
				"class" : "text",
				text : answers[mixedAnswers[c]].answertext
			}).appendTo(li);
		}

	} else {
		//if there are no data for a question or there is no questionpool then display the error message
		this.didApologize = true; 
		doApologize();
	}
};


//Creation of feedback body for multiple choice questions. It contains the list with the possible solutions highlighted by both the correct answers and learner's ticked answers


MultipleChoiceWidget.prototype.showFeedback = function() {
	console.log("start show feedback in multiple choice");
	
	$("#feedbackBody").empty();
	$("#feedbackTip").empty();

	var clone = $("#cardAnswerBody ul").clone(); // clone the answerbody, 
	clone.appendTo("#feedbackBody"); 

	var questionpoolModel = controller.models["questionpool"];
	$("#feedbackBody ul li").each(function() {
		var index = parseInt($(this).attr('id').substring(6));
		if (questionpoolModel.getScore(index) > 0) {
			var div = $("<div/>", {
				"class" : "right correctAnswer icon-checkmark" //applies a green tick to the correct question
			}).prependTo(this);
		}
	});

	// Handling the display of more tips/info about the feedback
	var currentFeedbackTitle = controller.models["answers"].getAnswerResults(); //returns excellent or wrong based on the answer resutls for a specific question type
	if (currentFeedbackTitle == "Excellent") {
		var correctText = questionpoolModel.getCorrectFeedback(); //gets correct feedback text 
		if (correctText.length > 0) {
			// when extra feedback info is available then display display it
			$("#FeedbackMore").show();
			$("#feedbackTip").text(correctText);
		} else {
			//if no extra feedback information is available then hide the tip button
			$("#FeedbackMore").hide();
		}
	} else { //if the answer results are wrong
		console.log('handle answer results');
		var wrongText = questionpoolModel.getWrongFeedback(); //gets wrong feedback text 
		console.log("XX " + wrongText);
		if (wrongText && wrongText.length > 0) {
			// when extra feedback info is available 
			$("#FeedbackMore").show();
			$("#feedbackTip").text(wrongText);
		} else {
			//if no extra feedback information is available 
			$("#FeedbackMore").hide();
		}

	}
};

//Handling behavior when click on the an item of the multiple answers list
MultipleChoiceWidget.prototype.clickMultipleAnswerItem = function(
		clickedElement) {
	// the ticked item is highlighted with a background color or unhighlighted, depending its previous state
	clickedElement.toggleClass("ticked"); 
};

//Storing the ticked answers in an array
MultipleChoiceWidget.prototype.storeAnswers = function() {
	var answers = new Array();
	var questionpoolModel = controller.models["questionpool"];

	$("#cardAnswerBody li").each(function(index) {
		if ($(this).hasClass("ticked")) {
			var tickedIndex = parseInt($(this).attr('id').substring(6));
			answers.push(tickedIndex);
		}
	});

	controller.models["answers"].setAnswers(answers);
};

/**
 * caculates the answer score
 */
MultipleChoiceWidget.prototype.calculateAnswerScore = function() {
	controller.models["answers"].calculateMultipleChoiceScore();
};

/**
 * sets the height property of the list items that contain correct answers
 */
MultipleChoiceWidget.prototype.setCorrectAnswerTickHeight = function() {
	$("#feedbackBody ul li").each(function() {
		height = $(this).height();
		$(this).find(".correctAnswer").height(height);
		$(this).find(".correctAnswer").css("line-height", height + "px");
	});
};

console.log("end of mulitple choice widget");