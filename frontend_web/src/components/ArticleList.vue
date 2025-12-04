<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getArticleList } from '@/api/recommend'; // 默认的文章列表接口
import { getCattleByType } from '@/api/cattle';

const props = defineProps({
    articleData: {
        type: Array,
        default: [],
    },
    apiFn: {
        type: Function,
        default: null,  // 默认值设为 null，用于判断是否传入自定义接口
    },
    params: {
        type: Object,
        default: null,  // 默认值设为 null，用于判断是否传入自定义参数
    },
    status: {
        type: Number,
        default: 2,
    },
});

const router = useRouter();
const list = ref([]);
const loading = ref(false);
const finished = ref(false);

// 获取收藏列表并筛选对应文章
const fetchLikedCollectionArticles = async () => {
    const articles = [];
    try {
        // 使用传入的 apiFn 和 params 来获取收藏列表
        const res = await props.apiFn(props.params);
        console.log('收藏列表响应:', res);
        
        if (res?.code !== 0) {
            console.error('获取收藏列表失败:', res?.msg || '未知错误');
            return articles;
        }
        
        if (!res.data || res.data.list === null || res.data.list === undefined || res.data.list.length === 0) {
            console.log('收藏列表为空');
            return articles;
        }

        // 类型是商品，需要进行显示格式的转换
        if (props.params.type === 1) {
            for (const item of res.data.list) {
                if (item.goods) {  // 确保 goods 对象存在
                    articles.push({
                        id: item.object_id,
                        title: item.goods.name,
                        desc: (item.goods.price / 100).toFixed(2),
                        pic_url: item.goods.pic_url,
                        detail: item.goods.detail_info,
                        created_at: item.goods.created_at
                    });
                } else {
                    console.warn('商品数据不完整:', item);
                }
            }
        } else {
            for (const item of res.data.list) {
                if (item.article) {  // 确保 article 对象存在
                    articles.push({
                        id: item.object_id,
                        title: item.article.title,
                        desc: item.article.desc,
                        pic_url: item.article.pic_url,
                        created_at: item.article.created_at
                    });
                } else {
                    console.warn('文章数据不完整:', item);
                }
            }
        }

        return articles;
    } catch (error) {
        console.error("Error fetching collection articles:", error);
        return articles;
    }
};

const fetchDefaultArticles = async () => {
    console.log("fetchDefaultArticles");
    try {
        const res = await props.apiFn(props.params);
        if (res?.code !== 0) return [];

        return res.data.list === null ? [] : res.data.list;
    } catch (error) {
        console.error("Error fetching default articles:", error);
        return [];
    }
};
const loadedIds = new Set();

const onLoad = async () => {
    loading.value = true;

    try {
        let articles = [];
        if (props.params.type !== undefined) {
            articles = await fetchLikedCollectionArticles();
        } else {
            articles = await fetchDefaultArticles();
        }

        if (articles.length === 0) {
            finished.value = true;
        } else {
            const uniqueArticles = articles.filter(article => {
                if (loadedIds.has(article.id)) return false;
                loadedIds.add(article.id);
                return true;
            });
            list.value = [...list.value, ...uniqueArticles];
            props.params.page += 1;
        }

    } catch (error) {
        console.error("Error loading articles:", error);
    } finally {
        loading.value = false;
    }

    console.log("List Value: ", list.value);

};

const handleClick = article => {
    if (props.status === 2) {
        router.push({
            path: '/article-detail',
            query: {
                articleId: article.id,
            },
        });
        return;
    }

    router.push({
        name: 'goodsDetail',
        params: {
            goodsId: article.id,
        },
    });
};

onMounted(() => {
    list.value = []
    onLoad();
});
</script>

<template>
    <div>
        <van-list class="content" v-model:loading="loading" :finished="finished" :immediate-check="false"
            finished-text="没有更多了" @load="onLoad" offset>
            <van-card class="item" v-for="article in list" :key="article.id" :thumb="article.picUrl || article.pic_url"
                @click="handleClick(article)">
                <template #title>
                    <p class="title">
                        {{ article?.title || 'default' }}
                    </p>
                </template>
                <template #desc>
                    <p class="detail">{{ article.detail }}</p>
                </template>
                <template #price>
                    <p class="desc">
                        {{ article.desc }}
                    </p>
                </template>
                <template #num>
                    <p>{{ article.created_at }}</p>
                </template>
            </van-card>
        </van-list>
    </div>
</template>

<style lang="scss" scoped>
.content {
    .item {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        .title {
            font-size: 16px;
            color: black;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .detail {
            margin-top: 6px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            color: rgb(105, 105, 105);
        }

        .desc {
            color: rgb(105, 105, 105);
            font-weight: normal;
        }
    }
}
</style>
