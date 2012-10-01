<?php

/* 	THIS COMMENT MUST NOT BE REMOVED


Copyright (c) 2012 ETH Zürich, Affero GPL, see backend/ILIAS/AGPL_LICENSE.txt
if you don't have a license file, then you can obtain it from the project΄s page
on github <https://github.com/ISN-Zurich/ISN-Learning-Cards/blob/master/backEnd/ILIAS/LICENSE.txt>
 

This file is part of Mobler Cards ILIAS Backend.

Mobler Cards Ilias Backend is free software: you can redistribute this code and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Mobler Cards Ilias Backend  is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with Ilias Backend. If not, see <http://www.gnu.org/licenses/>.
*/


/**
 * 
 * This function is responsible for displaying the logging messages, showing the name of the class in which they are detected.
 * @author Isabella Nake
 * @author Evangelia Mitsopoulou
 */

function logging($message) {
	global $class_for_logging;
	
	$log_prefix = $class_for_logging . ": ";

	error_log($log_prefix . $message, 0);
}

?>