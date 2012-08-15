function QuestionView() {
    var self = this;
    

    self.tagID = 'cardQuestionView';
    
<<<<<<< HEAD
    $('#CourseList_FromQuestion').click(function(){ self.clickCourseListButton(); } );
=======
    jester($('#CourseList_FromQuestion')[0]).tap(function(event){ self.clickCourseListButton(); event.stopPropagation(); } );
>>>>>>> refs/heads/belinastrack
    $('#ButtonAnswer').click(function(){ handleTap(); } );
    
} 



<<<<<<< HEAD
QuestionView.prototype.handleTap = handleTap;
QuestionView.prototype.handleSwipe = handleSwipe;
=======
QuestionView.prototype.handleTap = function() {
	controller.transitionToAnswer();
    };
QuestionView.prototype.handleSwipe = function() {

	// ask the model to select the next question
	// update the display for the current view 
    console.log("swipe works");
    controller.models['questionpool'].nextQuestion();
	this.showQuestionBody();
	this.showQuestionTitle();
};
>>>>>>> refs/heads/belinastrack
QuestionView.prototype.close = closeView;
QuestionView.prototype.openDiv = openView;
QuestionView.prototype.open = function() {
	this.showQuestionBody();
	this.showQuestionTitle();
	this.openDiv();
};

QuestionView.prototype.showQuestionBody = function() {
	var currentQuestionBody = controller.models["questionpool"]
			.getQuestionBody();
	$("#cardQuestionBody").text(currentQuestionBody);
};

QuestionView.prototype.showQuestionTitle = function() {
	var currentQuestionTitle = controller.models["questionpool"]
			.getQuestionType();
	$("#cardQuestionTitle").text(currentQuestionTitle);
};

QuestionView.prototype.clickCourseListButton = function() {

	controller.transitionToCourses();

};

<<<<<<< HEAD
function handleTap() {
	controller.transitionToAnswer();

};

function handleSwipe() {

	// ask the model to select the next question
	// update the display for the current view 
    console.log("swipe works");
    controller.models['questionpool'].nextQuestion();
	this.showQuestionBody();
	this.showQuestionTitle();
};
=======



>>>>>>> refs/heads/belinastrack

