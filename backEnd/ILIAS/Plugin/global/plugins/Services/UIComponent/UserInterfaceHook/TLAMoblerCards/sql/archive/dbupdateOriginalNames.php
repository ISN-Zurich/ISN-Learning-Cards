<#1>
<?php
    
    if ($ilDB->tableExists('ui_uihk_xmob_isnlc_tracking'))
	{
		$ilDB->dropTable('ui_uihk_xmob_isnlc_tracking');
	}

    
    $fields = array(
                    'id' => array (
                                   'type' => 'integer',
                                   'length' => 11,
                                   'default' => 0
                                   ),
                    'user_id' => array (
                                        'type' => 'varchar',
                                        'length' => 255,
                                        'default' => NULL
                                        ),
                    'uuid' => array (
                                   'type' => 'varchar',
                                   'length' => 255,
                                   'default' => NULL
                                   ),
                    'timestamp' => array (
                                       'type' => 'integer',
                                       'length' => 20,
                                       'default' => NULL
                                       ),
                    'event_type' => array (
                                           'type' => 'varchar',
                                           'length' => 255,
                                           'default' => NULL
                                           )
                    );
    $ilDB->createTable("ui_uihk_xmob_isnlc_tracking", $fields);
    $ilDB->addPrimaryKey("ui_uihk_xmob_isnlc_tracking", array("id"));
    $ilDB->createSequence('ui_uihk_xmob_isnlc_tracking');
    ?>
<#2>
<?php
    
    if ($ilDB->tableExists('ui_uihk_xmob_isnlc_auth_info'))
	{
		$ilDB->dropTable('ui_uihk_xmob_isnlc_auth_info');
	}
    
    $fields = array(
                    'user_id' => array (
                                   'type' => 'varchar',
                                   'length' => 255,
                                   'default' => NULL
                                   ),
                    'client_key' => array (
                                     'type' => 'varchar',
                                     'length' => 255,
                                     'default' => NULL
                                     ),
                    'session_key' => array (
                                   'type' => 'varchar',
                                   'length' => 255,
                                   'default' => NULL
                                   )
                    );
    $ilDB->createTable("ui_uihk_xmob_isnlc_reg_info", $fields);
    $ilDB->createSequence('ui_uihk_xmob_isnlc_reg_info');
?>
<#3>
<?php
    if ($ilDB->tableExists('ui_uihk_xmob_isnlc_auth_info'))
	{
		$ilDB->dropTable('ui_uihk_xmob_isnlc_auth_info');
	}
    
    $fields = array(
                    'app_id' => array (
                                   'type' => 'varchar',
                                   'length' => 255,
                                   'default' => NULL
                                   ),
                    'uuid' => array (
                                     'type' => 'varchar',
                                     'length' => 255,
                                     'default' => NULL
                                     ),
                    'client_key' => array (
                                     'type' => 'varchar',
                                     'length' => 255,
                                     'default' => NULL
                                     )
                    );
    $ilDB->createTable("ui_uihk_xmob_isnlc_reg_info", $fields);
    $ilDB->createSequence('ui_uihk_xmobu_isnlc_reg_info');
    ?>

<#4>
<?php
    
    if ($ilDB->tableExists('ui_uihk_xmob_isnlc_statistics_seq'))
	{
		$ilDB->dropTable('ui_uihk_xmob_isnlc_statistics_seq');
	}
    
    $fields = array(
                    'sequence' => array (
                                       'type' => 'integer',
                                       'length' => 11,
                                       'notnull' => true
                                       )
                    );
    $ilDB->createTable("ui_uihk_xmob_isnlc_statistics_seq", $fields);
    $ilDB->addPrimaryKey("ui_uihk_xmob_isnlc_tracking", array("sequence"));
    $ilDB->createSequence('ui_uihk_xmob_isnlc_statistics_seq');
    ?>



<#5>
<?php
    
    if ($ilDB->tableExists('ui_uihk_xmob_isnlc_statistics'))
	{
		$ilDB->dropTable('ui_uihk_xmob_isnlc_statistics');
	}
    
    $fields = array(
                    'id' => array (
                                     'type' => 'integer',
                                     'length' => 11,
                                     'notnull' => true,
                                     'default' => 0
                                    ),
                    'user_id' => array (
                                   'type' => 'varchar',
                                   'length' => 255,
                                   'default' => NULL
                                   ),
                    'uuid' => array (
                                        'type' => 'varchar',
                                        'length' => 255,
                                        'default' => NULL
                                        ),
                    'course_id' => array (
                                     'type' => 'varchar',
                                     'length' => 255,
                                     'default' => NULL
                                     ),
                    'question_id' => array (
                                          'type' => 'varchar',
                                          'length' => 255,
                                          'default' => NULL
                                          ),
                    'day' => array (
                                            'type' => 'integer',
                                            'length' => 20,
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
    
    $ilDB->createTable("ui_uihk_xmob_isnlc_tracking_seq", $fields);
    $ilDB->addPrimaryKey("ui_uihk_xmob_isnlc_tracking_seq", array("id"));
    $ilDB->createSequence('ui_uihk_xmob_isnlc_statistics');
    ?>


<#6>
<?php
    
    if ($ilDB->tableExists('ui_uihk_xmob_isnlc_statistics'))
	{
		$ilDB->dropTable('ui_uihk_xmob_isnlc_statistics');
	}
    
    $fields = array(
                    'sequence' => array (
                                         'type' => 'integer',
                                         'length' => 11,
                                         'notnull' => true
                                         )
                    );
    $ilDB->createTable("ui_uihk_xmob_isnlc_tracking_seq", $fields);
    $ilDB->addPrimaryKey("ui_uihk_xmob_isnlc_tracking_seq", array("sequence"));
    $ilDB->createSequence('ui_uihk_xmob_isnlc_statistics_seq');
    ?>
