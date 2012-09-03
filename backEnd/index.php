<?php

//connect to the server
include('connect.php');

$query = "SELECT course_id, FROM courses";
$result = mysql_query($query,$link) or die('Errant query:  '.$query);


//create a php array to host the query resutls after connecting with the server
$posts = array();
  if(mysql_num_rows($result)) {
    while($post = mysql_fetch_assoc($result)) {
      $posts[] = array('post'=>$post);
    }
  }




 
 // to read the json object in the web service
 //$json = file_get_contents('php://input');
 //$obj = json_decode($json);
 
 
//create manually the php array until we connect to the server
$posts= array(

		'1'       =>    array(
				'type'    =>    'Single Choice Question',
				'question' =>   'Choose the correct answer taking into account..Choose the correct answer taking into account.',
				'answer'   =>   array(
						'1'  =>    array(
								'text' => "answer1",
								'score'=> "0"
								),
						
						'2'  =>    array(
								'text' => "answer2",
								'score'=> "1"
						),
						'3'  =>    array(
								'text' => "answer3",
								'score'=> "0"
						),
						'4'  =>    array(
								'text' => "answer4",
								'score'=> "0"
						)
						
				), //end of answer
				'correctFeedback'    => "Excellent",
				'errorFeedback'    => "Wrong.In order to asnwer this question better you should also take into account the impact of "

		), //end of first question
		
		'2'       =>    array(
				'type'    =>    'Multiple Choice Question',
				'question' =>   'How could an organization contribute to ..after weighing the pros and cos',
				'answer'   =>   array(
						'1'  =>    array(
								'text' => "by lending money",
								'score'=> "0"
						),
		
						'2'  =>    array(
								'text' => "by developing a new business model",
								'score'=> "1"
						),
						'3'  =>    array(
								'text' => "by collaborating with",
								'score'=> "0"
						)
					
				), //end of answer
				'correctFeedback'    => "Excellent",
				'errorFeedback'    => "Wrong.In order to asnwer this question better you should also take into account the impact of "
				
		
		),
		
		'3'       =>    array(
				'type'   	 =>   'Numeric Question',
				'question' 	 =>   'What is the number',
				'answer'     =>   '45',
				'answer'     =>   array(
									'1'=>  '45'
									),
// 						'1'  =>    array(
// 								'text' => "by lending money",
// 								'score'=> "0"
// 						),

// 						'2'  =>    array(
// 								'text' => "by developing a new business model",
// 								'score'=> "1"
// 						),
// 						'3'  =>    array(
// 								'text' => "by collaborating with",
// 								'score'=> "0"
// 						)
							
//				), //end of answer
				'correctFeedback'    => "Excellent",
				'errorFeedback'    => "Wrong.In order to asnwer this question better you should also take into account the impact of "	
		),
		
		'4'       =>    array(
				'type'    =>    'Text Sort Question',
				'question' =>   'Sort alphabetically',
				'answer'   =>   array(
						'1'  =>    array(
								'text' => "A",                                                                                                                                                                                                       
								'score'=> "0"
						),
		
						'2'  =>    array(
								'text' => "B",
								'score'=> "1"
						),
						'3'  =>    array(
								'text' => "C",
								'score'=> "1"
						),
						'4'  =>    array(
								'text' => "E",
								'score'=> "1"
						)
							
				), //end of answer
				'correctFeedback'    => "",
				'errorFeedback'    => "In order to asnwer this question better you should also take into account the impact of "
		
		
		),

);


       
//output in necessary format
       header('Content-type: application/json');
       echo json_encode(array('posts'=>$posts));
        
//the rest controller supports a bucn of different requests/response formats, including XML, JSON and serialized PHP.
 //      $ curl -H "Accept: application/json" http://example.com
 
?>