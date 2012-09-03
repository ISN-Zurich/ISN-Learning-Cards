<?php

include_once 'REST_Controller.php';

class WebService extends Rest_Controller{
	
	var $methods;
	var $json;
	
//initialize	
function initialize() {
		$this->json = new Services_JSON(SERVICES_JSON_LOOSE_TYPE);
		//->json = new Services_JSON(SERVICES_JSON_USE_TO_JSON);
	}
	
//login method
function login($username,$password){
	$query = "select * from users where username='".$username."' AND password='".$password."'";
	$result = mysql_query($query);
	$num_rows = mysql_num_rows($result);
	return $num_rows;
}


function loadCourses($dataJson) {
 //display all courses

}

function loadQuestions($dataJson) {

	//display all questions-questionpools
}


//accessing parameters. Use the name of the http verb as a method
// $this->get('blah'); GET param
// $this->post('blah'); POST param
// $this->put('blah'); PUT param
// $this->delete('blah'); DELETE param

}//end of class WebService



?>





