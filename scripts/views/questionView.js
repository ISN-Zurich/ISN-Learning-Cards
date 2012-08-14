function QuestionView(question) {
    var self = this;
    

    self.tagID = 'cardQuestionView';
    
$('#CourseList_FromQuestion').click(function(){ self.clickCourseListButton(); } );
    
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
    var currentQuestionBody = Controller.models["questionpool"].getQuestionBody();
    $("#cardQuestionBody").text(currentQuestionBody);
};

QuestionView.prototype.showQuestionTitle = function() {
    var currentQuestionTitle = Controller.models["questionpool"].getQuestionType();
    $("#cardQuestionTitle").text(currentQuestionTitle);
};


function handleTap () {
        Controller.transitionToAnswer() ;

};


function handleSwipe () {

    // ask the model to select the next question
    // update the display for the current view 

    Controller.models['questionpool'].nextQuestion(); 
    this.showQuestionBody();
    this.showQuestionTitle();      
};

function clickCourseListButton() {

        Controller.transitionToCouses() ;


      }