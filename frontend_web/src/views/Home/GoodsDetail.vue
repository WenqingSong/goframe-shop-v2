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

onMounted(async () => {
    const res = await getGoodsDetail(goodsId);
    goodsDetail.value = res.data;
    isStar.value = goodsDetail.value.is_collect;
    // 直接从商品详情中获取选项信息
    formatGoodsOptions();
});

const isStar = ref(false);

// onCancel 事件: 关闭SKU弹窗
const onCancel = () => {
    showSkuDialog.value = false;
};
const formatGoodsOptions = () => {
    goodsOptions.value = [];
    if (goodsDetail.value?.Options && goodsDetail.value.Options.length > 0) {
        for (const item of goodsDetail.value.Options) {
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
    // 直接使用已有的商品选项信息，无需重新获取
    formatGoodsOptions();
    
    // 如果没有商品规格选项，直接添加到购物车
    if (goodsOptions.value.length === 0) {
        await addToCartWithoutOptions();
    } else {
        showSkuDialog.value = true;
    }
};

/**goodsDetail
 * 收藏事件
 */
const toggleStar = async goodsInfo => {
    console.table(goodsInfo);
    if (isStar.value) {
        const res = await deleteCollectionByType({
            type: 1,
            object_id: goodsInfo.id,
        });
    } else {
        const res = await addCollection({ type: 1, object_id: goodsInfo.id });
    }
    const res = await getGoodsDetail(goodsId);
    goodsDetail.value = res.data;
    isStar.value = goodsDetail.value.is_collect;
};

/**
 * 添加到购物车事件（带规格）
 */
const addToCart = async () => {
    // 获取选择的商品规格索引
    const selectedIndex = selectedValues.value[0];
    // 检查是否选择了商品规格
    if (selectedIndex === undefined || goodsOptions.value.length === 0) {
        showSuccessToast({
            message: '请选择商品规格！',
            duration: 1500,
        });
        return;
    }
    // 获取选择的商品规格ID
    const selectedOption = goodsOptions.value[selectedIndex];
    const id = selectedOption.value;
    
    await addCartCommon(id, selectedOption);
    showSkuDialog.value = false;
};

/**
 * 添加到购物车事件（无规格）
 */
const addToCartWithoutOptions = async () => {
    // 当没有商品规格时，使用默认值
    await addCartCommon(null, null);
};

/**
 * 添加到购物车通用逻辑
 */
const addCartCommon = async (id, selectedOption) => {
    // 检查购物车中是否已存在该商品
    const hasGoods = cartStore.data?.find(it => it.goods_options_id === id);
    let res;
    
    try {
        if (hasGoods !== undefined) {
            // 如果已存在，更新数量
            res = await editCart({
                goods_options_id: id,
                count: hasGoods.count + 1,
                id: hasGoods.id,
            });
        } else {
            // 如果不存在，添加到购物车
            // 当没有规格时，goods_options_id传0或null
            res = await addCart({ goods_options_id: id || 0, count: 1 });
        }
        
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
    
    cartStore.changeCart();
};

const toBuy = () => {
    // 获取选择的商品规格索引
    const selectedIndex = selectedValues.value[0] || 0;
    
    let selectedOption = null;
    let price = goodsDetail.value.price;
    
    // 检查是否有商品规格
    if (goodsOptions.value.length > 0) {
        selectedOption = goodsOptions.value[selectedIndex];
        price = selectedOption.goods_options_info.price;
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
