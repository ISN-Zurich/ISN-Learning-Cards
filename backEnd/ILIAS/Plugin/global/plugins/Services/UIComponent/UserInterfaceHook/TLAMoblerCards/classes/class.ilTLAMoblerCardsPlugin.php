<?php
    
    /* Copyright (c) 2013 ISN,ETH Zurich, GPL2, see docs/LICENSE */
    
    
    include_once("./Services/UIComponent/classes/class.ilUserInterfaceHookPlugin.php");
    
    /**
     * TLA Mobler Cards Plugin
     *
     * @author Evangelia Mitsopoulou <evangelia.mitsopoulou@sipo.gess.ethz.ch>
     * @version $Id$
     *
     */
    class ilTLAMoblerCardsPlugin extends ilUserInterfaceHookPlugin
    {
        function getPluginName()
        {
            return "TLAMoblerCards";
        }
    }
    
?>