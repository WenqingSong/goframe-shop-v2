import axios from 'axios';
import { showNotify } from 'vant';
import { getToken, removeToken } from './auth';
import router from '@/router';
import { resetLogin } from './userCache';
import { useUserStore } from '@/stores/user';
import { useCartStore } from '@/stores/cart';
// Notify
import 'vant/es/notify/style';

const request = axios.create({
    /**
     * 服务基本网址
     */
    baseURL: 'http://127.0.0.1:8199',

    /**
     * 超时
     */
    timeout: 15000,
});

//添加请求拦截器
request.interceptors.request.use(
    config => {
        config.headers['Authorization'] = 'Bearer '.concat(getToken());
        return config;
    },
    error => {
        // 对请求错误做些什么
        return Promise.reject(error);
    }
);

// 添加响应拦截器
request.interceptors.response.use(
    response => {
        // 对响应数据做点什么
        const data = response.data;
        if (data.code !== 0) {
            if (data.code === 1) {
                // 代表未登录
                // 如果当前路径就是/login 又去使用push 就会报重复跳转的错误
                if (router.currentRoute.value.path !== '/login') {
                    router.push('/login');
                }
            }
            if (data.code === 3) {
                showNotify({
                    type: 'danger',
                    message: '用户名或密码错误',
                    duration: 1500,
                });
            } else {
                // 证明后台给的不是我们要的数据
                if (data.message === '请登录') {
                    const userStore = useUserStore();
                    const cartStore = useCartStore();
                    userStore.reset();
                    cartStore.reset();
                    resetLogin();
                    removeToken();
                }
                showNotify({
                    type: 'danger',
                    message: data.message || '系统繁忙',
                    duration: 1500,
                });
            }

            return Promise.reject(data);
        }
        return response.data;
    },
    error => {
        console.log('🚀 ~ error:', error);
        // 对响应错误做点什么
        showNotify({ type: 'danger', message: '系统繁忙', duration: 1500 });

        return Promise.reject(error);
    }
);

export default request;
