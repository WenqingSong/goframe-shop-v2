import { query } from '@/utils/query';
import request from '@/utils/request';

/**
 * @description 获取点赞列表
 * @param {{type:string,page:string,limit:string}} queryObj
 */
export const getCattleByType = queryObj =>
  request({
    method: 'POST',
    url: '/frontend/praise/list',
    data: (() => {
      const formData = new FormData();
      Object.keys(queryObj).forEach(key => {
        formData.set(key, queryObj[key]);
      });
      return formData;
    })(),
  });

export const addCattle = ({ type, object_id }) =>
  request({
    method: 'POST',
    url: '/frontend/add/praise',
    data: (() => {
      const data = new FormData();
      data.set('type', type);
      data.set('object_id', object_id);
      return data;
    })(),
  });

export const deleteCattleById = id =>
  request({
    method: 'POST',
    url: '/frontend/delete/praise',
    data: (() => {
      const data = new FormData();
      data.set('id', id);
      return data;
    })(),
  });

/**
 * @description 取消点赞(根据类型+对象id)
 */
export const deleteCattleByType = ({ type, object_id }) =>
  request({
    method: 'POST',
    url: '/frontend/delete/praise',
    data: (() => {
      const data = new FormData();
      data.set('type', type);
      data.set('object_id', object_id);
      return data;
    })(),
  });
