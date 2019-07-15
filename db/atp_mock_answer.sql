/*
Navicat MySQL Data Transfer

Source Server         : 10.202.34.234
Source Server Version : 50719
Source Host           : 10.206.34.234:3306
Source Database       : atp

Target Server Type    : MYSQL
Target Server Version : 50719
File Encoding         : 65001

Date: 2019-07-15 12:13:48
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for atp_mock_answer
-- ----------------------------
DROP TABLE IF EXISTS `atp_mock_answer`;
CREATE TABLE `atp_mock_answer` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `mock_id` bigint(20) DEFAULT NULL COMMENT '挡板ID',
  `asw_batch` int(11) DEFAULT NULL COMMENT '响应批次',
  `req_params` varchar(2048) DEFAULT NULL COMMENT '参数名称',
  `asw_result` varchar(1024) DEFAULT NULL COMMENT '响应结果',
  `delete_flag` tinyint(1) DEFAULT '0',
  `create_emp` varchar(64) DEFAULT NULL,
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_emp` varchar(64) DEFAULT NULL,
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `answer_index_id` (`mock_id`)
) ENGINE=InnoDB AUTO_INCREMENT=126 DEFAULT CHARSET=utf8;
