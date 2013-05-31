<#1>

DROP TABLE IF EXISTS `ui_uihk_xmob_tracking`;
SET character_set_client = utf8;
CREATE TABLE `ui_uihk_xmob_tracking` (
                               `id` int(11) NOT NULL default '0',
                               `user_id` varchar(255) collate utf8_unicode_ci default NULL,
                               `uuid` varchar(255) collate utf8_unicode_ci default NULL,
                               `timestamp` bigint(20) default NULL,
                               `event_type` varchar(255) collate utf8_unicode_ci default NULL,
                               PRIMARY KEY  (`id`)
                               ) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;



DROP TABLE IF EXISTS `ui_uihk_xmob_auth`;
SET character_set_client = utf8;
CREATE TABLE `ui_uihk_xmob_auth` (
                                `user_id` varchar(255) collate utf8_unicode_ci default NULL,
                                `client_key` varchar(255) collate utf8_unicode_ci default NULL,
                                `session_key` varchar(255) collate utf8_unicode_ci default NULL
                                ) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;




DROP TABLE IF EXISTS `ui_uihk_xmob_reg`;
SET character_set_client = utf8;
CREATE TABLE `ui_uihk_xmob_reg` (
                               `app_id` varchar(255) collate utf8_unicode_ci default NULL,
                               `uuid` varchar(255) collate utf8_unicode_ci default NULL,
                               `client_key` varchar(255) collate utf8_unicode_ci default NULL
                               ) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;



DROP TABLE IF EXISTS `ui_uihk_xmob_stat_sec`;
SET character_set_client = utf8;
CREATE TABLE `ui_uihk_xmob_stat_sec` (
                                     `sequence` int(11) NOT NULL auto_increment,
                                     PRIMARY KEY  (`sequence`)
                                     ) ENGINE=MyISAM AUTO_INCREMENT=138693 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;




DROP TABLE IF EXISTS `ui_uihk_xmob_stat`;
SET character_set_client = utf8;
CREATE TABLE `ui_uihk_xmob_stat` (
                                 `id` int(11) NOT NULL default '0',
                                 `user_id` varchar(255) collate utf8_unicode_ci default NULL,
                                 `uuid` varchar(255) collate utf8_unicode_ci default NULL,
                                 `course_id` varchar(255) collate utf8_unicode_ci default NULL,
                                 `question_id` varchar(255) collate utf8_unicode_ci default NULL,
                                 `day` bigint(20) default NULL,
                                 `score` double default NULL,
                                 `duration` int(11) default NULL,
                                 PRIMARY KEY  (`id`)
                                 ) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;



DROP TABLE IF EXISTS `ui_uihk_xmob_trackingseq`;
SET character_set_client = utf8;
CREATE TABLE `ui_uihk_xmob_trackingseq` (
                                   `sequence` int(11) NOT NULL auto_increment,
                                   PRIMARY KEY  (`sequence`)
                                   ) ENGINE=MyISAM AUTO_INCREMENT=1279370 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
