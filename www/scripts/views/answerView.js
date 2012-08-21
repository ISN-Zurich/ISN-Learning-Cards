function AnswerView() {
	var self = this;

	self.tagID = 'cardAnswerView';
	
	self.widget = null;
	
	
	jester($('#doneButton')[0]).tap(function() {
		self.clickDoneButton();
	});
	jester($('#CourseList_FromAnswer')[0]).tap(function() {
		self.clickCourseListButton();
	});

	jester($('#cardAnswerTitle')[0]).tap(function() {
		self.clickTitleArea();
		console.log("answer title clicked");
	});
	jester($('#cardAnswerIcon')[0]).tap(function() {
		self.clickTitleArea();
		console.log("answer title clicked");
	});

}

AnswerView.prototype.handleTap = doNothing;
AnswerView.prototype.handlePinch = function() {
	controller.transitionToCourses();
};

AnswerView.prototype.handleSwipe = function() {

	// ask the model to select the next question
	// update the display for the current view

	controller.models["answers"].deleteData();
	
	controller.models['questionpool'].nextQuestion();
	controller.transitionToQuestion();
};

AnswerView.prototype.close = closeView;
AnswerView.prototype.openDiv = openView;
AnswerView.prototype.open = function() {

	this.showAnswerTitle();
	this.showAnswerBody();
	this.openDiv();

};

AnswerView.prototype.showAnswerBody = function() {
	// var currentAnswerBody = controller.models["questionpool"]
	// .getAnswer();
	// $("#cardAnswerBody").text(currentAnswerBody);

//	var self = this;
//	var questionpoolModel = controller.models['questionpool'];
//	questionpoolModel.resetAnswer();
//	var questionType = questionpoolModel.getQuestionType();
//	$("#cardAnswerBody").empty();
//
//	do {
//		// var courseID = courseModel.getId(); we might need to define a method
//		// getId() for the answers in the Answers Model
//
//		var li = $("<li/>", {
//			// "id": "answer" + answerID,
//			text : questionpoolModel.getAnswerChoice()
//		}).appendTo("#cardAnswerBody");
//		jester(li[0]).tap(function() {
//			if (questionType == "Multiple Choice Question") {
//				self.clickMultipleAnswerItem($(this));
//			} else {
//				self.clickSingleAnswerItem($(this));
//			}
//
//		});
//
//		var div = $("<div/>", {
//			"class" : "right listicon",
//			text : " "
//		});
//		li.prepend(div);
//
//		var i = $("<i/>", {
//		// "class": "icon-ok"
//		}).appendTo(div);
//
//		// i.css("display", "none");
//
//	} while (questionpoolModel.nextAnswerChoice());
	
	var questionpoolModel = controller.models['questionpool'];
	var questionType = questionpoolModel.getQuestionType();
	var interactive = true;
	switch (questionType) {
		case 'Single Choice Question': 
			this.widget = new SingleChoiceWidget(interactive);
			break;
		case 'Multiple Choice Question': 
			this.widget = new MultipleChoiceWidget(interactive);
			break;
	// ...
		default:
			break;
	}
	
	
};

AnswerView.prototype.clickSingleAnswerItem = function(clickedElement) {

	// to check if any other elemen is ticked and untick it
	clickedElement.parent().find("i").removeClass("icon-ok");
	clickedElement.find("i").toggleClass("icon-ok");
    
    
};

AnswerView.prototype.clickMultipleAnswerItem = function(clickedElement) {
	clickedElement.find("i").toggleClass("icon-ok");

};

AnswerView.prototype.showAnswerTitle = function() {
	var currentAnswerTitle = controller.models["questionpool"]
			.getQuestionType();
	$("#cardAnswerTitle").text(currentAnswerTitle);
};

AnswerView.prototype.clickDoneButton = function() {

	this.widget.storeAnswers();
	controller.transitionToFeedback();
	
//	var answers = this.widget.getTickedAnswers();
//	
//	this.tickedAnswers = [];
	
	
//	var answers = new Array();

//	$("#cardAnswerBody li").each(function(index) {
//		if ($(this).find("i").hasClass("icon-ok")) {
//			answers.push(index);
//		}
//	});

//	if (answers.length > 0) {
//
//		controller.models['answers'].setAnswers(answers);

//		controller.transitionToFeedback(); // in feedback view on the open we
											// will
		// define the loading for the feedback
		// of the specific current answer of the
		// specific current view. similar way
		// with questionbody and quesiton title
		// methods
//	}

};

AnswerView.prototype.clickCourseListButton = function() {

	controller.transitionToCourses();

};

AnswerView.prototype.clickTitleArea = function() {
	
	this.widget.storeAnswers();
	controller.transitionToQuestion();

};

// the following could replace the first lines with click..funtions etc.

// jester(element)
// .swipe(swipeHandler) // attach a handler to the element's swipe event
// .doubletap(dtHandler); // attach a handler to the element's doubletap event
/**
 * 
 */



