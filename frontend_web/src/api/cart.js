import request from '@/utils/request';
import { query } from '@/utils/query';

/**
 * @description 添加到购物车
 * @param {{goods_options_id:string,count:string}} form
 */
export const addCart = form =>
    request({
        method: 'POST',
        url: '/frontend/cart/add',
        data: form,
    });

/**
 * @description 获取购物车数据
 * @param {{page:number,limit:number}} queryObj
 */
export const getCartList = queryObj =>
    request({
        method: 'POST',
        url: '/frontend/cart/list',
        data: queryObj,
    });

/**
 * @description 编辑购物车数据
 * @param {{goods_id:string,count:string,id:string}} form
 */
export const editCart = form =>
    request({
        method: 'POST',
        url: '/frontend/cart/update',
        data: form,
    });

/**
 * @description 删除购物车商品
 * @param {string[]} ids
 */
export const deleteCart = ids =>
    request({
        method: 'POST',
        url: '/frontend/delete/cart',
        data: {
            ids: ids,
        },
    });
