<template>
  <div class="category-container">
    <!-- 三级分类布局（左一级-中二级-右三级） -->
    <div class="three-level-container">
      <!-- 左侧一级分类 -->
      <div class="level-1-sidebar">
        <van-sidebar v-model="activeIndex" @change="onLevel1Change">
          <van-sidebar-item 
            v-for="(item, index) in level1Items" 
            :key="item.id"
            :title="item.text"
            @click="onLevel1Click(item)" />
        </van-sidebar>
      </div>

      <!-- 中间二级分类 -->
      <div class="level-2-sidebar">
        <div v-if="level2Items.length > 0">
          <van-sidebar v-model="activeSecondLevel">
            <van-sidebar-item 
              v-for="item in level2Items" 
              :key="item.id"
              :title="item.text"
              @click="onLevel2Click(item)" />
          </van-sidebar>
        </div>
        <div v-else class="no-category">
          <div class="no-data-text">暂无二级分类</div>
        </div>
      </div>

      <!-- 右侧三级分类 -->
      <div class="level-3-content">
        <div v-if="level3Items.length > 0">
          <div class="level-title" v-if="selectedSecondLevelName">
            {{ selectedSecondLevelName }}
          </div>
          <van-grid :column-num="3" :gutter="10" style="padding: 10px;">
            <van-grid-item 
              v-for="item in level3Items" 
              :key="item.id"
              :text="item.name"
              @click="goGoods(item)" />
          </van-grid>
        </div>
        <div v-else class="no-category">
          <div class="no-data-text">暂无三级分类</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getCurrentInstance, onMounted, ref } from 'vue';
import { getCategory, getAllCategories } from '@/api/goods';
import { useRouter } from 'vue-router';

const router = useRouter();
const proxy = getCurrentInstance();

// 响应式数据
const activeIndex = ref(0);
const activeSecondLevel = ref(0);

// 各级别数据
const level1Items = ref([]);
const level2Items = ref([]);
const level3Items = ref([]);

// 选中的分类信息
const selectedFirstLevel = ref(null);
const selectedSecondLevel = ref(null);
const selectedFirstLevelName = ref('');
const selectedSecondLevelName = ref('');

// 所有分类数据（扁平化）
const allCategories = ref([]);

// 跳转到商品列表
function goGoods(item) {
    router.push({
        path: '/category',
        query: {
            id: item.id,
        },
    });
}

// 一级分类点击
function onLevel1Click(item) {
    selectedFirstLevel.value = item.id;
    selectedFirstLevelName.value = item.text;
    
    // 从全量数据中过滤出二级分类
    const level2Categories = allCategories.value.filter(cat => 
        cat.parent_id === item.id
    );
    
    // 反转顺序显示
    level2Items.value = level2Categories.map(item => ({
        text: item.name,
        id: item.id
    })).reverse();
    
    // 默认选中第一个二级分类（反转后的第一个）
    if (level2Items.value.length > 0) {
        selectedSecondLevel.value = level2Items.value[0].id;
        selectedSecondLevelName.value = level2Items.value[0].text;
        activeSecondLevel.value = 0;
        loadLevel3Categories();
    } else {
        level3Items.value = [];
        selectedSecondLevel.value = null;
        selectedSecondLevelName.value = '';
    }
}

// 一级分类切换（兼容 van-sidebar 的 change 事件）
async function onLevel1Change(index) {
    const selectedLevel1 = level1Items.value[index];
    onLevel1Click(selectedLevel1);
}

// 二级分类点击
function onLevel2Click(item) {
    selectedSecondLevel.value = item.id;
    selectedSecondLevelName.value = item.text;
    loadLevel3Categories();
}

// 加载三级分类
function loadLevel3Categories() {
    if (!selectedSecondLevel.value) {
        level3Items.value = [];
        return;
    }
    
    // 从全量数据中过滤出三级分类
    const level3Categories = allCategories.value.filter(cat => 
        cat.parent_id === selectedSecondLevel.value
    );
    
    // 反转顺序显示
    level3Items.value = level3Categories.map(item => ({
        name: item.name,
        id: item.id
    })).reverse();
}

// 初始化数据
onMounted(async () => {
    try {
        // 获取所有分类数据
        const res = await getAllCategories();
        allCategories.value = res.data.list;
        console.log('所有分类:', allCategories.value);
        
        if (allCategories.value.length > 0) {
            // 提取一级分类（parent_id = 0）
            const level1Categories = allCategories.value.filter(cat => cat.parent_id === 0);
            
            // 反转顺序显示
            level1Items.value = level1Categories.map(item => ({
                text: item.name,
                id: item.id
            })).reverse();
            
            // 默认选中第一个一级分类（反转后的第一个）
            if (level1Items.value.length > 0) {
                selectedFirstLevel.value = level1Items.value[0].id;
                selectedFirstLevelName.value = level1Items.value[0].text;
                activeIndex.value = 0;
                
                // 加载对应的二级分类
                await onLevel1Change(0);
            }
        }
    } catch (error) {
        console.error('获取分类数据失败:', error);
    }
});
</script>

<style scoped lang="scss">
.category-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.three-level-container {
  display: flex;
  height: 100%;
}

.level-1-sidebar {
  width: 100px;
  background: #f7f8fa;
  border-right: 1px solid #eee;
  overflow-y: auto;
}

.level-2-sidebar {
  width: 100px;
  background: white;
  border-right: 1px solid #eee;
  overflow-y: auto;
}

.level-3-content {
  flex: 1;
  overflow-y: auto;
  background: white;
}

.no-category {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
}

.no-data-text {
  font-size: 14px;
}

.level-title {
  padding: 15px 16px 10px;
  font-size: 16px;
  font-weight: bold;
  color: #333;
  background: white;
  border-bottom: 1px solid #f5f5f5;
}
</style>
