$(document).ready(function()
{

  //from splash screen to login by tapping
  
  jester($("#splashScreen")[0]).tap(function(){
  $("#loading").toggle();
  $("#loginForm").toggle();
   });

 //from login view to course list by tapping on the login button
 jester($("#loginButton")[0]).tap(function(){
  $("#courseList").show();
    $("#loginForm").hide();
    $("#splashScreen").hide();

   });

//from course list view to card question view 1 by tapping on a list item
jester($("#list")[0]).tap(function(){
  $("#cardQuestion1").show();
    $("#courseList").hide();
    $("#splashScreen").hide();

   });
 
 //from course list view to settings view by swiping (it should be done by pinching)
 
 jester($("#list")[0]).swipe(function(){
  $("#settings").show();
    $("#courseList").hide();
    $("#splashScreen").hide();

   });
 
 //from settings to coure list by taping on the close button
 jester($("#closeSettings")[0]).tap(function(){
  $("#settings").hide();
    $("#courseList").toggle();
    $("#splashScreen").hide();

   });
   
   //from settings to course list by swipping (it should be done by stretching)
    jester($("#settings")[0]).swipe(function(){
  $("#settings").hide();
    $("#courseList").toggle();
    $("#splashScreen").hide();

   });
   
   //from settings to confirmation screen by clicking on the logout button, the same result sould be obtained by pinching)
    jester($("#logOutSettings")[0]).tap(function(){
  $("#settings").hide();
    $("#logoutConfirmation").toggle();
    $("#splashScreen").hide();

   });
   
   //from logouts confirmation screen to settings by swiping. the same result should be obtained by pinching and stretching
   
   jester($("#logoutConfirmation")[0]).swipe(function(){
    $("#logoutConfirmation").hide();
    $("#settings").show();
    $("#splashScreen").hide();

   });
   
   //from  logout confirmation screen to splash screen by taping on the logout button (the final one)
    jester($("#logOut")[0]).tap(function(){
  $("#logoutConfirmation").hide();
    $("#splashScreen").show();
    $("#loading").show();

   });
   
 //from card question view 1 to next one by swiping (in the future to implement this by an algorithm ..based on the weight of each learning card
 
  jester($("#cardQuestion1")[0]).swipe(function(){
  $("#cardQuestion1").hide();
    $("#cardQuestion2").toggle();
    $("#splashScreen").hide();

   });
   
   //from card question view to answer view by tapping anywhere on the screen
 
   jester($("#cardQuestion1")[0]).tap(function(){
  $("#cardQuestion1").hide();
    $("#cardAnswer").toggle();
    $("#splashScreen").hide();

   });
 
 //from card question view to course list by tapping on the course list view button. It should be done by pinching
  jester($("#CourseList_FromQuestion")[0]).tap(function(){
  $("#cardQuestion1").hide();
    $("#courseList").toggle();
     $("#cardAnswer").toggle();
    $("#splashScreen").hide();

   });

   jester($("#cardAnswer")[0]).swipe(function(){
    $("#cardAnswer").hide();
      $("#cardQuestion2").toggle();
    $("#splashScreen").hide();

   });
  
  //from card answer view to question view by tapping on the title area of it
  jester($("#titleAnswer")[0]).tap(function(){
    $("#cardAnswer").hide();
      $("#cardQuestion1").toggle();
    $("#splashScreen").hide();

   });
   
   //tap on done button in answer view page so that to navigate to feedback view
   
    jester($("#done")[0]).tap(function(){
    $("#cardAnswer").hide();
      $("#cardFeedback").show();
    $("#splashScreen").hide();

   });
 
 // to do the navigation from  card answer view to course list view by pinching
 
 // code
 
 //from feedback view to question view by swiping
 jester($("#cardFeedback")[0]).swipe(function(){
    $("#cardFeedback").hide();
      $("#cardQuestion1").toggle();
    $("#splashScreen").hide();

   });
 
 
 // to do the navigation from feedback view to course list view by pinching 
 
});