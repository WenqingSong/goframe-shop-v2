import { query } from '@/utils/query';
import request from '@/utils/request';

/**
 * @description 获取商品详情
 * @param {number} id 商品id
 */
export const getGoodsDetail = id => {
    return request({
        method: 'GET',
        url: '/frontend/goods/detail'.concat('?', query({ id })),
    });
};

export const getCategory = parent_id => {
    return request({
        method: 'GET',
        url: '/backend/category/list'.concat('?', query({ parent_id })),
        // url: '/frontend/category/list',
        // data: { parent_id: id },
    });
};

export const getGoodsOptions = queryObj => {
    return request({
        method: 'GET',
        url: '/backend/goods/options/list/'.concat('?', query(queryObj)),
    });
}