function QuestionView() {
    var self = this;
    

    self.tagID = 'cardQuestionView';
    
    $('#CourseList_FromQuestion').click(function(){ self.clickCourseListButton(); } );
    $('#ButtonAnswer').click(function(){ handleTap(); } );
    
} 



QuestionView.prototype.handleTap = handleTap;
QuestionView.prototype.handleSwipe = handleSwipe;
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

function handleTap() {
	controller.transitionToAnswer();

};

function handleSwipe() {

	// ask the model to select the next question
	// update the display for the current view 

	controller.models['questionpool'].nextQuestion();
	this.showQuestionBody();
	this.showQuestionTitle();
};

