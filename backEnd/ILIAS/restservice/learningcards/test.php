
<?php 
/**
 * Test script to check if the new initialisation for ilias 4.3 is running
 * @author Evangelia Mitsopoulou
 */
echo "ilias init start<br>";

		include_once("Services/Init/classes/ilRESTInitialization.4.3.php");
		echo "ilias init loaded<br>";
		//$ilInit = new ilRESTInitialization();
		//$GLOBALS['ilInit'] = $ilInit;
		ilRESTInitialization::initILIAS();
		
		echo "ilias init done <br>";
		global $ilDB;
		$tables=$ilDB->listTables();
		echo "tables of the database are " . join("<br> ", $tables);

?>