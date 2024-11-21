import request from '@/utils/request';
import { query } from '@/utils/query';

/**
 * @description 添加收藏
 * @param {{type: string,object_id:string}} info
 */
export const addCollection = info =>
  request({
    method: 'POST',
    url: '/frontend/collection/add/',
    data: (() => {
      const formData = new FormData();
      Object.keys(info).forEach(key => {
        formData.set(key, info[key]);
      });
      return formData;
    })(),
  });

/**
 * @description 删除收藏
 * @param {string} id
 */
export const deleteCollectionById = id =>
  request({
    method: 'DELETE',
    url: '/frontend/collection/delete/',
    data: (() => {
      const formData = new FormData();
      formData.set('id', id);
      return formData;
    })(),
  });

/**
 * @description 删除收藏
 * @param {{type: string,object_id:string}} info
 */
export const deleteCollectionByType = info =>
  request({
    method: 'DELETE',
    url: '/frontend/collection/deleteByType/',
    data: (() => {
      const formData = new FormData();
      Object.keys(info).forEach(key => {
        formData.set(key, info[key]);
      });
      return formData;
    })(),
  });

/**
 * @description 获取收藏
 * @param {{type:string,page:string,limit:string}} queryObj
 */
export const getCollectionList = queryObj =>
  request({
    method: 'GET',
    url: '/frontend/collection/list/',
    params: queryObj,
  });
