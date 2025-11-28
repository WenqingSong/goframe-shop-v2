import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { getCartList } from '@/api/cart';

export const useCartStore = defineStore('cart', () => {
    const count = ref(0);
    const data = ref([]);
    const changeCart = async () => {
        const res = await getCartList({ page: 1, limit: 100 });
        console.log('🚀 ~ changeCart ~ res:', res)
        if (res.code === 0) {
            count.value = res.data.total;
            // 转换数据结构，将后端返回的ops映射为goods_options_info，goods映射为goods_info
            data.value = res.data.list.map(item => ({
                ...item,
                goods_options_info: item.ops,
                goods_options_id: item.goods_options_id,
                checked: false
            }));
            // 处理goods_options_info中的goods为goods_info
            data.value.forEach(item => {
                if (item.goods_options_info && item.goods_options_info.goods) {
                    item.goods_options_info.goods_info = item.goods_options_info.goods;
                }
            });
            console.log('转换后的数据:', data.value)
        } else {
            // 可以设置一个错误状态，并在界面上反馈给用户
        }
    };
    const reset = () => {
        count.value = 0;
        data.value = [];
    };

    return { count, data, changeCart, reset };
});
