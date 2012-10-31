<?php
/*
 +-----------------------------------------------------------------------------+
| ILIAS open source                                                           |
+-----------------------------------------------------------------------------+
| Copyright (c) 1998-2009 ILIAS open source, 2012 ETH Zürich, 
  see backend/ILIAS/GPL_LICENSE.txt            |
|                                                                             |
| This program is free software; you can redistribute it and/or               |
| modify it under the terms of the Extened GNU General Public License                 |
| as published by the Free Software Foundation; either version 2              |
| of the License, or (at your option) any later version.                      |
|                                                                             |
| This program is distributed in the hope that it will be useful,             |
| but WITHOUT ANY WARRANTY; without even the implied warranty of              |
| MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the               |
| GNU General Public License for more details.                                |
|                                                                             |
| You should have received a copy of the GNU General Public License           |
| along with this program; if not, write to the Free Software                 |
| Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA. |
+-----------------------------------------------------------------------------+

*/


/** @defgroup ServicesInit Services/Init
 */

/**
* ILIAS Initialisation Utility Class
* perform basic setup: init database handler, load configuration file,
* init user authentification & error handler, load object type definitions
*
* @author Alex Killing <alex.killing@gmx.de>
* @author Sascha Hofmann <shofmann@databay.de>
* @author Isabella Nake
* @author Evangelia Mitsopoulou 

* @version $Id: class.ilInitialisation.php 31209 2011-10-20 11:20:26Z mjansen $
*
* @ingroup ServicesInit
*/
class ilInitialisation
{
	private $return_before_auth = false;
	var $script = "";

	/**
	* Remove unsafe characters from GET
	*/
	function removeUnsafeCharacters()
	{
		// Remove unsafe characters from GET parameters.
		// We do not need this characters in any case, so it is
		// feasible to filter them everytime. POST parameters
		// need attention through ilUtil::stripSlashes() and similar functions)
		if (is_array($_GET))
		{
			foreach($_GET as $k => $v)
			{
				// \r\n used for IMAP MX Injection
				// ' used for SQL Injection
				$_GET[$k] = str_replace(array("\x00", "\n", "\r", "\\", "'", '"', "\x1a"), "", $v);

				// this one is for XSS of any kind
				$_GET[$k] = strip_tags($_GET[$k]);
			}
		}
	}
	
	public function returnBeforeAuth($a_flag = null)
	{
		if(null === $a_flag)
		{
			return $this->return_before_auth;
		}
		
		$this->return_before_auth = $a_flag;
		return $this;
	}

	/**
	 * get common include code files
	*/
	function requireCommonIncludes()
	{
		global $ilBench;

		// get pear
		require_once("include/inc.get_pear.php");
		require_once("include/inc.check_pear.php");

		//include class.util first to start StopWatch
		require_once "./Services/Utilities/classes/class.ilUtil.php";
		require_once "classes/class.ilBenchmark.php";
		$ilBench = new ilBenchmark();
		$GLOBALS['ilBench'] = $ilBench;

		// BEGIN Usability: Measure response time until footer is displayed on form
		// The stop statement is in class.ilTemplate.php function addILIASfooter()
		$ilBench->start("Core", "ElapsedTimeUntilFooter");
		// END Usability: Measure response time until footer is displayed on form

		$ilBench->start("Core", "HeaderInclude");

		// start the StopWatch
		$GLOBALS['t_pagestart'] = ilUtil::StopWatch();

		$ilBench->start("Core", "HeaderInclude_IncludeFiles");
//echo ":".class_exists("HTML_Template_ITX").":";
		// Major PEAR Includes
		require_once "PEAR.php";
		//require_once "DB.php";
		require_once "Auth/Auth.php";


		//include classes and function libraries
		require_once "include/inc.db_session_handler.php";
		require_once "./Services/Database/classes/class.ilDB.php";
		require_once "./Services/AuthShibboleth/classes/class.ilShibboleth.php";
		require_once "classes/class.ilias.php";
		require_once './Services/User/classes/class.ilObjUser.php';
		require_once "classes/class.ilFormat.php";
		require_once "./Services/Calendar/classes/class.ilDatePresentation.php";
		require_once "classes/class.ilSaxParser.php";
		require_once "./Services/Object/classes/class.ilObjectDefinition.php";
		require_once "./Services/Style/classes/class.ilStyleDefinition.php";
		require_once "./Services/Tree/classes/class.ilTree.php";
		require_once "./Services/Language/classes/class.ilLanguage.php";
		require_once "./Services/Logging/classes/class.ilLog.php";
		require_once "classes/class.ilCtrl2.php";
		require_once "./Services/AccessControl/classes/class.ilConditionHandler.php";
		require_once "classes/class.ilBrowser.php";
		require_once "classes/class.ilFrameTargetInfo.php";
		require_once "Services/Navigation/classes/class.ilNavigationHistory.php";
		require_once "Services/Help/classes/class.ilHelp.php";
		require_once "include/inc.ilias_version.php";

		//include role based access control system
		require_once "./Services/AccessControl/classes/class.ilAccessHandler.php";
		require_once "./Services/AccessControl/classes/class.ilRbacAdmin.php";
		require_once "./Services/AccessControl/classes/class.ilRbacSystem.php";
		require_once "./Services/AccessControl/classes/class.ilRbacReview.php";

		// include object_data cache
		require_once "classes/class.ilObjectDataCache.php";
		require_once 'Services/Tracking/classes/class.ilOnlineTracking.php';

		//include LocatorGUI
		require_once "./Services/Locator/classes/class.ilLocatorGUI.php";

		// include error_handling
		require_once "classes/class.ilErrorHandling.php";

		$ilBench->stop("Core", "HeaderInclude_IncludeFiles");
	}
	
	/**
	 * This is a hack for CAS authentication.
	 * Since the phpCAS lib ships with its own compliance functions.
	 * @return 
	 */
	public function includePhp5Compliance()
	{
		// php5 downward complaince to php 4 dom xml and clone method
		if (version_compare(PHP_VERSION,'5','>='))
		{
			if(ilAuthFactory::getContext() != ilAuthFactory::CONTEXT_CAS)
			{
				require_once("include/inc.xml5compliance.php");
			}
			require_once("include/inc.xsl5compliance.php");
			require_once("include/inc.php4compliance.php");
		}
		else
		{
			require_once("include/inc.php5compliance.php");
		}
		
	}
	

	/**
	* This method provides a global instance of class ilIniFile for the
	* ilias.ini.php file in variable $ilIliasIniFile.
	*
	* It initializes a lot of constants accordingly to the settings in
	* the ilias.ini.php file.
	*/
	function initIliasIniFile()
	{
		global $ilIliasIniFile;

		require_once("classes/class.ilIniFile.php");
		$ilIliasIniFile = new ilIniFile("./ilias.ini.php");
		$GLOBALS['ilIliasIniFile'] =& $ilIliasIniFile;
		$ilIliasIniFile->read();

		// initialize constants
		define("ILIAS_DATA_DIR",$ilIliasIniFile->readVariable("clients","datadir"));
		define("ILIAS_WEB_DIR",$ilIliasIniFile->readVariable("clients","path"));
		define("ILIAS_ABSOLUTE_PATH",$ilIliasIniFile->readVariable('server','absolute_path'));

		// logging
		define ("ILIAS_LOG_DIR",$ilIliasIniFile->readVariable("log","path"));
		define ("ILIAS_LOG_FILE",$ilIliasIniFile->readVariable("log","file"));
		define ("ILIAS_LOG_ENABLED",$ilIliasIniFile->readVariable("log","enabled"));
		define ("ILIAS_LOG_LEVEL",$ilIliasIniFile->readVariable("log","level"));

		// read path + command for third party tools from ilias.ini
		define ("PATH_TO_CONVERT",$ilIliasIniFile->readVariable("tools","convert"));
		define ("PATH_TO_ZIP",$ilIliasIniFile->readVariable("tools","zip"));
		define ("PATH_TO_MKISOFS",$ilIliasIniFile->readVariable("tools","mkisofs"));
		define ("PATH_TO_UNZIP",$ilIliasIniFile->readVariable("tools","unzip"));
		define ("PATH_TO_JAVA",$ilIliasIniFile->readVariable("tools","java"));
		define ("PATH_TO_HTMLDOC",$ilIliasIniFile->readVariable("tools","htmldoc"));
		define ("URL_TO_LATEX",$ilIliasIniFile->readVariable("tools","latex"));
		define ("PATH_TO_FOP",$ilIliasIniFile->readVariable("tools","fop"));

		// read virus scanner settings
		switch ($ilIliasIniFile->readVariable("tools", "vscantype"))
		{
			case "sophos":
				define("IL_VIRUS_SCANNER", "Sophos");
				define("IL_VIRUS_SCAN_COMMAND", $ilIliasIniFile->readVariable("tools", "scancommand"));
				define("IL_VIRUS_CLEAN_COMMAND", $ilIliasIniFile->readVariable("tools", "cleancommand"));
				break;

			case "antivir":
				define("IL_VIRUS_SCANNER", "AntiVir");
				define("IL_VIRUS_SCAN_COMMAND", $ilIliasIniFile->readVariable("tools", "scancommand"));
				define("IL_VIRUS_CLEAN_COMMAND", $ilIliasIniFile->readVariable("tools", "cleancommand"));
				break;

			case "clamav":
				define("IL_VIRUS_SCANNER", "ClamAV");
				define("IL_VIRUS_SCAN_COMMAND", $ilIliasIniFile->readVariable("tools", "scancommand"));
				define("IL_VIRUS_CLEAN_COMMAND", $ilIliasIniFile->readVariable("tools", "cleancommand"));
				break;

			default:
				define("IL_VIRUS_SCANNER", "None");
				break;
		}
		
		$tz = $ilIliasIniFile->readVariable("server","timezone");
		if ($tz != "")
		{
			if (function_exists('date_default_timezone_set'))
			{
				date_default_timezone_set($tz);
			}
		}
		define ("IL_TIMEZONE", $ilIliasIniFile->readVariable("server","timezone"));
		
		//$this->buildHTTPPath();
	}

	/**
	* builds http path
	*
	* this is also used by other classes now,
	* e.g. in ilSoapAuthenticationCAS.php
	*/
	function buildHTTPPath()
	{
		include_once 'classes/class.ilHTTPS.php';
		$https = new ilHTTPS();

	    if($https->isDetected())
		{
			$protocol = 'https://';
		}
		else
		{
			$protocol = 'http://';
		}
		$host = $_SERVER['HTTP_HOST'];

		$rq_uri = $_SERVER['REQUEST_URI'];

		// security fix: this failed, if the URI contained "?" and following "/"
		// -> we remove everything after "?"
		if (is_int($pos = strpos($rq_uri, "?")))
		{
			$rq_uri = substr($rq_uri, 0, $pos);
		}

		if(!defined('ILIAS_MODULE'))
		{
			$path = pathinfo($rq_uri);
			if(!$path['extension'])
			{
				$uri = $rq_uri;
			}
			else
			{
				$uri = dirname($rq_uri);
			}
		}
		else
		{
			// if in module remove module name from HTTP_PATH
			$path = dirname($rq_uri);

			// dirname cuts the last directory from a directory path e.g content/classes return content

			$module = ilUtil::removeTrailingPathSeparators(ILIAS_MODULE);

			$dirs = explode('/',$module);
			$uri = $path;
			foreach($dirs as $dir)
			{
				$uri = dirname($uri);
			}
		}
		
		return define('ILIAS_HTTP_PATH',ilUtil::removeTrailingPathSeparators($protocol.$host.$uri));
	}


	/**
	* This method determines the current client and sets the
	* constant CLIENT_ID.
	*/
	function determineClient()
	{
		global $ilIliasIniFile;

		// check whether ini file object exists
		if (!is_object($ilIliasIniFile))
		{
			die ("Fatal Error: ilInitialisation::determineClient called without initialisation of ILIAS ini file object.");
		}

                // CGL: there is some "client" information stored in the ini file.
                // CGL: without this information the database initialization fails.
		$client_id = $ilIliasIniFile->readVariable("clients","default");    
                define ("CLIENT_ID", $client_id);    
	}

	/**
	* This method provides a global instance of class ilIniFile for the
	* client.ini.php file in variable $ilClientIniFile.
	*
	* It initializes a lot of constants accordingly to the settings in
	* the client.ini.php file.
	*
	* Preconditions: ILIAS_WEB_DIR and CLIENT_ID must be set.
	*
	* @return	boolean		true, if no error occured with client init file
	*						otherwise false
	*/
	function initClientIniFile()
	{
		global $ilClientIniFile;

		// check whether ILIAS_WEB_DIR is set.
		if (ILIAS_WEB_DIR == "")
		{
			die ("Fatal Error: ilInitialisation::initClientIniFile called without ILIAS_WEB_DIR.");
		}

		// check whether CLIENT_ID is set.
		if (CLIENT_ID == "")
		{
			die ("Fatal Error: ilInitialisation::initClientIniFile called without CLIENT_ID.");
		}

		$ini_file = "./".ILIAS_WEB_DIR."/".CLIENT_ID."/client.ini.php";

		// get settings from ini file
		require_once("classes/class.ilIniFile.php");
		$ilClientIniFile = new ilIniFile($ini_file);
		$GLOBALS['ilClientIniFile'] =& $ilClientIniFile;
		$ilClientIniFile->read();

		// if no ini-file found switch to setup routine
		if ($ilClientIniFile->ERROR != "")
		{
			return false;
		}

		// set constants
		define ("SESSION_REMINDER_LEADTIME", 30);
		define ("DEBUG",$ilClientIniFile->readVariable("system","DEBUG"));
		define ("DEVMODE",$ilClientIniFile->readVariable("system","DEVMODE"));
		define ("SHOWNOTICES",$ilClientIniFile->readVariable("system","SHOWNOTICES"));
		define ("ROOT_FOLDER_ID",$ilClientIniFile->readVariable('system','ROOT_FOLDER_ID'));
		define ("SYSTEM_FOLDER_ID",$ilClientIniFile->readVariable('system','SYSTEM_FOLDER_ID'));
		define ("ROLE_FOLDER_ID",$ilClientIniFile->readVariable('system','ROLE_FOLDER_ID'));
		define ("MAIL_SETTINGS_ID",$ilClientIniFile->readVariable('system','MAIL_SETTINGS_ID'));

		define ("SYSTEM_MAIL_ADDRESS",$ilClientIniFile->readVariable('system','MAIL_SENT_ADDRESS')); // Change SS
		define ("MAIL_REPLY_WARNING",$ilClientIniFile->readVariable('system','MAIL_REPLY_WARNING')); // Change SS

		define ("MAXLENGTH_OBJ_TITLE",125);#$ilClientIniFile->readVariable('system','MAXLENGTH_OBJ_TITLE'));
		define ("MAXLENGTH_OBJ_DESC",$ilClientIniFile->readVariable('system','MAXLENGTH_OBJ_DESC'));

		define ("CLIENT_DATA_DIR",ILIAS_DATA_DIR."/".CLIENT_ID);
		define ("CLIENT_WEB_DIR",ILIAS_ABSOLUTE_PATH."/".ILIAS_WEB_DIR."/".CLIENT_ID);
		define ("CLIENT_NAME",$ilClientIniFile->readVariable('client','name')); // Change SS

		$val = $ilClientIniFile->readVariable("db","type");
		if ($val == "")
		{
			define ("IL_DB_TYPE", "mysql");
		}
		else
		{
			define ("IL_DB_TYPE", $val);
		}
		return true;
	}

	/**
	* initialise database object $ilDB
	*
	*/
	function initDatabase()
	{
		global $ilDB, $ilClientIniFile;

		// build dsn of database connection and connect
		require_once("./Services/Database/classes/class.ilDBWrapperFactory.php");
		$ilDB = ilDBWrapperFactory::getWrapper(IL_DB_TYPE);
		$ilDB->initFromIniFile();
		$ilDB->connect();
		$GLOBALS['ilDB'] = $ilDB;
		
	}

	/**
	* initialise event handler ilAppEventHandler
	*/
	function initEventHandling()
	{
		global $ilAppEventHandler;

		// build dsn of database connection and connect
		require_once("./Services/EventHandling/classes/class.ilAppEventHandler.php");
		$ilAppEventHandler = new ilAppEventHandler();
		$GLOBALS['ilAppEventHandler'] =& $ilAppEventHandler;
	}

	/**
	* set session handler to db
	*/
	function setSessionHandler()
	{
		global $ilErr;

		// set session handler
		if(ini_get('session.save_handler') != 'user')
		{
			ini_set("session.save_handler", "user");
		}
		if (!db_set_save_handler())
		{
			die("Please turn off Safe mode OR set session.save_handler to \"user\" in your php.ini");
		}

	}

	/**
	* initialise $ilSettings object and define constants
	*/
	function initSettings()
	{
		global $ilSetting;

		require_once("Services/Administration/classes/class.ilSetting.php");
		$ilSetting = new ilSetting();
		$GLOBALS['ilSetting'] =& $ilSetting;

		// set anonymous user & role id and system role id
		define ("ANONYMOUS_USER_ID", $ilSetting->get("anonymous_user_id"));
		define ("ANONYMOUS_ROLE_ID", $ilSetting->get("anonymous_role_id"));
		define ("SYSTEM_USER_ID", $ilSetting->get("system_user_id"));
		define ("SYSTEM_ROLE_ID", $ilSetting->get("system_role_id"));
		define ("USER_FOLDER_ID", 7);

		// recovery folder
		define ("RECOVERY_FOLDER_ID", $ilSetting->get("recovery_folder_id"));

		// installation id
		define ("IL_INST_ID", $ilSetting->get("inst_id",0));

		// define default suffix replacements
		define ("SUFFIX_REPL_DEFAULT", "php,php3,php4,inc,lang,phtml,htaccess");
		define ("SUFFIX_REPL_ADDITIONAL", $ilSetting->get("suffix_repl_additional"));

		$this->buildHTTPPath();

		// payment setting
		require_once('Services/Payment/classes/class.ilPaymentSettings.php');
		define('IS_PAYMENT_ENABLED', ilPaymentSettings::_isPaymentEnabled());
	}


	/**
	* determine current script and path to main ILIAS directory
	*/
	function determineScriptAndUpDir()
	{
		$this->script = substr(strrchr($_SERVER["PHP_SELF"],"/"),1);
		$dirname = dirname($_SERVER["PHP_SELF"]);
		$ilurl = @parse_url(ILIAS_HTTP_PATH);
		if (!$ilurl["path"])
		{
			$ilurl["path"] = "/";
		}
		$subdir = substr(strstr($dirname,$ilurl["path"]),strlen($ilurl["path"]));
		$updir = "";

		if ($subdir)
		{
			$num_subdirs = substr_count($subdir,"/");

			for ($i=1;$i<=$num_subdirs;$i++)
			{
				$updir .= "../";
			}
		}
		$this->updir = $updir;
	}

	/**
	* provide $styleDefinition object
	*/
	function initStyle()
	{
		global $ilBench, $styleDefinition;

		// load style definitions
		$ilBench->start("Core", "HeaderInclude_getStyleDefinitions");
		$styleDefinition = new ilStyleDefinition();
		$GLOBALS['styleDefinition'] =& $styleDefinition;

		// add user interface hook for style initialisation
		global $ilPluginAdmin;
		$pl_names = $ilPluginAdmin->getActivePluginsForSlot(IL_COMP_SERVICE, "UIComponent", "uihk");
		foreach ($pl_names as $pl)
		{
			$ui_plugin = ilPluginAdmin::getPluginObject(IL_COMP_SERVICE, "UIComponent", "uihk", $pl);
			$gui_class = $ui_plugin->getUIClassInstance();
			$resp = $gui_class->modifyGUI("Services/Init", "init_style", array("styleDefinition" => $styleDefinition));
		}

		$styleDefinition->startParsing();
		$ilBench->stop("Core", "HeaderInclude_getStyleDefinitions");
	}


	/**
	* set skin and style via $_GET parameters "skin" and "style"
	*/
	function handleStyle()
	{
		global $styleDefinition;

		if (isset($_GET['skin']) && isset($_GET['style']))
		{
			include_once("./Services/Style/classes/class.ilObjStyleSettings.php");
			if ($styleDefinition->styleExists($_GET['skin'], $_GET['style']) &&
				ilObjStyleSettings::_lookupActivatedStyle($_GET['skin'], $_GET['style']))
			{
				$_SESSION['skin'] = $_GET['skin'];
				$_SESSION['style'] = $_GET['style'];
			}
		}
		if (isset($_SESSION['skin']) && isset($_SESSION['style']))
		{
			include_once("./Services/Style/classes/class.ilObjStyleSettings.php");
			if ($styleDefinition->styleExists($_SESSION['skin'], $_SESSION['style']) &&
				ilObjStyleSettings::_lookupActivatedStyle($_SESSION['skin'], $_SESSION['style']))
			{
				$ilias->account->skin = $_SESSION['skin'];
				$ilias->account->prefs['style'] = $_SESSION['style'];
			}
		}
	}

	function initUserAccount()
	{
		global $ilUser, $ilLog, $ilAuth;

		//get user id
		if (empty($_SESSION["AccountId"]))
		{
			$uid = $ilUser->checkUserId();
			$_SESSION["AccountId"] = $uid;
			if ($uid > 0)
			{
				$ilUser->setId($uid);
			}
			// assigned roles are stored in $_SESSION["RoleId"]
			// DISABLED smeyer 20070510
			#$rbacreview = new ilRbacReview();
			#$GLOBALS['rbacreview'] =& $rbacreview;
			#$_SESSION["RoleId"] = $rbacreview->assignedRoles($_SESSION["AccountId"]);
		} // TODO: do we need 'else' here?
		else
		{
			// init user
			$ilUser->setId($_SESSION["AccountId"]);
		}

		// load account data of current user
		$ilUser->read();
	}
	
	/**
	* Init Locale
	*/
	function initLocale()
	{
		global $ilSetting;
		
		if (trim($ilSetting->get("locale") != ""))
		{
			$larr = explode(",", trim($ilSetting->get("locale")));
			$ls = array();
			$first = $larr[0];
			foreach ($larr as $l)
			{
				if (trim($l) != "")
				{
					$ls[] = $l;
				}
			}
			if (count($ls) > 0)
			{
				setlocale(LC_ALL, $ls);
				if (class_exists("Collator"))
				{
					$GLOBALS["ilCollator"] = new Collator($first);
				}
			}
		}
	}
	


	/**
	* go to public section
	*/
	function goToPublicSection()
	{
		global $ilAuth;

		// logout and end previous session
		$ilAuth->logout();
		session_unset();
		session_destroy();

		// new session and login as anonymous
		$this->setSessionHandler();
		session_start();
		$_POST["username"] = "anonymous";
		$_POST["password"] = "anonymous";
		ilAuthUtils::_initAuth();
		
		$oldSid = session_id();
		
		$ilAuth->start();
		
		$newSid = session_id();
		//include_once './Services/Payment/classes/class.ilPaymentShoppingCart.php';	
		//ilPaymentShoppingCart::_migrateShoppingCart($oldSid, $newSid);

		if (ANONYMOUS_USER_ID == "")
		{
			die ("Public Section enabled, but no Anonymous user found.");
		}
		if (!$ilAuth->getAuth())
		{
			die("ANONYMOUS user with the object_id ".ANONYMOUS_USER_ID." not found!");
		}
		
		// stop immediately to avoid redirection madness.
                return true;
	}


	/**
	* $lng initialisation
	*/
	function initLanguage()
	{
		global $ilBench, $lng, $ilUser, $ilSetting;
		
		//init language
		$ilBench->start("Core", "HeaderInclude_initLanguage");

		if (!isset($_SESSION['lang']))
		{
			if ($_GET["lang"])
			{
				$_GET["lang"] = $_GET["lang"];
			}
			else
			{
				if (is_object($ilUser))
				{
					$_GET["lang"] = $ilUser->getPref("language");
				}
			}
		}

		if (isset($_POST['change_lang_to']) && $_POST['change_lang_to'] != "")
		{
			$_GET['lang'] = ilUtil::stripSlashes($_POST['change_lang_to']);
		}

		$_SESSION['lang'] = (isset($_GET['lang']) && $_GET['lang']) ? $_GET['lang'] : $_SESSION['lang'];

		// prefer personal setting when coming from login screen
		// Added check for ilUser->getId > 0 because it is 0 when the language is changed and the user agreement should be displayes (Helmut Schottm��ller, 2006-10-14)
		if (is_object($ilUser) && $ilUser->getId() != ANONYMOUS_USER_ID && $ilUser->getId() > 0)
		{
			$_SESSION['lang'] = $ilUser->getPref("language");
		}

		// check whether lang selection is valid
		$langs = ilLanguage::getInstalledLanguages();
		if (!in_array($_SESSION['lang'], $langs))
		{
			if (is_object($ilSetting) && $ilSetting->get("language") != "")
			{
				$_SESSION['lang'] = $ilSetting->get("language");
			}
			else
			{
				$_SESSION['lang'] = $langs[0];
			}
		}
		$_GET['lang'] = $_SESSION['lang'];
		
		$lng = new ilLanguage($_SESSION['lang']);
		$GLOBALS['lng'] =& $lng;
		$ilBench->stop("Core", "HeaderInclude_initLanguage");
		
		// TODO: another location
		global $rbacsystem;
		if(is_object($rbacsystem))
		{
			$rbacsystem->initMemberView();
		}

	}

	/**
	* $ilAccess and $rbac... initialisation
	*/
	function initAccessHandling()
	{
		global $ilBench, $rbacsystem, $rbacadmin, $rbacreview;

		$ilBench->start("Core", "HeaderInclude_initRBAC");
		$rbacreview = new ilRbacReview();
		$GLOBALS['rbacreview'] =& $rbacreview;

		$rbacsystem = ilRbacSystem::getInstance();
		$GLOBALS['rbacsystem'] =& $rbacsystem;

		$rbacadmin = new ilRbacAdmin();
		$GLOBALS['rbacadmin'] =& $rbacadmin;

		$ilAccess = new ilAccessHandler();
		$GLOBALS["ilAccess"] =& $ilAccess;
		$ilBench->stop("Core", "HeaderInclude_initRBAC");
	}


	/**
	* ilias initialisation
	* @param string $context this is used for circumvent redirects to the login page if called e.g. by soap
	*/
	function initILIAS($context = "web")
	{
		global $ilDB, $ilUser, $ilLog, $ilErr, $ilClientIniFile, $ilIliasIniFile,
			$ilSetting, $ilias, $https, $ilObjDataCache,
			$ilLog, $objDefinition, $lng, $ilCtrl, $ilBrowser, $ilHelp,
			$ilTabs, $ilMainMenu, $rbacsystem, $ilNavigationHistory;

		// remove unsafe characters
		$this->removeUnsafeCharacters();

		// error reporting
		// remove notices from error reporting
		if (version_compare(PHP_VERSION, '5.3.0', '>='))
		{
			error_reporting((ini_get("error_reporting") & ~E_NOTICE) & ~E_DEPRECATED);
		}
		else
		{
			error_reporting(ini_get('error_reporting') & ~E_NOTICE);
		}

		
		// include common code files
		$this->requireCommonIncludes();
		global $ilBench;

		// set error handler (to do: check preconditions for error handler to work)
		$ilBench->start("Core", "HeaderInclude_GetErrorHandler");
		$ilErr = new ilErrorHandling();
		$GLOBALS['ilErr'] =& $ilErr;
		$ilErr->setErrorHandling(PEAR_ERROR_CALLBACK,array($ilErr,'errorHandler'));
		$ilBench->stop("Core", "HeaderInclude_GetErrorHandler");


		// prepare file access to work with safe mode (has been done in class ilias before)
		umask(0117);
		
		// $ilIliasIniFile initialisation
		$this->initIliasIniFile();
		
		// CLIENT_ID determination
	        $this->determineClient();

		// $ilAppEventHandler initialisation
		$this->initEventHandling();

		// $ilClientIniFile initialisation
		$this->initClientIniFile();

		// $ilDB initialisation
		$this->initDatabase();

		// init plugin admin class
		include_once("./Services/Component/classes/class.ilPluginAdmin.php");
		$ilPluginAdmin = new ilPluginAdmin();
		$GLOBALS['ilPluginAdmin'] = $ilPluginAdmin;

		// set session handler
		$this->setSessionHandler();

		// $ilSetting initialisation
		$this->initSettings();


		// $ilLog initialisation
		$this->initLog();

		// $https initialisation
		require_once './classes/class.ilHTTPS.php';
		$https = new ilHTTPS();
		$GLOBALS['https'] =& $https;
		$https->enableSecureCookies();
		$https->checkPort();		
		
		if($this->returnBeforeAuth()) return;
		
		$ilCtrl = new ilCtrl2();
		$GLOBALS['ilCtrl'] =& $ilCtrl;

		// $ilAuth initialisation
		include_once("./Services/Authentication/classes/class.ilAuthUtils.php");
		ilAuthUtils::_initAuth();
		global $ilAuth;
		
		$this->includePhp5Compliance();

//echo get_class($ilAuth);
//var_dump($ilAuth);
		
		// Do not accept external session ids
		if (!ilSession::_exists(session_id()))
		{
//			$_GET["PHPSESSID"] = "";
			session_regenerate_id();
		}

		// $ilias initialisation
		global $ilias, $ilBench;
		$ilBench->start("Core", "HeaderInclude_GetILIASObject");
		$ilias = new ILIAS();
		$GLOBALS['ilias'] =& $ilias;
		$ilBench->stop("Core", "HeaderInclude_GetILIASObject");

		// test: trace function calls in debug mode
		if (DEVMODE)
		{
			if (function_exists("xdebug_start_trace"))
			{
				//xdebug_start_trace("/tmp/test.txt");
			}
		}

		// $ilObjDataCache initialisation
		$ilObjDataCache = new ilObjectDataCache();
		$GLOBALS['ilObjDataCache'] =& $ilObjDataCache;

		// workaround: load old post variables if error handler 'message' was called
		if (isset($_SESSION["message"]) && $_SESSION["message"])
		{
			$_POST = $_SESSION["post_vars"];
		}


		// put debugging functions here
		require_once "include/inc.debug.php";


		// $objDefinition initialisation
		$ilBench->start("Core", "HeaderInclude_getObjectDefinitions");
		$objDefinition = new ilObjectDefinition();
		$GLOBALS['objDefinition'] =& $objDefinition;
//		$objDefinition->startParsing();
		$ilBench->stop("Core", "HeaderInclude_getObjectDefinitions");

		// init tree
		$tree = new ilTree(ROOT_FOLDER_ID);
		$GLOBALS['tree'] =& $tree;

		// $ilAccess and $rbac... initialisation
		$this->initAccessHandling();

		// authenticate & start session
		PEAR::setErrorHandling(PEAR_ERROR_CALLBACK, array($ilErr, "errorHandler"));
		$ilBench->start("Core", "HeaderInclude_Authentication");
//var_dump($_SESSION);
		////require_once('Log.php');
		////$ilAuth->logger = Log::singleton('error_log',PEAR_LOG_TYPE_SYSTEM,'TEST');
                ////$ilAuth->enableLogging = true;
			
		if (!defined("IL_PHPUNIT_TEST"))
		{
			$oldSid = session_id();
			
			$ilAuth->start();
			
			$newSid = session_id();
			include_once './Services/Payment/classes/class.ilPaymentShoppingCart.php';	
			ilPaymentShoppingCart::_migrateShoppingCart($oldSid, $newSid);
			
		}

//var_dump($_SESSION);
		$ilias->setAuthError($ilErr->getLastError());
		$ilBench->stop("Core", "HeaderInclude_Authentication");

		// workaround: force login
		if ((isset($_GET["cmd"]) && $_GET["cmd"] == "force_login") || $this->script == "login.php")
		{
			$ilAuth->logout();
			if(!isset($_GET['forceShoppingCartRedirect']))
				$_SESSION = array();
			$_SESSION["AccountId"] = "";
			$ilAuth->start();
			$ilias->setAuthError($ilErr->getLastError());
		}

		// check correct setup
		if (!$ilias->getSetting("setup_ok"))
		{
			die("Setup is not completed. Please run setup routine again.");
		}

		// $ilUser initialisation (1)
		$ilBench->start("Core", "HeaderInclude_getCurrentUser");
		$ilUser = new ilObjUser();
		$ilias->account =& $ilUser;
		$GLOBALS['ilUser'] =& $ilUser;
		$ilBench->stop("Core", "HeaderInclude_getCurrentUser");

		// $ilCtrl initialisation
		//$ilCtrl = new ilCtrl();

		// determin current script and up-path to main directory
		// (sets $this->script and $this->updir)
		$this->determineScriptAndUpDir();

		// $styleDefinition initialisation and style handling for login and co.
		$this->initStyle();
		if (in_array($this->script,
			array("login.php", "register.php", "view_usr_agreement.php"))
			|| $_GET["baseClass"] == "ilStartUpGUI")
		{
			$this->handleStyle();
		}

		// init locale
		$this->initLocale();

		// handle ILIAS 2 imported users:
		// check ilias 2 password, if authentication failed
		// only if AUTH_LOCAL
//echo "A";
		if (AUTH_CURRENT == AUTH_LOCAL && !$ilAuth->getAuth() && $this->script == "login.php" && $_POST["username"] != "")
		{
			if (ilObjUser::_lookupHasIlias2Password(ilUtil::stripSlashes($_POST["username"])))
			{
				if (ilObjUser::_switchToIlias3Password(
					ilUtil::stripSlashes($_POST["username"]),
					ilUtil::stripSlashes($_POST["password"])))
				{
					$ilAuth->start();
					$ilias->setAuthError($ilErr->getLastError());
					ilUtil::redirect("index.php");
				}
			}
		}

//echo $_POST; exit;
		//
		// SUCCESSFUL AUTHENTICATION
		//

			
		if($ilAuth->getStatus() == '' &&
			$ilias->account->isCurrentUserActive() ||
			(defined("IL_PHPUNIT_TEST") && DEVMODE))
		{
//echo "C"; exit;
			$ilBench->start("Core", "HeaderInclude_getCurrentUserAccountData");
//var_dump($_SESSION);
			// get user data
			$this->initUserAccount();
			
//var_dump($_SESSION);
		
			
			// differentiate account security mode
			require_once('./Services/PrivacySecurity/classes/class.ilSecuritySettings.php');
			$security_settings = ilSecuritySettings::_getInstance();
			if( $security_settings->getAccountSecurityMode() ==
				ilSecuritySettings::ACCOUNT_SECURITY_MODE_CUSTOMIZED )
			{
				// reset counter for failed logins
				ilObjUser::_resetLoginAttempts( $ilUser->getId() );
			}

			$ilBench->stop("Core", "HeaderInclude_getCurrentUserAccountData");
		}
		else if(!$ilAuth->getAuth())
		{
			require_once('./Services/PrivacySecurity/classes/class.ilSecuritySettings.php');
			// differentiate account security mode
			$security = ilSecuritySettings::_getInstance();
			if( $security->getAccountSecurityMode() ==
				ilSecuritySettings::ACCOUNT_SECURITY_MODE_CUSTOMIZED )
			{
				if(isset($_POST['username']) && $_POST['username'] && $ilUser->getId() == 0)
				{
					$username = ilUtil::stripSlashes( $_POST['username'] );
					$usr_id = ilObjUser::_lookupId( $username );

					if( $usr_id != ANONYMOUS_USER_ID )
					{
						ilObjUser::_incrementLoginAttempts($usr_id);

						$login_attempts = ilObjUser::_getLoginAttempts( $usr_id );
						$max_attempts = $security->getLoginMaxAttempts();

						if( $login_attempts >= $max_attempts &&
							$usr_id != SYSTEM_USER_ID &&
							$max_attempts > 0 )
						{
							ilObjUser::_setUserInactive( $usr_id );
						}
					}
				}
			}
		}
		//
		// SUCCESSFUL AUTHENTICATED or NON-AUTH-AREA (Login, Registration, ...)
		//

		// $lng initialisation
		$this->initLanguage();

		// store user language in tree
		$GLOBALS['tree']->initLangCode();



		// ### AA 03.10.29 added new LocatorGUI class ###
		// when locator data array does not exist, initialise
		if ( !isset($_SESSION["locator_level"]) )
		{
			$_SESSION["locator_data"] = array();
			$_SESSION["locator_level"] = -1;
		}
		// initialise global ilias_locator object
				
		// ECS Tasks
	 	include_once('./Services/WebServices/ECS/classes/class.ilECSTaskScheduler.php');
	 	$scheduler = ilECSTaskScheduler::start();

		$ilBench->stop("Core", "HeaderInclude");
//		$ilBench->save();

	}

	/**
	* Initialisation for feed.php
	*/
	function initFeed()
	{
		global $ilDB, $ilUser, $ilLog, $ilErr, $ilClientIniFile, $ilIliasIniFile,
			$ilSetting, $ilias, $https, $ilObjDataCache,
			$ilLog, $objDefinition, $lng, $ilCtrl, $ilBrowser, $ilHelp,
			$ilTabs, $ilMainMenu, $rbacsystem, $ilNavigationHistory;

		// remove unsafe characters
		$this->removeUnsafeCharacters();

		// include common code files
		$this->requireCommonIncludes();
		global $ilBench;

		// $ilAppEventHandler initialisation
		$this->initEventHandling();

		// set error handler (to do: check preconditions for error handler to work)
		$ilBench->start("Core", "HeaderInclude_GetErrorHandler");
		$ilErr = new ilErrorHandling();
		$GLOBALS['ilErr'] =& $ilErr;
		$ilErr->setErrorHandling(PEAR_ERROR_CALLBACK,array($ilErr,'errorHandler'));
		$ilBench->stop("Core", "HeaderInclude_GetErrorHandler");

		// prepare file access to work with safe mode (has been done in class ilias before)
		umask(0117);

		// $ilIliasIniFile initialisation
		$this->initIliasIniFile();

		// CLIENT_ID determination
		$this->determineClient();

		// $ilClientIniFile initialisation
		if (!$this->initClientIniFile())
		{
			$c = $_COOKIE["ilClientId"];
			ilUtil::setCookie("ilClientId", $ilIliasIniFile->readVariable("clients","default"));
			echo ("Client $c does not exist. Please reload this page to return to the default client.");
			exit;
		}

		// maintenance mode
		$this->handleMaintenanceMode();

		// $ilDB initialisation
		$this->initDatabase();

		// init plugin admin class
		include_once("./Services/Component/classes/class.ilPluginAdmin.php");
		$ilPluginAdmin = new ilPluginAdmin();
		$GLOBALS['ilPluginAdmin'] = $ilPluginAdmin;

		// $ilObjDataCache initialisation
		$ilObjDataCache = new ilObjectDataCache();
		$GLOBALS['ilObjDataCache'] =& $ilObjDataCache;

		// init settings
		$this->initSettings();

		// init tree
		$tree = new ilTree(ROOT_FOLDER_ID);
		$GLOBALS['tree'] =& $tree;

		// init language
		$lng = new ilLanguage($ilClientIniFile->readVariable("language","default"));
		$GLOBALS['lng'] =& $lng;

	}

	function initLog() {
		global $ilLog;
		$log = new ilLog(ILIAS_LOG_DIR,ILIAS_LOG_FILE,CLIENT_ID,ILIAS_LOG_ENABLED,ILIAS_LOG_LEVEL);
		$GLOBALS['log'] = $log;
		$ilLog = $log;
		$GLOBALS['ilLog'] = $ilLog;
	}

	function initILIASObject() {
		global $ilias, $ilBench;
		$ilBench->start("Core", "HeaderInclude_GetILIASObject");
		$ilias = new ILIAS();
		$GLOBALS['ilias'] =& $ilias;
		$ilBench->stop("Core", "HeaderInclude_GetILIASObject");
//var_dump($_SESSION);
	}
}
?>
