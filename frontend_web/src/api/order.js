import { query } from '@/utils/query';
import request from '@/utils/request';

/**
 * @description 我的订单
 * @param {{page:number;limit:number;status:string}} queryObj
 */
export const getOrder = queryObj =>
  request({
    method: 'GET',
    url: '/frontend/order/list/'.concat('?', query(queryObj)),
  });

/**
 * @description 创建订单
 * @param {{ order_goods_infos: { count: string;goods_id: string}[],consignee_phone:string;consignee_name:string; consignee_address:string;pay_type: number,price: number,remark: string,status: string}} info
 */
export const createOrder = info =>
  request({
    method: 'POST',
    url: '/frontend/add/order/',
    data: JSON.stringify(info),
  });

/**
 * @description 取消订单
 * @param {{id: string, reason: string}} info
 */
export const cancelOrder = info =>
  request({
    method: 'POST',
    url: '/frontend/order/cancel/',
    data: JSON.stringify(info),
  });

/**
 * @description 支付订单
 * @param {{id: string, pay_type: number}} info
 */
export const payOrder = info =>
  request({
    method: 'POST',
    url: '/frontend/order/pay/',
    data: JSON.stringify(info),
  });

/**
 * @description 确认收货
 * @param {{id: string}} info
 */
export const confirmOrder = info =>
  request({
    method: 'POST',
    url: '/frontend/order/confirm/',
    data: JSON.stringify(info),
  });
