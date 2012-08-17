function AnswerView() {
    var self = this;
    
    self.tagID = 'cardAnswerView';
    jester($('#doneButton')[0]).tap(function(){ self.clickDoneButton(); } );
    jester($('#CourseList_FromAnswer')[0]).tap(function(){ self.clickCourseListButton(); } );

    jester($('#cardAnswerTitle')[0]).tap(function(){ self.clickTitleArea(); console.log("answer title clicked");} );
    
} 



AnswerView.prototype.handleTap = doNothing;
AnswerView.prototype.handlePinch = function() {
    controller.transitionToCourses();
};

AnswerView.prototype.handleSwipe = function() {
    
	// ask the model to select the next question
	// update the display for the current view
    
	controller.models['questionpool'].nextQuestion();
	this.showQuestionBody();
	this.showQuestionTitle();
};




AnswerView.prototype.close = closeView;
AnswerView.prototype.openDiv = openView;
AnswerView.prototype.open = function() {

	this.showAnswerTitle();
	this.showAnswerBody();
	this.openDiv();

};

AnswerView.prototype.showAnswerBody = function() {
//	var currentAnswerBody = controller.models["questionpool"]
//			.getAnswer();
//	$("#cardAnswerBody").text(currentAnswerBody);

	var self = this;
	var questionpoolModel = controller.models['questionpool'];
	questionpoolModel.resetAnswer();
	$("#cardAnswerBody").empty();

	do {
		//var courseID = courseModel.getId(); we might need to define a method getId() for the answers in the Answers Model
		
		
		var li = $("<li/>", {
			  //"id": "answer" + answerID,
			  text: questionpoolModel.getAnswerChoice(),
			  click: function() {
				  self.clickAnswerItem($(this)); //to define the tap event  clickAnswerItem()of the user
			  }
			}).appendTo("#cardAnswerBody");
		
		
	} while (questionpoolModel.nextAnswerChoice());	

};



AnswerView.prototype.clickAnswerItem = function(clickedElement) {
	var span = $("<span/>", {
		"class": "right",
	}).appendTo(clickedElement);
	
	$("<i/>", {
		"class": "icon-ok"
	}).appendTo(span);
}



AnswerView.prototype.showAnswerTitle = function() {
	var currentAnswerTitle = controller.models["questionpool"]
			.getQuestionType();
	$("#cardAnswerTitle").text(currentAnswerTitle);
};

AnswerView.prototype.clickDoneButton = function() {

	controller.transitionToFeedback(); //in feedback view on the open we will define the loading for the feedback of the specific  current answer of the specific current view. similar way with questionbody and quesiton title methods 

};

AnswerView.prototype.clickCourseListButton = function() {

	controller.transitionToCourses();

};

AnswerView.prototype.clickTitleArea = function() {

	controller.transitionToQuestion();

};


// the following could replace the first lines with click..funtions etc.

//jester(element)
// .swipe(swipeHandler)  // attach a handler to the element's swipe event
// .doubletap(dtHandler);  // attach a handler to the element's doubletap event
/**

 */

