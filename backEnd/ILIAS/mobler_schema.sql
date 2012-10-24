-- Table structure for table `isnlc_tracking`
--

DROP TABLE IF EXISTS `isnlc_tracking`;
SET character_set_client = utf8;
CREATE TABLE `isnlc_tracking` (
  `id` int(11) NOT NULL default '0',
  `user_id` varchar(255) collate utf8_unicode_ci default NULL,
  `uuid` varchar(255) collate utf8_unicode_ci default NULL,
  `timestamp` bigint(20) default NULL,
  `event_type` varchar(255) collate utf8_unicode_ci default NULL,
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Table structure for table `isnlc_auth_info`
--

DROP TABLE IF EXISTS `isnlc_auth_info`;
SET character_set_client = utf8;
CREATE TABLE `isnlc_auth_info` (
  `user_id` varchar(255) collate utf8_unicode_ci default NULL,
  `client_key` varchar(255) collate utf8_unicode_ci default NULL,
  `session_key` varchar(255) collate utf8_unicode_ci default NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;


--
-- Table structure for table `isnlc_reg_info`
--

DROP TABLE IF EXISTS `isnlc_reg_info`;
SET character_set_client = utf8;
CREATE TABLE `isnlc_reg_info` (
  `app_id` varchar(255) collate utf8_unicode_ci default NULL,
  `uuid` varchar(255) collate utf8_unicode_ci default NULL,
  `client_key` varchar(255) collate utf8_unicode_ci default NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Table structure for table `isnlc_statistics_seq`
--

DROP TABLE IF EXISTS `isnlc_statistics_seq`;
SET character_set_client = utf8;
CREATE TABLE `isnlc_statistics_seq` (
  `sequence` int(11) NOT NULL auto_increment,
  PRIMARY KEY  (`sequence`)
) ENGINE=MyISAM AUTO_INCREMENT=138693 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;


--
-- Table structure for table `isnlc_statistics`
--

DROP TABLE IF EXISTS `isnlc_statistics`;
SET character_set_client = utf8;
CREATE TABLE `isnlc_statistics` (
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

--
-- Table structure for table `isnlc_tracking_seq`
--

DROP TABLE IF EXISTS `isnlc_tracking_seq`;
SET character_set_client = utf8;
CREATE TABLE `isnlc_tracking_seq` (
  `sequence` int(11) NOT NULL auto_increment,
  PRIMARY KEY  (`sequence`)
) ENGINE=MyISAM AUTO_INCREMENT=1279370 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
