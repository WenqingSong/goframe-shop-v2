-- 秒杀商品表
CREATE TABLE `seckill_goods` (
                                 `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
                                 `goods_id` bigint NOT NULL COMMENT '商品ID',
                                 `goods_options_id` bigint NOT NULL COMMENT '商品规格ID',
                                 `original_price` int NOT NULL COMMENT '原始价格 单位分',
                                 `seckill_price` int NOT NULL COMMENT '秒杀价格 单位分',
                                 `seckill_stock` int NOT NULL COMMENT '秒杀库存',
                                 `start_time` datetime NOT NULL COMMENT '秒杀开始时间',
                                 `end_time` datetime NOT NULL COMMENT '秒杀结束时间',
                                 `status` tinyint NOT NULL DEFAULT '0' COMMENT '状态：0-未开始 1-进行中 2-已结束',
                                 `created_at` datetime DEFAULT NULL COMMENT '创建时间',
                                 `updated_at` datetime DEFAULT NULL COMMENT '更新时间',
                                 PRIMARY KEY (`id`),
                                 KEY `idx_goods_id_options_id` (`goods_id`, `goods_options_id`),
                                 KEY `idx_status` (`status`),
                                 KEY `idx_start_end_time` (`start_time`, `end_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 PARTITION BY KEY(goods_id) PARTITIONS 16 COMMENT='秒杀商品表';

-- 秒杀订单表
CREATE TABLE `seckill_order` (
                                 `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
                                 `order_id` bigint NOT NULL COMMENT '订单ID',
                                 `user_id` bigint NOT NULL COMMENT '用户ID',
                                 `goods_id` bigint NOT NULL COMMENT '商品ID',
                                 `goods_options_id` bigint NOT NULL COMMENT '商品规格ID',
                                 `seckill_price` int NOT NULL COMMENT '秒杀价格 单位分',
                                 `status` tinyint NOT NULL DEFAULT '0' COMMENT '状态：0-待支付 1-已支付 2-已取消',
                                 `created_at` datetime DEFAULT NULL COMMENT '创建时间',
                                 `updated_at` datetime DEFAULT NULL COMMENT '更新时间',
                                 PRIMARY KEY (`id`),
                                 UNIQUE KEY `uk_order_id` (`order_id`),
                                 KEY `idx_order_no` (`order_id`),
                                 KEY `idx_user_id` (`user_id`),
                                 KEY `idx_goods_id_options_id` (`goods_id`, `goods_options_id`),
                                 KEY `idx_status` (`status`),
                                 KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 PARTITION BY KEY(user_id) PARTITIONS 16 COMMENT='秒杀订单表';

-- 表分区优化
ALTER TABLE `seckill_goods`
    PARTITION BY KEY(goods_id)
    PARTITIONS 16;

ALTER TABLE `seckill_order`
    PARTITION BY KEY(user_id)
    PARTITIONS 16;

-- 创建数据清理存储过程
DELIMITER $$
CREATE PROCEDURE `cleanup_expired_seckill_goods`()
BEGIN
    -- 将已结束的秒杀商品状态更新为已结束(2)
UPDATE seckill_goods
SET status = 2
WHERE end_time < NOW() AND status IN (0, 1);

-- 删除30天前的过期秒杀记录
DELETE FROM seckill_order
WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
END$$
DELIMITER ;

-- 创建定时任务执行存储过程
CREATE EVENT IF NOT EXISTS `event_cleanup_seckill_daily`
ON SCHEDULE EVERY 1 DAY
DO
  CALL cleanup_expired_seckill_goods();