function AnswerView() {
    var self = this;
    
    self.tagID = 'cardAnswerView';
    
    $('#doneButton').click(function(){ self.clickDoneButton(); } );
    $('#CourseList_FromAnswer').click(function(){ self.clickCourseListButton(); } );
    $('#cardAnswerHeader').click(function(){ self.clickTitleArea(); } );
    
} 

AnswerView.prototype.handleTap = doNothing;

AnswerView.prototype.handleSwipe = handleSwipe;

AnswerView.prototype.close = closeView;
AnswerView.prototype.openDiv = openView;
AnswerView.prototype.open = function () { 

   this.showAnswerTitle();
   this.showAnswerBody();
   this.openDiv();
 
};


AnswerView.prototype.showAnswerBody = function() {
    var currentAnswerBody = Controller.models["QuestionPoolModel"].getAnswerBody();
    $("#cardQAnswerBody").text(currentAnswerBody);
};


AnswerView.prototype.showAnswerTitle = function() {
    var currentAnswerTitle = Controller.models["QuestionPoolModel"].getAnswerTitle();
    $("#cardAnswerTitle").text(currentAnswerTitle);
};


AnswerView.prototype.clickDoneButton = function () { 

Controller.transitionToFeedback() ; //in feedback view on the open we will define the loading for the feedback of the specific  current answer of the specific current view. similar way with questionbody and quesiton title methods 



}


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
      
      
function clickTitleArea() {
      
      Controller.transitionToQuestion() ; 
      
      
      }
      
      
      
// the following could replace the first lines with click..funtions etc.

//jester(element)
 // .swipe(swipeHandler)  // attach a handler to the element's swipe event
 // .doubletap(dtHandler);  // attach a handler to the element's doubletap event
 /**
 
 */

