<script setup>
import { ref, onMounted, computed } from 'vue';
import { getArticleInfo } from '@/api/recommend';
import { addCattle, deleteCattleByType } from '@/api/cattle';
import { addCollection, deleteCollectionByType, deleteCollectionById } from '@/api/collection';
import { useRoute, useRouter } from 'vue-router';
import { addCommentApi, getComments, listComments } from '@/api/comment';
import { getProductList } from "@/api/home";
import { showToast } from 'vant';

const route = useRoute();
const router = useRouter();
const articleId = route.query.articleId;
const objectid = ref(0);

if (route.query.articleId) {
  objectid.value = parseInt(route.query.articleId);
  console.log(objectid.value);
}

console.log(route.query);
if (!articleId) {
  router.replace('/recommend');
}

const info = ref({});
const cominfo = ref([]);
const replyParentId = ref(0); // 新增变量用于记录当前回复的评论 ID
const replyToUser = ref(''); // 新增变量用于记录当前回复的用户名

const changeData = async () => {
  if (!articleId) return;
  const res = await getArticleInfo(articleId);
  console.log(res);
  if (res.code === 0) {
    info.value = res.data;
  }
  console.table(info.value);
  console.log('文章ID:', info.value.id);
};

const changecomData = async () => {
  if (!articleId) return;

  console.log('获取评论列表，文章ID:', info.value.id || objectid.value);
  try {
    const response = await listComments({ type: 2, object_id: info.value.id || objectid.value, size: 20, page: 1 });
    console.log('评论列表响应:', response);
    
    if (response.code === 0) {
      const commentList = response.data.list || [];
      console.log('评论数量:', commentList.length);
      console.log('评论数据样本:', commentList[0]);
      
      // 构建评论树结构
      const commentTree = [];
      const commentMap = new Map();
      
      // 首先将所有评论按Id存入map（注意：后端返回的是大写Id）
      commentList.forEach(comment => {
        comment.replies = [];
        commentMap.set(comment.Id, comment);
      });
      
      // 然后构建评论树，ParentId=0或者不存在的是主评论，否则是回复评论
      // 注意：处理可能的类型问题，将ParentId转换为数字进行比较
      commentList.forEach(comment => {
        // 确保ParentId是数字类型
        const parentId = Number(comment.ParentId);
        if (parentId === 0) {
          // 主评论直接添加到树中
          commentTree.push(comment);
        } else {
          // 回复评论添加到对应主评论的replies数组中
          const parentComment = commentMap.get(parentId);
          if (parentComment) {
            parentComment.replies.push(comment);
          } else {
            // 如果找不到父评论，将其作为主评论处理
            commentTree.push(comment);
          }
        }
      });
      
      cominfo.value = commentTree;
      console.table(cominfo.value);
    } else {
      console.error('获取评论列表失败，响应码:', response.code, '消息:', response.message);
    }
  } catch (error) {
    console.error('获取评论列表异常:', error);
  }
};

// 发布一条自己的评论（而不是回复其他人的评论）
const addRootComment = () => {
  show.value = true;
  replyParentId.value = 0;
  replyToUser.value = "";
}

onMounted(async () => {
  await changeData();
  isThumbs.value = info.value.is_praise;
  isCollection.value = info.value.is_collect;
  await changecomData();
});

const isThumbs = ref(false);
const giveTheThumbsUp = async () => {
  try {
    if (isThumbs.value) {
      const res = await deleteCattleByType({ type: 2, object_id: info.value.id });
      console.log(res);
      console.log('😓');
    } else {
      const res = await addCattle({ type: 2, object_id: info.value.id });
      console.log(res);
      console.log('👍');
    }
    const newDetail = await getArticleInfo(articleId);
    console.log(newDetail);
    info.value.praise = newDetail.data.praise;
    isThumbs.value = info.value.is_praise = newDetail.data.is_praise;
  } catch (error) {
    console.error('点赞操作失败:', error);
    showToast('操作失败，请稍后重试');
  }
};

const isCollection = ref(false);
const collection = async () => {
  try {
    if (isCollection.value) {
      const res = await deleteCollectionByType({
        type: 2,
        object_id: info.value.id,
      });
      console.log(res);
      console.log('💔');
      if (res.code === 0) {
        showToast('已取消收藏');
      } else {
        showToast(res.msg || '操作失败，请稍后重试');
        return;
      }
    } else {
      const res = await addCollection({ type: 2, object_id: info.value.id });
      console.log(res);
      console.log('💖');
      if (res.code === 0) {
        showToast('收藏成功');
      } else {
        showToast(res.msg || '操作失败，请稍后重试');
        return;
      }
    }
    const newDetail = await getArticleInfo(articleId);
    console.log(newDetail);
    info.value.collection = newDetail.data.collection;
    isCollection.value = info.value.is_collect = newDetail.data.is_collect;
  } catch (error) {
    console.error('收藏操作失败:', error);
    showToast('操作失败，请稍后重试');
  }
};

const show = ref(false);
const comment = ref('');

const isHasComment = computed(() =>
  comment.value.length > 0 ? '#2ecc71' : '#ccc'
);

const addComment = async () => {
  if (!comment.value.length) return;
  console.log('添加评论，参数:', {
    type: 2,
    object_id: info.value.id,
    content: comment.value,
    parent_id: replyParentId.value,
  });
  
  try {
    const res = await addCommentApi({
      type: 2,
      object_id: info.value.id,
      content: comment.value,
      parent_id: replyParentId.value, // 使用 replyParentId
    });
    console.log('添加评论响应:', res);
    
    if (res.code === 0) {
      show.value = false;
      comment.value = '';
      replyParentId.value = 0; // 重置回复状态
      replyToUser.value = '';  // 重置回复用户名
      changeData();
      changecomData();
    } else {
      console.error('添加评论失败，响应码:', res.code, '消息:', res.msg);
    }
  } catch (error) {
    console.error('添加评论异常:', error);
  }
};

// 设置回复的函数
const setReply = (id, user) => {
  replyParentId.value = id;
  replyToUser.value = user || '匿名用户';
  show.value = true;
  console.log('设置回复: parentId=', id, 'replyToUser=', replyToUser.value);
};

</script>

<template>
  <div class="container">
    <van-nav-bar :title="$route.meta.title" placeholder fixed left-arrow @click-left="$router.back()" />
    <div class="content">
      <van-image class="img" fit="cover" :src="info.pic_url" />
      <div class="body">
        <p class="title">{{ info.title }}</p>
        <div class="info">
          <p class="desc">{{ info.desc }}</p>
          <p class="created_time">{{ info.created_at }}</p>
        </div>
        <div class="detail">
          {{ info.detail }}
        </div>
      </div>
    </div>
    <div class="comment">
      <p>评论:</p>
      <div v-if="cominfo.length > 0">
        <!-- 主评论 -->
        <div class="content_item" v-for="mainComment in cominfo" :key="mainComment.Id">
          <div class="user_pic">
            <img src="https://img.aigexing.com/uploads/7/1253/1120051754/9302649767/23368895.jpg" />
          </div>
          <div class="item_left">
            <div class="user_name">
              <span>{{ mainComment.user?.name || '匿名用户' }}</span>
              <span class="createdTime">{{ mainComment.CreatedAt }}</span>
            </div>
            <div class="user_content">{{ mainComment.Content }}</div>
            <!-- 回复按钮 -->
            <div class="reply_btn" @click.stop="setReply(mainComment.Id, mainComment.user?.name)">
              回复
            </div>
          </div>
          
          <!-- 回复评论 -->
          <div class="replies" v-if="mainComment.replies.length > 0">
            <div class="reply_item" v-for="reply in mainComment.replies" :key="reply.Id">
              <div class="user_pic reply_pic">
                <img src="https://img.aigexing.com/uploads/7/1253/1120051754/9302649767/23368895.jpg" />
              </div>
              <div class="item_left reply_left">
                <div class="user_name">
                  <span>{{ reply.user?.name || '匿名用户' }}</span>
                  <span class="createdTime">{{ reply.CreatedAt }}</span>
                </div>
                <div class="user_content reply_content">{{ reply.Content }}</div>
                <!-- 回复按钮 -->
                <div class="reply_btn" @click.stop="setReply(reply.Id, reply.user?.name)">
                  回复
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="no_comments">
        还没有人评论，快来抢沙发吧！
      </div>
    </div>

    <div class="action_box">
      <div class="add_comment" @click="addRootComment">
        <van-icon name="edit" size="20px" />&nbsp;评论
      </div>
      <div class="action">
        <div class="Thumbs_action" @click="giveTheThumbsUp">
          <van-icon :color="isThumbs ? '#3498db' : '#767676'" :name="`thumb-circle${isThumbs ? '' : '-o'}`"
            :badge="info.praise || ''" :badge-props="{ offset: ['10px', '5px'] }" />
        </div>
         <div class="star_action" @click="collection">
          <van-icon
            :color="isCollection ? '#f39c12' : '#767676'"
            :badge="info.collection || ''"
            :name="`star${isCollection ? '' : '-o'}`"
            :badge-props="{ offset: ['10px', '5px'] }"
          />
        </div>
      </div>
    </div>
    <van-popup class="comment_box" safe-area-inset-bottom v-model:show="show" position="bottom">
      <div class="comment_header">
        <div>评论 {{ replyToUser ? `回复 ${replyToUser}` : '' }}</div>
        <div class="left" @click="addComment">发布</div>
      </div>
      <van-field label-align="top" v-model.trim="comment" rows="6" type="textarea" maxlength="200" placeholder="请输入评论"
        show-word-limit />
    </van-popup>
  </div>
</template>

<style lang="scss" scoped>
.container {
  background-color: #fff;

  .content {
    .body {
      padding: 0 12px;

      .title {
        margin-top: 10px;
        font-size: 18px;
        font-weight: bold;
        text-align: center;
      }

      .info {
        margin-top: 10px;
        display: flex;
        color: gray;
        justify-content: space-around;
        justify-items: center;
        line-height: 100%;

        .desc {
          font-size: 14px;
        }

        .created_time {
          font-size: 14px;
        }
      }

      .detail {
        margin-top: 10px;
        text-indent: 2em;
        font-size: 16px;
        word-wrap: break-word;
        word-break: normal;
        white-space: normal;
      }
    }
  }
  .no_comments {
    margin-top: 20px;
    padding: 15px;
    text-align: center;
    font-size: 16px;
    color: #666;
    background-color: #f9f9f9;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    max-width: 80%;
    margin-left: auto;
    margin-right: auto;
  }

  .comment {
    border-top: 1px solid #ccc;
    margin-top: 10px;
    background: #f6f6f6;
    padding: 6px;
    padding-bottom: 50px;

    p {
      font-size: 16px;
    }

    .content_item {
      background: #fff;
      padding: 6px;
      display: flex;
      border-radius: 12px;
      margin-top: 12px;

      .user_pic {
        width: 42px;
        height: 42px;
        position: relative;

        img {
          width: 42px;
          height: 42px;
          object-fit: cover;
          border-radius: 50%;
        }
      }

      .item_left {
        margin-left: 10px;
        font-size: 14px;
        width: 100%;

        .user_name {
          margin-bottom: 6px;

          .createdTime {
            color: #86909c;
          }
        }

        .user_content {
          word-wrap: break-word;
          word-break: break-all;
          margin-bottom: 5px;
        }
        
        .reply_btn {
          color: #3498db;
          font-size: 12px;
          cursor: pointer;
          margin-top: 5px;
        }
      }
      
      /* 回复评论样式 */
      .replies {
        margin-left: 52px;
        margin-top: 10px;
      }
      
      .reply_item {
        display: flex;
        margin-bottom: 10px;
      }
      
      .reply_pic {
        width: 36px;
        height: 36px;
        
        img {
          width: 36px;
          height: 36px;
        }
      }
      
      .reply_left {
        margin-left: 8px;
      }
      
      .reply_content {
        font-size: 13px;
      }
    }
  }

  .action_box {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 42px;
    background: #fff;
    border-top: 1px solid rgb(232, 232, 232);
    box-shadow: 0px -2px 10px rgb(232, 232, 232);
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .add_comment {
      width: 100%;
      padding-left: 16px;
      height: 100%;
      display: flex;
      justify-content: left;
      align-items: center;
      font-size: 14px;
      color: #767676;

      &:active {
        background: #e8e8e8;
      }
    }

    .action {
      height: 100%;
      width: 100%;
      --van-badge-color: black;
      display: flex;
      align-items: center;
      font-size: 20px;
      color: #767676;

      div {
        display: flex;
        align-items: center;
        justify-content: left;
        padding: 6px 6px 6px 26px;
        height: 100%;
        width: 100%;

        :deep(.van-badge) {
          color: #767676;
          background-color: rgba(0, 0, 0, 0);
          border: none;
          font-size: 8px;
          font-weight: normal;
        }

        &:active {
          background: #e8e8e8;
          height: 32px;
        }
      }
    }
  }

  .comment_box {
    width: 100%;
    height: 300px;

    .comment_header {
      padding: 10px 16px 0 16px;
      font-size: 16px;
      display: flex;
      justify-content: space-between;

      .left {
        color: v-bind(isHasComment);
      }
    }
  }
}
</style>
