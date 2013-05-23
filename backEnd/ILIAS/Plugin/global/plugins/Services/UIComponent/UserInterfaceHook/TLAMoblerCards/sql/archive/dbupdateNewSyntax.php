<#1>
<?php
    
    if ($ilDB->tableExists('ui_uihk_xmob_tracking'))
	{
		$ilDB->dropTable('ui_uihk_xmob_tracking');
	}

    
    $fields = array(
                    'id' => array (
                                   'type' => 'integer',
                                   'length' => 8,
                                   'default' => 0
                                   ),
                    'user_id' => array (
                                        'type' => 'text',
                                        'length' => 255,
                                        'default' => NULL
                                        ),
                    'uuid' => array (
                                   'type' => 'text',
                                   'length' => 255,
                                   'default' => NULL
                                   ),
                    'timestamp' => array (
                                       'type' => 'integer',
                                       'length' => 8,
                                       'default' => NULL
                                       ),
                    'event_type' => array (
                                           'type' => 'text',
                                           'length' => 255,
                                           'default' => NULL
                                           )
                    );
    $ilDB->createTable("ui_uihk_xmob_tracking", $fields);
    $ilDB->addPrimaryKey("ui_uihk_xmob_tracking", array("id"));
    $ilDB->createSequence('ui_uihk_xmob_isnlc_tracking');
    ?>
<#2>
<?php
    
    if ($ilDB->tableExists('ui_uihk_xmob_auth'))
	{
		$ilDB->dropTable('ui_uihk_xmob_auth');
	}
    
    $fields = array(
                    'user_id' => array (
                                   'type' => 'text',
                                   'length' => 255,
                                   'default' => NULL
                                   ),
                    'client_key' => array (
                                     'type' => 'text',
                                     'length' => 255,
                                     'default' => NULL
                                     ),
                    'session_key' => array (
                                   'type' => 'text',
                                   'length' => 255,
                                   'default' => NULL
                                   )
                    );
    $ilDB->createTable("ui_uihk_xmob_auth", $fields);
    $ilDB->createSequence('ui_uihk_xmob_auth');
?>
<#3>
<?php
    if ($ilDB->tableExists('ui_uihk_xmob_reg'))
	{
		$ilDB->dropTable('ui_uihk_xmob_reg');
	}
    
    $fields = array(
                    'app_id' => array (
                                   'type' => 'text',
                                   'length' => 255,
                                   'default' => NULL
                                   ),
                    'uuid' => array (
                                     'type' => 'text',
                                     'length' => 255,
                                     'default' => NULL
                                     ),
                    'client_key' => array (
                                     'type' => 'text',
                                     'length' => 255,
                                     'default' => NULL
                                     )
                    );
    $ilDB->createTable("ui_uihk_xmob_reg", $fields);
    $ilDB->createSequence('ui_uihk_xmobu_reg');
    ?>

<#4>
<?php
    
    if ($ilDB->tableExists('ui_uihk_xmob_stat_sec'))
	{
		$ilDB->dropTable('ui_uihk_xmob_stat_sec');
	}
    
    $fields = array(
                    'sequence' => array (
                                       'type' => 'integer',
                                       'length' => 8,
                                       'notnull' => true
                                       )
                    );
    $ilDB->createTable("ui_uihk_xmob_stat_sec", $fields);
    $ilDB->addPrimaryKey("ui_uihk_xmob_stat_sec", array("sequence"));
    $ilDB->createSequence('ui_uihk_xmob_statistics_seq');
    ?>



<#5>
<?php
    
    if ($ilDB->tableExists('ui_uihk_xmob_stat'))
	{
		$ilDB->dropTable('ui_uihk_xmob_stat');
	}
    
    $fields = array(
                    'id' => array (
                                     'type' => 'integer',
                                     'length' => 8,
                                     'notnull' => true,
                                     'default' => 0
                                    ),
                    'user_id' => array (
                                   'type' => 'text',
                                   'length' => 255,
                                   'default' => NULL
                                   ),
                    'uuid' => array (
                                        'type' => 'text',
                                        'length' => 255,
                                        'default' => NULL
                                        ),
                    'course_id' => array (
                                     'type' => 'text',
                                     'length' => 255,
                                     'default' => NULL
                                     ),
                    'question_id' => array (
                                          'type' => 'text',
                                          'length' => 255,
                                          'default' => NULL
                                          ),
                    'day' => array (
                                            'type' => 'integer',
                                            'length' => 8,
                                            'default' => NULL
                                            ),
                    'score' => array (
                                    'type' => 'double',
                                     'default' => NULL
                                    ),
                    'duration' => array (
                                      'type' => 'integer',
                                      'default' => NULL
                                      )
                    );
    
    $ilDB->createTable("ui_uihk_xmob_stat", $fields);
    $ilDB->addPrimaryKey("ui_uihk_xmob_stat", array("id"));
    $ilDB->createSequence('ui_uihk_xmob_isnlc_statistics');
    ?>


<#6>
<?php
    
    if ($ilDB->tableExists('ui_uihk_xmob_trackingseq'))
	{
		$ilDB->dropTable('ui_uihk_xmob_trackingseq');
	}
    
    $fields = array(
                    'sequence' => array (
                                         'type' => 'integer',
                                         'length' => 8,
                                         'notnull' => true
                                         )
                    );
    $ilDB->createTable("ui_uihk_xmob_trackseq", $fields);
    $ilDB->addPrimaryKey("ui_uihk_xmob_trackseq", array("sequence"));
    $ilDB->createSequence('ui_uihk_xmob_isnlc_statistics_seq');
    ?>
