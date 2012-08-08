$(document).ready(function()
{
$("#splashScreen").click(function(){
  $("#loading").hide();
  $("#loginForm").toggle();
   });
  
  $("#loginForm").click(function(){
    $("#loginForm").toggle();
    $("#gesturereport").toggle();
  
   });
  
 
});