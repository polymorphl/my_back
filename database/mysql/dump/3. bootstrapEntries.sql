--
-- Tags examples
--

--
-- INSERT INTO `push_tags` (`id`, `tag_name`, `tag_type`) VALUES (NULL, 'explorer', 'class');
-- INSERT INTO `push_tags` (`id`, `tag_name`, `tag_type`) VALUES (NULL, 'dev_gods', 'alliance');
-- INSERT INTO `push_tags` (`id`, `tag_name`, `tag_type`) VALUES (NULL, 'vip_2016', 'custom');
--

--
-- Links examples
--
-- INSERT INTO `push_links` (`id`, `tag_id`, `user_id`) VALUES (NULL, '1', '3200');
-- INSERT INTO `push_links` (`id`, `tag_id`, `user_id`) VALUES (NULL, '1', '13484');
-- INSERT INTO `push_links` (`id`, `tag_id`, `user_id`) VALUES (NULL, '2', '13484');

--
-- Logs examples
--
-- INSERT INTO `push_logs` (`id`, `text_key`, `text_value`, `target_type`, `target_id`, `target_token`, `response`) VALUES (NULL, 'ally.townhall_tax', '\'{"token":2500}\'', '1', '13484', 'fgi-5wotxhc:APA91bH_-u_pNwcNYrlj53o1lD_fs3KfZmlOn-vWSSApXg7z6dRycmruGwXZ5uiAUNjP-lpvBG9Ak4oQb5f_j3Pj1KqqOY-iB0FeRHLuEqGIwspQjjocKoVQZ-MMULg-WxOg4jFSdTY4', '\'{\\"multicast_id\\":5570728685105363000,\\"success\\":1,\\"failure\\":0,\\"canonical_ids\\":0,\\"results\\":[{\\"message_id\\":\\"0:1488362617213714%ebddacaeebddacae\\"}]}\'');
