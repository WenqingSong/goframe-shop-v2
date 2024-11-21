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
import { getGoodsDetail, getGoodsOptions } from '@/api/goods';
import { addCart, editCart } from '@/api/cart';
import { useCartStore } from '@/stores/cart';
import { addCollection, deleteCollectionByType } from '@/api/collection';

const route = useRoute();
const router = useRouter();

const cartStore = useCartStore();
const showSkuDialog = ref(false);
const selectedValues = ref([]);

let goodsOptions = [];

// 商品id
const goodsId = route.params.goodsId;

// 商品详情
const goodsDetail = ref({});

onMounted(async () => {
    const res = await getGoodsDetail(goodsId);
    goodsDetail.value = res.data;
    isStar.value = goodsDetail.value.is_collect;
    await getOptions();
});

const isStar = ref(false);

// onCancel 事件: 关闭SKU弹窗
const onCancel = () => {
    showSkuDialog.value = false;
};
const getOptions = async () => {
    let params = {
        goods_id: goodsId,
    };
    const res = await getGoodsOptions(params);
    if (res.code === 0) {
        goodsOptions = [];
        if (res.data.list !== null) {
            for (const item of res.data.list) {
                goodsOptions.push({
                    text: item.name,
                    value: item.id,
                    goods_options_info: item,
                });
            }
        }
    }
};

const openDiaglog = async () => {
    await getOptions();
    showSkuDialog.value = true;
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
 * 添加到购物车事件
 */
const addToCart = async () => {
    const id = selectedValues.value[0];
    const hasGoods = cartStore.data?.find(it => it.goods_options_id === id);
    let res;
    if (hasGoods !== undefined) {
        res = await editCart({
            goods_options_id: id,
            count: hasGoods.count + 1,
            id: hasGoods.id,
        });
        console.log(res);
    } else {
        res = await addCart({ goods_options_id: id, count: 1 });
        console.log(res);
    }
    if (res?.code === 0) {
        showSuccessToast({
            message: '添加购物车成功！',
            duration: 1500,
        });
    }
    showSkuDialog.value = false;
    cartStore.changeCart();
};

const toBuy = () => {
    const orderInfo = {
        goods: [
            {
                count: 1,
                goods_id: goodsDetail.value.id,
                goods_info: goodsDetail.value,
                goods_options_info: goodsOptions[0].goods_options_info
            },
        ],
        price: goodsOptions[0].goods_options_info.price,
    };
    console.log(goodsDetail.value, goodsOptions);
    

    const encodedOrderInfo = btoa(encodeURI(JSON.stringify(orderInfo)));

    router.push({
        name: 'addressList',
        query: { orderInfo: encodedOrderInfo },
    });
};
</script>
