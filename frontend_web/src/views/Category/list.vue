<script setup>
import {onMounted, ref} from "vue";
import {useRoute} from "vue-router";
import Goods from "@/components/Goods.vue";
import {getCarouselChartData, getClassification, getProductList, getProductListByCategoryId} from "@/api/home";
const route = useRoute();
const id = ref(0)
if (route.query.id) {
  // id.value = route.query.id
  id.value = parseInt(route.query.id);
   console.log(id.value)
}

const commodityData = ref([]);

onMounted(async () => {
  // 获取商品数据
  commodityData.value = (
      await getProductListByCategoryId({ size: 20, page: 1, level_id: id.value })
  ).data.list;
});
</script>

<template>
  <div>
    <!-- 商品展示 -->
    <Goods
        :data-item="commodityData">
      <template #title>
        <div>商品</div>
      </template>
    </Goods>
    <van-back-top right="20px" bottom="60px" />
  </div>
</template>

<style scoped lang="scss">

</style>