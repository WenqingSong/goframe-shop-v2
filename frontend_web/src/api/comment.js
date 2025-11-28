import request from '@/utils/request';
import {query} from "@/utils/query";

export const getComments = object_id =>
  request({
    method: 'POST',
    url: '/frontend/comment/detail',
    data: (() => {
      const data = new FormData();
      data.append('object_id', object_id);
      return data;
    })(),
  });

export const listComments = queryObj =>
    request({
        method: 'GET',
        url: '/frontend/comment/list?' + query(queryObj),
    });

export const addCommentApi = info =>
  request({
    method: 'POST',
    url: '/frontend/add/comment',
    data: (() => {
      const data = new FormData();
      Object.keys(info).forEach(key => {
        data.append(key, info[key]);
      });
      return data;
    })(),
  });
