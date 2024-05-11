<script setup lang='ts'>
import baseService from '@/service/baseService';
import { ref } from 'vue';

interface ListItem {
  content: string
  knowledgeFragmentId: string
  score: string;
}

const content = ref('');
const loading = ref(false);
const list = ref<ListItem[]>([]);
const dialogVisible = ref(false);
const row = ref<ListItem>({
  content: '',
  knowledgeFragmentId: '',
  score: '',
});

const getList = () => {
  if (!content.value) return;
  loading.value = true;
  baseService
    .get(`/knowledge/knowledgefragmentinfo/retrieval?content=${content.value}`)
    .then((res) => {
      loading.value = false;
      if (res.code === 0) {
        list.value = res.data;
      }
    }).catch(() => loading.value = false);
}

const handleClick = (item: ListItem) => {
  row.value = item;
  dialogVisible.value = true;
}

</script>

<template>
  <div class="container">
    <div class="top-header">
      <h2 class="top-title">检索测试</h2>
    </div>
    <div>
      <el-input style="width: 50%;" v-model="content" placeholder="搜索" @keydown.enter="getList">
        <template #append>
          <el-button type="primary" @click="getList">搜索</el-button>
        </template>
      </el-input>
    </div>
    <div class="main" v-if="!loading">
      <el-card class="session-item" v-for="(item, index) in list" @click="handleClick(item)">
        <div class="card-top">
          <el-button size="small" icon="Compass">{{ index + 1 }}</el-button>
          <el-button size="small" text icon="Aim">{{ item.score }}</el-button>
        </div>
        <div style="margin-top: 0.5rem;">{{ item.content }}</div>
      </el-card>
    </div>
    <div class="loading" v-loading="loading">

    </div>
  </div>

  <el-dialog v-model="dialogVisible" width="500" class="dialog-show" top="30vh">
    <template #title>
      <div class="card-top">
        <el-button size="small" icon="Compass">{{ row.score }}</el-button>      
      </div>
    </template>
    <div>{{ row.content }}</div>
    <div class="card-bottom">
      <el-button size="small" text icon="Aim">{{ row.knowledgeFragmentId }}</el-button>
    </div>
  </el-dialog>
</template>

<style scoped lang="scss">
.main {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(32%, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}

.session-item {
  width: 100%;
  background-color: #f6f8fa;
  margin: 0;
  cursor: pointer;

  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.card-bottom {
  margin-top: 2rem;
}

.loading {
  min-height: 30vh;
}

.dialog-show :deep(.el-dialog__body) {
  padding-top: 0 !important;
}
</style>