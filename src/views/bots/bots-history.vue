<script setup lang='ts'>
import baseService from '@/service/baseService';
import { computed, onMounted, ref } from 'vue';
import moment from "moment";

interface IBotParam {
  limit: number;
  page: number,
  content?: string;
  startTime?: string;
  endTime?: string;
}

const botParam = ref<IBotParam>({
  limit: 10,
  page: 1,
  content: '',
  startTime: '2024-03-31',
  endTime: '2024-05-31'
});
const botMap = ref<{
  list: any[],
  total: number
}>({
  list: [],
  total: 0
});
const botTmp = ref('1');
const dateTimeRange = ref(['2024-03-31','2024-05-31']);

onMounted(() => {
  getBotList();
});

const getBotList = () => {
  baseService
    .get("/chat/msginfo/page", botParam.value)
    .then((res) => {
      if (res.code === 0) {
        botMap.value = res.data;
      }
    });
}

const handleSizeChange = (val: number) => {
  botParam.value.limit = val;
  getBotList();
}
const handleCurrentChange = (val: number) => {
  botParam.value.page = val;
  getBotList();
}

const shortcuts = [
  {
    text: 'Last week',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 7)
      return [start, end]
    },
  },
  {
    text: 'Last month',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setMonth(start.getMonth() - 1)
      return [start, end]
    },
  },
  {
    text: 'Last 3 months',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setMonth(start.getMonth() - 3)
      return [start, end]
    },
  },
]

const dateRangeChange = (value: string) => {
  if(value) {
    botParam.value.startTime = moment(value[0]).format("YYYY-MM-DD");
    botParam.value.endTime = moment(value[1]).format("YYYY-MM-DD");
    getBotList();
  } 
}

</script>

<template>
  <div class="container">
    <div class="top-header">
      <h2 class="top-title">聊天记录</h2>
    </div>
    <div class="">
      <el-row class="banner" style="margin-bottom: 1rem;">
        <el-input style="width: 240px; margin-right: 1rem;" v-model="botParam.content" placeholder="根据内容检索" @change="getBotList"></el-input>
        <el-date-picker v-model="dateTimeRange" type="daterange" :shortcuts="shortcuts" range-separator="~"
          start-placeholder="开始时间" end-placeholder="结束时间" @change="dateRangeChange" style="width: 240px; margin-right: 1rem;"/>
      </el-row>
      <el-tabs v-model="botTmp" class="tab-container">
        <el-tab-pane label="对话记录" name="1">
          <el-table :data="botMap.list" style="width: 100%">
            <el-table-column type="index" label="序号" width="70" fixed align="center" />
            <el-table-column prop="updateTime" label="最近对话时间" width="160" />
            <el-table-column prop="chatId" label="对话Id" width="150" />
            <el-table-column prop="content" label="内容" width="320" />
            <el-table-column prop="botName" label="BOT名称" width="150" />
            <el-table-column prop="botId" label="BOT ID" width="100" />
            <el-table-column prop="msgId" label="用户ID" width="120" />
            <el-table-column prop="type" label="类型" width="120" />
            <el-table-column prop="createTime" label="创建时间" width="160" />
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <el-pagination v-model:current-page="botParam.page" v-model:page-size="botParam.limit"
        :page-sizes="[5, 10, 20, 50]" :small="true" :background="false" layout="total, sizes, prev, pager, next, jumper"
        :total="botMap.total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </div>
    <div>

    </div>
  </div>
</template>

<style scoped></style>