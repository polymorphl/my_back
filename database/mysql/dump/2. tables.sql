--
-- Structure de la table `user`
--

CREATE TABLE `user` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT '',
  `password` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT '',
  `firstname` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  `lastname` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Structure de la table `user_settings`
--

CREATE TABLE `user_settings` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) unsigned NOT NULL COMMENT 'User ID - id',
  `language` varchar(255) NOT NULL COMMENT 'Language code',
  `reset_token` varchar(255) NULL COMMENT 'Reset token',
  `reset_token_expire` TIMESTAMP NULL COMMENT 'Reset Token Expire',
  `settings_push_notifications` int(11) NULL DEFAULT '0' COMMENT 'Binary mask',
  `created_at` datetime NOT NULL,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Structure de la table `push_configuration_web`
--

CREATE TABLE `push_configuration_web` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Configuration ID',
  `manufacturer` varchar(255) NOT NULL COMMENT 'Manufacturer',
  `useragent` varchar(255) NOT NULL COMMENT 'User-Agent',
  `platform` varchar(255) NOT NULL COMMENT 'OS Platform',
  `version` varchar(255) NOT NULL COMMENT 'OS Version',
  `bplatform` varchar(255) NOT NULL COMMENT 'Browser Platform',
  `bversion` varchar(255) NOT NULL COMMENT 'Browser Version',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Structure de la table `push_configuration_mobile`
--

CREATE TABLE `push_configuration_mobile` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Configuration ID',
  `model` varchar(255) NOT NULL COMMENT 'Device Model',
  `device_type` varchar(255) NOT NULL COMMENT 'Device Type',
  `os` varchar(255) NOT NULL COMMENT 'OS',
  `os_version` varchar(255) NOT NULL COMMENT 'OS Version',
  `sdk_version` varchar(255) NOT NULL COMMENT 'SDK Version',
  `manufacturer` varchar(255) NOT NULL COMMENT 'Manufacturer',
  `uuid` varchar(255) NOT NULL COMMENT 'UUID',
  `created_at` datetime NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


--
-- Structure de la table `push_active_devices`
--

CREATE TABLE `push_active_devices` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Device ID',
  `configuration_id` int(11) UNSIGNED NOT NULL,
  `configuration_type` int(11) UNSIGNED NOT NULL COMMENT '0: web; 1:mobile',
  `user_id` int(11) UNSIGNED NOT NULL,
  `token` varchar(255) NOT NULL COMMENT 'Firebase Token',
  `enable` int(11) UNSIGNED NOT NULL COMMENT 'Can receive?',
  `created_at` datetime NOT NULL,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


--
-- Structure de la table `push_tags`
--

CREATE TABLE `push_tags` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tag_name` varchar(255) NOT NULL,
  `tag_type` varchar(255) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


--
-- Structure de la table `push_links`
--

CREATE TABLE `push_tag_relations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tag_id` int(11) UNSIGNED NOT NULL,
  `user_id` int(11) UNSIGNED NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


--
-- Structure de la table `push_logs`
--

CREATE TABLE `push_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `text_key` varchar(255) NOT NULL COMMENT 'TT:i18n string (text translate)',
  `text_value` varchar(255) NOT NULL COMMENT 'TT:i18n values to interpolate (JSON format)',
  `target_type` varchar(255) NOT NULL COMMENT '0:tag; 1:user',
  `target_1` int(11) UNSIGNED NOT NULL,
  `target_2` int(11) UNSIGNED NULL,
  `target_3` int(11) UNSIGNED NULL,
  `target_4` int(11) UNSIGNED NULL,
  `target_5` int(11) UNSIGNED NULL,
  `response` text NOT NULL COMMENT 'Raw Response (JSON format)',
  `created_at` datetime NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


--
-- INDEXs
--
ALTER TABLE `user` ADD INDEX(`id`);
ALTER TABLE `user` ADD INDEX(`email`);
ALTER TABLE `push_active_devices` ADD INDEX(`user_id`);
ALTER TABLE `push_tag_relations` ADD INDEX(`user_id`);
ALTER TABLE `push_logs` ADD INDEX(`target_1`);
ALTER TABLE `push_logs` ADD INDEX(`target_2`);
ALTER TABLE `push_logs` ADD INDEX(`target_3`);
ALTER TABLE `push_logs` ADD INDEX(`target_4`);
ALTER TABLE `push_logs` ADD INDEX(`target_5`);
