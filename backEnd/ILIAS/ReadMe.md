INTRODUCTION
============

The name of this product is Mobler Cards ILIAS Backend. This backend service is a REST Service of Mobler Cards mobile app,  which is a mobile web app that runs on iOS and Android operating systems. More information about the app can be found at: https://github.com/ISN-Zurich/ISN-Learning-Cards. The service is developed to run on ILIAS compliant Learning Management Systems(LMS). 


INSTALLATION
============

	- Logging into the server
	- Copy the rest service directory into your ILIAS installation directory.
//Note if your database server doesnt allow to create tables then use the schema.sql file to create them manually 

GENERAL NOTES
===============

Mobler Cards ILIAS Backend module contains some ILIAS files that were customized in order to meet our needs. These are included in Services and include folders. 
The loging file is used to facilitate the displaying of messages on the server and their correlation with a specific class/file.


SUPPORTED FUNCTIONALITIES
=========================

I.   REGISTRATION
II.  AUTHENTICATION
III. COURSES
IV.  QUESTIONS
V.   STATISTICS


I. REGISTRATION
-----------------

This script registers the app with the backend. It returns the client key for the app which is based on the device id (uuid) and the app ID. Mobler Cards ID is "ch.ethz.isn.learningcards". A md5 hash is used to generate the client key based on the appID, uuid along with a random seed.  

NOTE: The client Key is unique for every device. 


II. AUTHENTICATION
-------------------

This script authenticates a user to the backend. There are 4 types of request methods that are passed through the client. The PUT and POST are sent when the login process takes place. The DELETE is passed when a logout is sent to the server. The GET request is passed when data are being loaded from the server. NOTE: The latter is feasible only after logging into the system.
 

III. COURSES
-------------

This script handles the loading of courses from the server. The courses are specific for a user id from ILIAS. It returns a json object with the course list.


IV. QUESTIONS
--------------


This script handles the loading of the questions from the server. The questions are specific for a course id. It returns a json object with the question list.



V. STATISTICS
--------------

This script  handles the loading and storing of statistics data from and to the server. The statistics data are related with a specific user id which is stored in ILIAS database and is transfered via headers.



COPYRIGHT
==========

Copyright (c) 2012 ETH Zürich, Affero GPL, see backend/ILIAS/AGPL_LICENSE.txt
if you don't have a license file, then you can obtain it from the project΄s page 
on github <https://github.com/ISN-Zurich/ISN-Learning-Cards/blob/master/backEnd/ILIAS/LICENSE.txt> 

Mobler Cards ILIAS Backend is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or (at your option) any later version.


Mobler Cards ILIAS Backend is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Mobler Cards ILIAS Backend. If not, see <http://www.gnu.org/licenses/>.
	

VERSION
=======

The current version was released on 28.09.2012

