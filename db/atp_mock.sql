/*
Navicat MySQL Data Transfer

Source Server         : 10.202.34.234
Source Server Version : 50719
Source Host           : 10.206.34.234:3306
Source Database       : atp

Target Server Type    : MYSQL
Target Server Version : 50719
File Encoding         : 65001

Date: 2019-07-15 12:13:40
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for atp_mock
-- ----------------------------
DROP TABLE IF EXISTS `atp_mock`;
CREATE TABLE `atp_mock` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `mock_name` varchar(128) DEFAULT NULL COMMENT '挡板名称',
  `mock_desc` varchar(255) DEFAULT NULL COMMENT '挡板描述',
  `req_url` varchar(255) DEFAULT NULL,
  `req_type` varchar(32) DEFAULT NULL COMMENT 'post,get',
  `resp_headers` varchar(255) DEFAULT NULL,
  `resp_type` varchar(32) DEFAULT NULL COMMENT 'text,file,json',
  `resp_time` bigint(20) DEFAULT NULL COMMENT '响应时间',
  `project_id` bigint(20) DEFAULT NULL COMMENT '所属项目',
  `enabled` tinyint(1) DEFAULT '1' COMMENT '是否启用',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `create_emp` varchar(64) DEFAULT NULL COMMENT '创建人',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '修改时间',
  `update_emp` varchar(64) DEFAULT NULL COMMENT '修改人',
  `delete_flag` tinyint(1) DEFAULT '0',
  `inf_cls_name` varchar(64) DEFAULT NULL,
  `inf_cls_impl_name` varchar(64) DEFAULT NULL,
  `inf_method` varchar(64) DEFAULT NULL,
  `inf_params` varchar(128) DEFAULT NULL,
  `run_environment` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `mock_index_id` (`id`),
  KEY `mock_index` (`id`,`req_url`)
) ENGINE=InnoDB AUTO_INCREMENT=77 DEFAULT CHARSET=utf8;
