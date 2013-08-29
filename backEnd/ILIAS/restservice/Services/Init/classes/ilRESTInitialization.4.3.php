<?php
    
    // needed for slow queries, etc.
    if(!isset($GLOBALS['ilGlobalStartTime']) || !$GLOBALS['ilGlobalStartTime'])
    {
        $GLOBALS['ilGlobalStartTime'] = microtime();
    }
    
    include_once "Services/Context/classes/class.ilContext.php";
    
    require_once('Services/Init/classes/class.ilInitialization.php');
    
    class ilRESTInitialization extends ilInitialization {
    
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
            
            self::initGlobal("ilBench", "ilBenchmark", "./Services/Utilities/classes/class.ilBenchmark.php");				
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
                self::abortAndDie("Fatal Error: ilInitialisation::determineClient called without initialisation of ILIAS ini file object.");
            }
            
           
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
        protected static function initClientIniFile()
        {
            global $ilIliasIniFile;
            
            // check whether ILIAS_WEB_DIR is set.
            if (ILIAS_WEB_DIR == "")
            {
                self::abortAndDie("Fatal Error: ilInitialisation::initClientIniFile called without ILIAS_WEB_DIR.");
            }
            
            // check whether CLIENT_ID is set.
            if (CLIENT_ID == "")
            {
                self::abortAndDie("Fatal Error: ilInitialisation::initClientIniFile called without CLIENT_ID.");
            }
            
            $ini_file = "./".ILIAS_WEB_DIR."/".CLIENT_ID."/client.ini.php";
            
            // get settings from ini file
            require_once("./Services/Init/classes/class.ilIniFile.php");
            $ilClientIniFile = new ilIniFile($ini_file);
            $ilClientIniFile->read();
            
            // invalid client id / client ini
           // if ($ilClientIniFile->ERROR != "")
           // {
                //removed cookies-related code from here
             //   self::abortAndDie("Invalid client");
            //}
            
            self::initGlobal("ilClientIniFile", $ilClientIniFile);
            
            // set constants
            define ("SESSION_REMINDER_LEADTIME", 30);
            define ("DEBUG",$ilClientIniFile->readVariable("system","DEBUG"));
            define ("DEVMODE",$ilClientIniFile->readVariable("system","DEVMODE"));
            define ("SHOWNOTICES",$ilClientIniFile->readVariable("system","SHOWNOTICES"));
            define ("ROOT_FOLDER_ID",$ilClientIniFile->readVariable('system','ROOT_FOLDER_ID'));
            define ("SYSTEM_FOLDER_ID",$ilClientIniFile->readVariable('system','SYSTEM_FOLDER_ID'));
            define ("ROLE_FOLDER_ID",$ilClientIniFile->readVariable('system','ROLE_FOLDER_ID'));
            define ("MAIL_SETTINGS_ID",$ilClientIniFile->readVariable('system','MAIL_SETTINGS_ID'));
            
            // this is for the online help installation, which sets OH_REF_ID to the
            // ref id of the online module
            define ("OH_REF_ID",$ilClientIniFile->readVariable("system","OH_REF_ID"));
            
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
         * Init user with current account id
         */
        public static function initUserAccount()
        {
            global $ilUser;
            
            // get user id
            if (!ilSession::get("AccountId"))
            {
                ilSession::set("AccountId", $ilUser->checkUserId());
            }
            
            $uid = ilSession::get("AccountId");
            if($uid)
            {
                $ilUser->setId($uid);
                $ilUser->read();
                
            }
            else
            {
                if(is_object($GLOBALS['ilLog']))
                {
                    $GLOBALS['ilLog']->logStack();
                }
                self::abortAndDie("Init user account failed");
            }
        }
        
        
        /**
         * go to public section
         *
         * @param int $a_auth_stat
         */
        public static function goToPublicSection($a_auth_stat = "")
        {
            global $ilAuth;
            
            if (ANONYMOUS_USER_ID == "")
            {
                self::abortAndDie("Public Section enabled, but no Anonymous user found.");
            }
            
            // logout and end previous session
            if($a_auth_stat == AUTH_EXPIRED ||
               $a_auth_stat == AUTH_IDLED)
            {
                ilSession::setClosingContext(ilSession::SESSION_CLOSE_EXPIRE);
            }
            else
            {
                ilSession::setClosingContext(ilSession::SESSION_CLOSE_PUBLIC);
            }
            $ilAuth->logout();
            session_unset();
            session_destroy();
            
            // new session and login as anonymous
            self::setSessionHandler();
            session_start();
            $_POST["username"] = "anonymous";
            $_POST["password"] = "anonymous";
            ilAuthUtils::_initAuth();
            
            // authenticate (anonymous)
            $oldSid = session_id();
            $ilAuth->start();
            if (IS_PAYMENT_ENABLED)
            {
                $newSid = session_id();
                if($oldSid != $newSid)
                {
                    include_once './Services/Payment/classes/class.ilPaymentShoppingCart.php';
                    ilPaymentShoppingCart::_migrateShoppingCart($oldSid, $newSid);
                }
            }
            
            if (!$ilAuth->getAuth())
            {
                self::abortAndDie("ANONYMOUS user with the object_id ".ANONYMOUS_USER_ID." not found!");
            }
            
            self::initUserAccount();
            
            
        }
        
        /**
         * ilias initialisation
         */
        public static function initILIAS()
        {
            global $tree;
            
            self::initCore();
            
            if(ilContext::initClient())
            {
                self::initClient();
                
                if (ilContext::hasUser())
                {
                    self::initUser();
                    
                    if(ilContext::doAuthentication())
                    {
                        self::authenticate();
                    }
                }
                
                // init after Auth otherwise breaks CAS
                self::includePhp5Compliance();
                
                // language may depend on user setting
                self::initLanguage();
                $tree->initLangCode();
                
                if(ilContext::hasHTML())
                {													
                    include_once('./Services/WebServices/ECS/classes/class.ilECSTaskScheduler.php');
                    ilECSTaskScheduler::start();					
                    
                }							
            }					
        }

        
        /**
         * Init core objects (level 0)
         */
        protected static function initCore()
        {
            global $ilErr;
            
            // remove notices from error reporting
            if (version_compare(PHP_VERSION, '5.4.0', '>='))
            {
                // Prior to PHP 5.4.0 E_ALL does not include E_STRICT.
                // With PHP 5.4.0 and above E_ALL >DOES< include E_STRICT.
                
                error_reporting(((ini_get("error_reporting") & ~E_NOTICE) & ~E_DEPRECATED) & ~E_STRICT);
            }
            elseif (version_compare(PHP_VERSION, '5.3.0', '>='))
            {
                error_reporting((ini_get("error_reporting") & ~E_NOTICE) & ~E_DEPRECATED);
            }
            else
            {
                error_reporting(ini_get('error_reporting') & ~E_NOTICE);
            }
            // breaks CAS: must be included after CAS context isset in AuthUtils
            //self::includePhp5Compliance();
            
            self::requireCommonIncludes();
            
            
            // error handler
            self::initGlobal("ilErr", "ilErrorHandling",
                             "./Services/Init/classes/class.ilErrorHandling.php");
            $ilErr->setErrorHandling(PEAR_ERROR_CALLBACK, array($ilErr, 'errorHandler'));
            
            // :TODO: obsolete?
            PEAR::setErrorHandling(PEAR_ERROR_CALLBACK, array($ilErr, "errorHandler"));
            
            // workaround: load old post variables if error handler 'message' was called
            include_once "Services/Authentication/classes/class.ilSession.php";
            if (ilSession::get("message"))
            {
                $_POST = ilSession::get("post_vars");
            }
            
            self::removeUnsafeCharacters();
            
            
            self::initIliasIniFile();		
            
            
            // deprecated
            self::initGlobal("ilias", "ILIAS", "./Services/Init/classes/class.ilias.php");				
        }
        
        
        /**
         * Init client-based objects (level 1)
         */
        protected static function initClient()
        {
            global $https, $ilias;
            
                      
            self::initClientIniFile();
            
            
            // --- needs client ini
            
            $ilias->client_id = CLIENT_ID;
            
                      
            self::initLog();
            
            self::handleMaintenanceMode();
            
            self::initDatabase();
            
            
            // --- needs database
            
            self::initGlobal("ilAppEventHandler", "ilAppEventHandler",
                             "./Services/EventHandling/classes/class.ilAppEventHandler.php");
            
            // there are rare cases where initILIAS is called twice for a request
            // example goto.php is called and includes ilias.php later
            // we must prevent that ilPluginAdmin is initialized twice in
            // this case, since this won't get the values out of plugin.php the
            // second time properly
            if (!is_object($GLOBALS["ilPluginAdmin"]))
            {
                self::initGlobal("ilPluginAdmin", "ilPluginAdmin",
                                 "./Services/Component/classes/class.ilPluginAdmin.php");
            }
            
            self::setSessionHandler();
            
            self::initSettings();
            
            
            // --- needs settings
            
            self::initLocale();
            
            if(ilContext::usesHTTP())
            {
                // $https
                self::initGlobal("https", "ilHTTPS", "./Services/Http/classes/class.ilHTTPS.php");
                $https->enableSecureCookies();
                $https->checkPort();
            }
            
            
            // --- object handling		
            
            self::initGlobal("ilObjDataCache", "ilObjectDataCache",
                             "./Services/Object/classes/class.ilObjectDataCache.php");
            
            // needed in ilObjectDefinition
            require_once "./Services/Xml/classes/class.ilSaxParser.php";
            
            self::initGlobal("objDefinition", "ilObjectDefinition",
                             "./Services/Object/classes/class.ilObjectDefinition.php");
            
            // $tree
            require_once "./Services/Tree/classes/class.ilTree.php";
            $tree = new ilTree(ROOT_FOLDER_ID);
            self::initGlobal("tree", $tree);
            unset($tree);
            
            self::initGlobal("ilCtrl", "ilCtrl",
                             "./Services/UICore/classes/class.ilCtrl.php");
        }
        
        
        /**
         * Init user / authentification (level 2)
         */
        protected static function initUser()
        {
            global $ilias, $ilAuth, $ilUser;
            
                      
            // $ilAuth
            require_once "Auth/Auth.php";
            require_once "./Services/AuthShibboleth/classes/class.ilShibboleth.php";
            include_once("./Services/Authentication/classes/class.ilAuthUtils.php");
            ilAuthUtils::_initAuth();
            $ilias->auth = $ilAuth;
            
            // $ilUser
            self::initGlobal("ilUser", "ilObjUser",
                             "./Services/User/classes/class.ilObjUser.php");
            $ilias->account =& $ilUser;
            
            self::initAccessHandling();
            
            
            // force login
            if ((isset($_GET["cmd"]) && $_GET["cmd"] == "force_login"))
            {
                $ilAuth->logout();
                
                // we need to do this for the session statistics
                // could we use session_destroy() instead?
                // [this is done after every $ilAuth->logout() call elsewhere] 
                ilSession::_destroy(session_id(), ilSession::SESSION_CLOSE_LOGIN);
                
                // :TODO: keep session because of cart content?
                if(!isset($_GET['forceShoppingCartRedirect']))
                {
                    $_SESSION = array();
                }
                else
                {
                    ilSession::set("AccountId", "");	
                }
            }		
            
        }
        
        /**
         * Try authentication
         *
         * This will basically validate the current session
         */
        protected static function authenticate()
        {
            global $ilAuth, $ilias, $ilErr;
            
            $current_script = substr(strrchr($_SERVER["PHP_SELF"], "/"), 1);
            
                       
            $oldSid = session_id();
            
            $ilAuth->start();
            $ilias->setAuthError($ilErr->getLastError());
            
            if(IS_PAYMENT_ENABLED)
            {
                // cart is "attached" to session, has to be updated
                $newSid = session_id();
                if($oldSid != $newSid)
                {
                    include_once './Services/Payment/classes/class.ilPaymentShoppingCart.php';
                    ilPaymentShoppingCart::_migrateShoppingCart($oldSid, $newSid);
                }
            }
            
            if($ilAuth->getAuth() && $ilAuth->getStatus() == '')
            {
                self::initUserAccount();
                
               
            }
        }
        
        //EMPTY FUNCTIONS
    
    function handleMaintenanceMode() {}
    function setCookieParams() {}
    function checkUserAgreement() {}
    function goToLogin($a_auth_stat="") {}
    function handleDevMode(){}
    function initHTML(){}
    function handleAuthenticationSuccess(){}
    function handleAuthenticationFail(){}
    function getCurrentCmd(){}
    function blockedAuthentication(){}
    function showingLoginForm((){}
    function redirect(){}
                              
    }
?>