I. INTRODUCTION 
===============

The name of this software module is ISN Mobler Cards. It is an ISN Mobile Application to run Learning Cards for Courses on an Ilias LMS. 



II.FEATURES
============

This module composes the front-end part of ISN Mobile Application, which is structured according to an MVC arhcitecture as following:

- Controller
- Models
- Views


Controller
----------

Main role of the controller is to bridge the communication between the views and the models.  More specifically, the controller is responsible to handle the navigation between  
the views. Additionally, in the controller except from the initialization of models and views is being set up the language of the interface.



Models
------
* Configuration Model
* Courses Model
* Questionpool Model
* Answer Model
* Statistics Model

	- Best day and best score Model: the day on which i answered  the most correct answerds. 
	                                 The score achieved on this day is the best score.
	
	
	- Handled Cards Model :          the last 24 hours
	
	- Average score Model: the last 24 hours. it is the number of correct and partially correct answers
						   out of the total number of questions that i answered.
	- Progress Model : the last 24 hours : how many of the answered cards were asnwered correctly.
	 
	- Average Speed Model: the last 24 hours (speed counts the time that is spent from the time we enter the question view
						until the time we leave the answer view
	
	- StackHandler Model : how many cards you have dealt with out of all the cards from the beginning?
	
	- CardBurner Model(if you went through 100 cards per day, if achieved, then it remains there)


Views
------

SplashScreen View

Login View

Courses List View

Question View

Answer View
 - Single Choice Widget
 - Multiple Choice Widget
 - Text sorting Widget
 - Numeric Question Widget

FeedbackView
Settings View
Statistics View
Achievements View
Logout View
Logout Confirmation View



IV. GENERAL NOTES
=================

icon moon font  size,

 


II.INSTALLATION
===============

- Install Phonegap n various IDE's (to provide cordova link for various OS) 
- Download any external libraries



V.LICENSES
===========




VI.ACKNOWLEGEMENTS
=================