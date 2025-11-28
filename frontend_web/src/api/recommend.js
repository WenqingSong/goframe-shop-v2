import { query } from '@/utils/query';
import request from '@/utils/request';

/**
 * @description 文章列表
 * @param {{limit:number,page:number}} queyObj
 */
export const getArticleList = (queyObj) =>
    request({
        method: 'GET',
        url: '/frontend/article/list'.concat('?', query(queyObj)),
    });

/**
 * @description 添加种草文章
 * @param {{title: string,desc:string,pic_url:string,detail:string}} articleInfo 文章信息
 */
export const addArticle = articleInfo =>
    request({
        method: 'POST',
        url: '/frontend/article/add',
        data: (() => {
            const formData = new FormData();
            Object.keys(articleInfo).forEach(key =>
                formData.set(key, articleInfo[key])
            );
            return formData;
        })(),
    });

/**
 * @description 我的文章列表
 * @param {{limit:number,page:number}} queyObj
 */
export const myArticleList = queyObj =>
    request({
        method: 'GET',
        url: '/frontend/article/my'.concat('?', query(queyObj)),
    });

export const getArticleInfo = id =>
    request({
        method: 'GET',
        url: '/frontend/article/detail/'.concat('?', query({ id })),
    });
