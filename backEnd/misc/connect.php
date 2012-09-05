<?php

 $link = mysql_connect('localhost', 'mysql_user', 'mysql_password') or die('Cannot connect to the DB');
 $mysql_select_db("dbName", $link) or die('Cannot select the DB');

    

?>