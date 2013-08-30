<?php

require_once('Services/Init/classes/class.ilInitialisation.php');
// needed for slow queries, etc.
if(!isset($GLOBALS['ilGlobalStartTime']) || !$GLOBALS['ilGlobalStartTime'])
{
	$GLOBALS['ilGlobalStartTime'] = microtime();
}

include_once "Services/Context/classes/class.ilContext.php";



class ilRESTInitialization extends ilInitialisation
{

	// WRITE HERE MODIFIED CODE FOR ILIAS 4.3

	/**
	 * get common include code files
	 */
	protected static function requireCommonIncludes()
	{
		// pear
		require_once("include/inc.get_pear.php");
		require_once("include/inc.check_pear.php");
		require_once "PEAR.php";


		// really always required?
		require_once "./Services/Utilities/classes/class.ilUtil.php";
		require_once "./Services/Utilities/classes/class.ilFormat.php";
		require_once "./Services/Calendar/classes/class.ilDatePresentation.php";
		require_once "include/inc.ilias_version.php";

		static::initGlobal("ilBench", "ilBenchmark", "./Services/Utilities/classes/class.ilBenchmark.php");
	}



	/**
	 * This method determines the current client and sets the
	 * constant CLIENT_ID.
	 */
	protected static function determineClient()
	{
		global $ilIliasIniFile;

		// check whether ini file object exists
		if (!is_object($ilIliasIniFile))
		{
			static::abortAndDie("Fatal Error: ilInitialisation::determineClient called without initialisation of ILIAS ini file object.");
		}

		$client_id = $ilIliasIniFile->readVariable("clients","default");
		define ("CLIENT_ID", $client_id);
	}

	/**
	 * ilias initialisation
	 */
	public static function initILIAS()
	{
		global $tree;

		static::initCore();

		if(ilContext::initClient())
		{
			static::initClient();

			if (ilContext::hasUser())
			{
				static::initUser();

				if(ilContext::doAuthentication())
				{
					static::authenticate();
				}
			}

			// init after Auth otherwise breaks CAS
			static::includePhp5Compliance();

			// language may depend on user setting
			static::initLanguage();
			$tree->initLangCode();

			//if(ilContext::hasHTML())
			//{
			//	include_once('./Services/WebServices/ECS/classes/class.ilECSTaskScheduler.php');
			//	ilECSTaskScheduler::start();
			//}
		}
	}

	//EMPTY FUNCTIONs

	protected static function handleMaintenanceMode() {
	}
	protected static function setCookieParams() {
	}
	protected static function checkUserAgreement() {
	}
	protected static function goToLogin($a_auth_stat="") {
	}
	protected static function handleDevMode(){
	}
	protected static function initHTML(){
	}
	protected static function handleAuthenticationSuccess(){
	}
	protected static function handleAuthenticationFail(){
	}
	protected static function getCurrentCmd(){
	}
	protected static function showingLoginForm($a_current_script){
	}
	protected static function redirect(){
	}
	protected static function abortAndDie($a_message) {
		// We should return a proper error code and never a 500!
		if(is_object($GLOBALS['ilLog']))
		{
			$GLOBALS['ilLog']->write("Fatal Error: ilInitialisation - ".$a_message);
		}
	} 
	
	protected static function blockedAuthentication() {
		// we do service level authentication using OAuth
		return true;
	}
}
?>