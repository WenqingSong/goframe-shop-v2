<template>
    <main>
        <van-nav-bar :title="$route.meta.title" left-arrow @click-left="$router.back()" fixed placeholder />
        <div class="container">
            <div class="body_box">
                <div class="img_box">
                    <img :src="goodsDetail.pic_url" :alt="goodsDetail.pic_url" />
                </div>
                <p class="price">￥{{ goodsDetail.price / 100.0?.toFixed(2) }}</p>
                <div class="goods_name">{{ goodsDetail.name }}</div>
                <p class="brands">品牌：{{ goodsDetail.brand }}</p>
                <div class="express_prompt">
                    <span>
                        库存：<span>{{ goodsDetail.stock }}</span>
                    </span>
                    <span>免邮费 顺丰快递</span>
                </div>
                <div class="detail">
                    <p class="title">商品详情</p>
                    <p class="content">{{ goodsDetail.detail_info }}</p>
                </div>
            </div>
        </div>
        <!-- 动作栏 -->
        <van-action-bar placeholder>
            <van-action-bar-icon :badge="cartStore?.count ? cartStore.count : ''" icon="cart-o" text="购物车"
                @click="$router.push('/cart')" />
            <van-action-bar-icon :icon="isStar ? 'star' : 'star-o'" text="收藏" color="#ff5000"
                @click="toggleStar(goodsDetail)" />
            <van-action-bar-button type="warning" text="加入购物车" @click="openDiaglog" />
            <van-action-bar-button type="danger" text="立即购买" @click="toBuy" />
        </van-action-bar>

        <van-popup v-model:show="showSkuDialog" round position="bottom">
            <van-picker v-model="selectedValues" :columns="goodsOptions" item-height="40" title="选择商品规格"
                @confirm="addToCart" @cancel="onCancel" />
        </van-popup>

    </main>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';
import { showSuccessToast } from 'vant';
import { getGoodsDetail } from '@/api/goods';
import { addCart, editCart } from '@/api/cart';
import { useCartStore } from '@/stores/cart';
import { addCollection, deleteCollectionByType } from '@/api/collection';

const route = useRoute();
const router = useRouter();

const cartStore = useCartStore();
const showSkuDialog = ref(false);
const selectedValues = ref([0]); // 默认选择第一个规格
const goodsOptions = ref([]); // 使用ref以便在模板中响应式更新

// 商品id
const goodsId = route.params.goodsId;

// 商品详情
const goodsDetail = ref({});

const isStar = ref(false);

onMounted(async () => {
    try {
        const res = await getGoodsDetail(goodsId);
        console.log('初始加载商品详情:', res.data);
        goodsDetail.value = res.data;
        isStar.value = goodsDetail.value.is_collect;
        console.log('初始收藏状态:', isStar.value, '后端返回的is_collect:', goodsDetail.value.is_collect);
        // 直接从商品详情中获取选项信息
        formatGoodsOptions();
    } catch (error) {
        console.error('获取商品详情失败:', error);
    }
});

// onCancel 事件: 关闭SKU弹窗
const onCancel = () => {
    showSkuDialog.value = false;
};
const formatGoodsOptions = () => {
    goodsOptions.value = [];
    if (goodsDetail.value && goodsDetail.value.options && goodsDetail.value.options.length > 0) {
        for (const item of goodsDetail.value.options) {
            goodsOptions.value.push({
                text: item.name,
                value: item.id,
                goods_options_info: item,
            });
        }
        // 如果有商品规格，确保selectedValues有默认值
        if (goodsOptions.value.length > 0) {
            selectedValues.value = [0]; // 默认选择第一个规格
        }
    }
};

const openDiaglog = async () => {
    // 直接在openDiaglog中处理商品规格数据
    goodsOptions.value = [];
    if (goodsDetail.value && goodsDetail.value.options && goodsDetail.value.options.length > 0) {
        for (const item of goodsDetail.value.options) {
            goodsOptions.value.push({
                text: item.name,
                value: item.id,
                goods_options_info: item,
            });
        }
        
        // 如果有商品规格选项，显示规格选择弹窗
        if (goodsOptions.value.length > 0) {
            showSkuDialog.value = true;
        } else {
            // 如果没有商品规格选项，直接添加到购物车
            await addToCartWithoutOptions();
        }
    } else {
        // 如果没有商品规格选项，直接添加到购物车
        await addToCartWithoutOptions();
    }
};

/**goodsDetail
 * 收藏事件
 */
const toggleStar = async goodsInfo => {
    try {
        console.log('开始收藏操作，当前状态:', isStar.value);
        console.table(goodsInfo);
        
        let res;
        if (isStar.value) {
            console.log('执行取消收藏操作，参数:', { type: 1, object_id: goodsInfo.id });
            res = await deleteCollectionByType({
                type: 1,
                object_id: goodsInfo.id,
            });
            console.log('取消收藏响应:', res);
            if (res.code === 0) {
                showSuccessToast({
                    message: '已取消收藏',
                    duration: 1500,
                });
            } else {
                showSuccessToast({
                    message: res.msg || '操作失败，请稍后重试',
                    duration: 1500,
                });
                return;
            }
        } else {
            console.log('执行添加收藏操作，参数:', { type: 1, object_id: goodsInfo.id });
            res = await addCollection({ type: 1, object_id: goodsInfo.id });
            console.log('添加收藏响应:', res);
            if (res.code === 0) {
                showSuccessToast({
                    message: '收藏成功',
                    duration: 1500,
                });
            } else {
                showSuccessToast({
                    message: res.msg || '操作失败，请稍后重试',
                    duration: 1500,
                });
                return;
            }
        }
        
        console.log('重新获取商品详情，商品ID:', goodsId);
        const detailRes = await getGoodsDetail(goodsId);
        console.log('收藏操作后重新获取商品详情:', detailRes.data);
        goodsDetail.value = detailRes.data;
        isStar.value = goodsDetail.value.is_collect;
        console.log('更新后的收藏状态:', isStar.value, '后端返回的is_collect:', goodsDetail.value.is_collect);
    } catch (error) {
        console.error('收藏操作失败:', error);
        showSuccessToast({
            message: '操作失败，请稍后重试',
            duration: 1500,
        });
    }
};

/**
 * 添加到购物车事件（带规格）
 */
const addToCart = async () => {
    // 获取选中的值
    const selectedValue = selectedValues.value[0];
    
    // 检查是否有商品规格且已选择
    if (goodsOptions.value.length > 0 && !selectedValue) {
        showSuccessToast({
            message: '请选择商品规格！',
            duration: 1500,
        });
        return;
    }
    
    // 从选项数组中查找选中的选项对象
    const selectedOption = goodsOptions.value.find(option => option.value === selectedValue);
    
    if (!selectedOption) {
        showSuccessToast({
            message: '请选择有效的商品规格！',
            duration: 1500,
        });
        return;
    }
    
    // 直接从选中的选项对象中获取id
    const id = selectedOption.value;
    
    await addCartCommon(id, selectedOption);
    showSkuDialog.value = false;
};

/**
 * 添加到购物车事件（无规格）
 */
const addToCartWithoutOptions = async () => {
    // 当没有商品规格时，使用默认值0
    await addCartCommon(0, null);
}

/**
 * 添加到购物车通用逻辑
 */
const addCartCommon = async (id, selectedOption) => {
    let res;
    
    try {
        // 调用addCart API，让后端处理数量更新或新增
        res = await addCart({ goods_options_id: id, count: 1 });
        
        if (res?.code === 0) {
            showSuccessToast({
                message: '添加购物车成功！',
                duration: 1500,
            });
        } else {
            showSuccessToast({
                message: res?.message || '添加购物车失败！',
                duration: 1500,
            });
        }
    } catch (error) {
        console.error('添加购物车失败:', error);
        showSuccessToast({
            message: '系统繁忙，请稍后重试！',
            duration: 1500,
        });
    }
    
    // 更新购物车数据
    await cartStore.changeCart();
};

const toBuy = () => {
    // 获取选择的商品规格值
    const selectedValue = selectedValues.value[0];
    
    let selectedOption = null;
    let price = goodsDetail.value.price;
    
    // 检查是否有商品规格
    if (goodsOptions.value.length > 0 && selectedValue) {
        selectedOption = goodsOptions.value.find(option => option.value === selectedValue);
        if (selectedOption) {
            price = selectedOption.goods_options_info.price;
        }
    }
    
    const orderInfo = {
        goods: [
            {
                count: 1,
                goods_id: goodsDetail.value.id,
                goods_info: goodsDetail.value,
                goods_options_info: selectedOption?.goods_options_info || goodsDetail.value
            },
        ],
        price: price,
    };
    
    const encodedOrderInfo = btoa(
        encodeURI(
            JSON.stringify(orderInfo)
        )
    );

    router.push({
        name: 'addressList',
        query: {
            orderInfo: encodedOrderInfo,
        },
    });
};
</script>
