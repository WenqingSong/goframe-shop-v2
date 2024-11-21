<script setup>
import { onMounted, ref, watch, onBeforeUnmount } from 'vue';
import { getCollectionList } from '@/api/collection';
import ArticleList from '@/components/ArticleList.vue';
import { useCollectionStore } from '@/stores/collection';

const collectionStore = useCollectionStore();

const active = ref(collectionStore.active);

const stopActiveWatch = watch(active, val => {
  console.log('newVal', val);
  collectionStore.changeActive(val);
});

onBeforeUnmount(() => {
  stopActiveWatch();
});

const changeType = async () => {
  // const res = await getCollectionList({
  //   size: 10,
  //   page: 1,
  //   type: active.value,
  // });
  // console.log(res);
};

onMounted(async () => {
  await changeType();
});

const onClickTab = async type => {
  console.log(type);
  await changeType();
};
</script>

<template>
  <van-nav-bar
    :title="$route.meta.title"
    placeholder
    fixed
    @click-left="$router.back()"
    left-arrow
  />
  <van-tabs
    v-model:active="active"
    @change="onClickTab"
    offset-top="46"
    sticky
    swipeable
  >
    <van-tab name="1" title="商品"
      ><div class="item-container">
        <ArticleList
          class="list"
          :status="1"
          :api-fn="getCollectionList"
          :params="{ type: 1, page: 1, size: 10 }"
        /></div
    ></van-tab>
    <van-tab name="2" title="文章">
      <div class="item-container">
        <ArticleList
          class="list"
          :status="2"
          :api-fn="getCollectionList"
          :params="{ type: 2, page: 1, size: 10 }"
        />
      </div>
    </van-tab>
  </van-tabs>
</template>

<style lang="scss" scoped>
.item-container {
  padding: 10px 10px 0px 10px;
}
</style>
