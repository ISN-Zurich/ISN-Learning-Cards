<?php


$courseId = $_SERVER['PATH_INFO'];
$courseId = preg_replace("/\//",	"", $courseId);
$courseId = preg_replace("/\.json/",	"", $courseId);
logging($courseId);



echo(json_encode(getQuestionPools($courseId)));

function getQuestionPools($courseId) {
	return array(
			"courseID" => $courseId,
			"questions"=> array(
					array(
							"type" => "Numeric Question",
							"question" => "1 - What is the number",
							"answer" => "45",
							"correctFeedback" => "",
							"errorFeedback" => "In order to asnwer this question better you should also take into account the impact of.."

					),
					array(
							"type" => "Numeric Question",
							"question" => "2 - How many times..",
							"answer" => "21",
							"correctFeedback" => "This is the correct feedback of this answer",
							"errorFeedback" => ""

					)
			)
	);
}

function logging($message) {
	$log_prefix = "questions.php: ";

	error_log($log_prefix . $message, 0);
}
?>