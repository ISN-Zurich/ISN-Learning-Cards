<?php
    
    /* Copyright (c) 2013 ISN,ETH Zurich, GPL2, see docs/LICENSE */
    
    
    include_once("./Services/UIComponent/classes/class.ilUIHookPluginGUI.php");
    
    /**
     * TLA Mobler Cards Plugin
     *
     * @author Evangelia Mitsopoulou <evangelia.mitsopoulou@sipo.gess.ethz.ch>
     * @version $Id$
     *
     */
    class ilTLAMoblerCardsUIHookGUI extends ilUIHookPluginGUI
    {
        function getHTML($a_comp, $a_part, $a_par = array()) {
        
        // add things to the personal desktop overview
        if ($a_comp == "Services/PersonalDesktop" && $a_part == "center_column")
        {
         return array("mode" => ilUIHookPluginGUI::APPEND, "html" => '<p> This is a test example </p>');
        }
  
    
    return array("mode" => ilUIHookPluginGUI::KEEP, "html" => "");
           }
         }
     
?>

