import { query } from '@/utils/query';
import request from '@/utils/request';

/**
 * @description 获取首页商品数据
 * @param {{keyword?: string,limit:number,page:number,sort?:"price_up"|"price_down"}} queryObj
 */
export const getProductList = queryObj =>
    request({
        method: 'GET',
        url: '/frontend/goods/list'.concat('?', query(queryObj)),
    });

/**
 * @description 根据分类级别获取商品数据
 * @param {{limit:number,page:number,level:number}} queryObj
 */
export const getProductListByCategoryId = queryObj =>
    request({
        method: 'GET',
        url: '/frontend/goods/level/list/'.concat('?', query(queryObj)),
    });

/**
 * @description 获取轮播图数据
 * @param {{limit:number,page:number}} queryObj
 */
export const getCarouselChartData = queryObj =>
    request({
        method: 'GET',
        url: '/frontend/rotation/list'.concat('?', query(queryObj)),
    });

/**
 * @description 获取分类列表
 * @param {number} parent_id 分类id
 */
export const getClassification = parent_id =>
    request({
        method: 'GET',
        url: '/frontend/category/list'.concat('?', query({ parent_id })),
    });

/**
 * @description 获取分类层级列表
 */
export const getCategoryHierarchical = () =>
    request({
        method: 'GET',
        url: '/frontend/category/hierarchical',
    });

/**
 * @description 获取分类列表
 * @param {{level?:number,parent_id?:number}} queryObj
 */
export const getFrontendCategoryList = queryObj =>
    request({
        method: 'GET',
        url: '/frontend/category/list'.concat('?', query(queryObj)),
    });
