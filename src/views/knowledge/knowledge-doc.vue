<script setup lang='ts'>
import baseService from '@/service/baseService';
import { computed, onMounted, ref } from 'vue';
import moment from "moment";
import { ElMessage } from 'element-plus';

interface IBotParam {
  limit: number;
  page: number;
  order?: string;
  orderField?: string;
  documentName: string;
  type: string;
}

const botParam = ref<IBotParam>({
  limit: 10,
  page: 1,
  order: '',
  orderField: '',
  documentName: '',
  type: ''
});
const botMap = ref<{
  list: any[],
  total: number
}>({
  list: [],
  total: 0
});
const typeList = ref([{
  label: '全部类型',
  value: ''
}, {
  label: 'txt',
  value: 'txt'
}, {
  label: 'Pdf',
  value: 'pdf'
}]);
const editStatus = ref(0);
const curType = ref('');
const queryParam = ref({
  documentName: '',
  type: '1',
  content: '',
  charCount: 100
});
const group = ref('0');
const fillAddContent = computed(() => queryParam.value.documentName && queryParam.value.content);
const isToken = ref(true);
const isType = ref(false);
const splitList = ref<any>([]);
const saveLoading = ref(false);

onMounted(() => {
  getList();
});

const getList = () => {
  baseService
    .get("/knowledge/knowledgeinfo/page", botParam.value)
    .then((res) => {
      if (res.code === 0) {
        botMap.value = res.data;
      }
    });
}

const handleSizeChange = (val: number) => {
  botParam.value.limit = val;
  getList();
}
const handleCurrentChange = (val: number) => {
  botParam.value.page = val;
  getList();
}

const changeToAdd = (type: string) => {
  editStatus.value = 1;
  curType.value = type;
}

const updateSplit = () => {
  baseService
    .post("/knowledge/split", {
      charCount: queryParam.value.charCount,
      content: queryParam.value.content,
      type: parseInt(queryParam.value.type),
    })
    .then((res) => {
      console.log(res)
      if (res.code === 0) {
        splitList.value = res.data;
      }
    });
}

const saveDoc = () => {
  const data: any = queryParam.value;
  data.type = parseInt(data.type);
  saveLoading.value = true;
  baseService
    .post("/knowledge/knowledgeinfo/save", data)
    .then((res) => {
      saveLoading.value = false;
      if (res.code === 0) {
        editStatus.value = 0;
        clearQueryParam();
        ElMessage.success('保存成功！');
      }
    }).catch(() => saveLoading.value = false);
}

const deleteDoc = (id: string) => {
  baseService
    .post("/knowledge/knowledgeinfo/delete", { ids: [parseInt(id)] })
    .then((res) => {
      if (res.code === 0) {
        getList();
        ElMessage.success('删除成功！');
      }
    });
}

const clearQueryParam = () => queryParam.value = {
  documentName: '',
  type: '1',
  content: '',
  charCount: 100
}

const gotoEdit = (index: number) => {
  editStatus.value = 1;
  const list = botMap.value.list;
  if (list && list[index]) {
    queryParam.value = {
      content: list[index].content,
      documentName: list[index].documentName,
      type: list[index].type,
      charCount: list[index].charCount
    }

    baseService
    .get(`/knowledge/knowledgefragmentinfo/split/${list[index].knowledgeId}`)
    .then((res) => {
      if (res.code === 0) {
      }
    });
  }

  
}


</script>

<template>
  <div class="container" v-if="editStatus === 0">
    <div class="top-header">
      <h2 class="top-title">知识文档</h2>
    </div>
    <div class="">
      <el-row class="banner" style="margin-bottom: 1rem;">
        <div class="left">
          <el-input style="width: 240px; margin-right: 1rem;" v-model="botParam.documentName" placeholder="搜索"
            @change="getList"></el-input>
          <el-select v-model="botParam.type" placeholder="分组" style="width: 240px" @change="getList">
            <el-option v-for="item in typeList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </div>
        <div class="right">

          <el-popover trigger="click" placement="bottom-start">
            <template #reference>
              <el-button icon="Plus" type='primary'>添加文档</el-button>
            </template>
            <template #default>
              <div class="popover-more">
                <div @click="changeToAdd('pdf')">文件</div>
                <div @click="changeToAdd('txt')">在线文本</div>
              </div>
            </template>
          </el-popover>
        </div>
      </el-row>
      <el-table :data="botMap.list" style="width: 100%">
        <el-table-column prop="documentName" label="文档名称" width="200" fixed />
        <el-table-column prop="updateTime" label="更新时间" width="160" />
        <el-table-column prop="filePath" label="文档路径" width="150" />
        <el-table-column prop="knowledgeId" label="文档ID" width="150" />
        <el-table-column prop="length" label="长度" width="120" />
        <el-table-column prop="status" label="状态" width="120" />
        <el-table-column prop="type" label="类型" width="120" />
        <el-table-column prop="userId" label="用户ID" width="180" />
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column fixed="right" label="操作" width="120">
          <template #default="scope">
            <el-popover trigger="click" placement="bottom-start">
              <template #reference>
                <div class="item-more" @click.native.stop>
                  <el-button icon="More" type="text">操作</el-button>
                </div>
              </template>
              <template #default>
                <div class="popover-more">
                  <div @click="gotoEdit(scope.$index)">编辑</div>
                  <el-popconfirm title="确定删除？" confirm-button-text="确定" cancel-button-text="取消"
                    @confirm="deleteDoc(scope.row.knowledgeId)">
                    <template #reference>
                      <div>删除</div>
                    </template>
                  </el-popconfirm>
                </div>
              </template>
            </el-popover>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination v-model:current-page="botParam.page" v-model:page-size="botParam.limit"
        :page-sizes="[5, 10, 20, 50]" :small="true" :background="false" layout="total, sizes, prev, pager, next, jumper"
        :total="botMap.total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </div>
    <div>

    </div>
  </div>
  <div class="container container-add" v-else-if="editStatus === 1">
    <div>
      <el-button type="text" icon="Back" @click="editStatus = 0">返回文档</el-button>
    </div>
    <div>
      <h2>添加{{ curType === 'file' ? '文件' : '在线文档' }}</h2>
    </div>
    <div>
      <el-form label-position="top">
        <el-form-item label="分组">
          <el-select v-model="group" placeholder="分组" style="width: 50%" @change="getList">
            <el-option label="默认" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="文档标题">
          <el-input style="width: 100%;" v-model="queryParam.documentName" placeholder="文档标题"></el-input>
        </el-form-item>
        <el-form-item label="内容">
          <el-input type="textarea" :rows="15" style="width: 100%;" v-model="queryParam.content"></el-input>
        </el-form-item>
      </el-form>
    </div>
    <div class="bottom-btns" v-if="fillAddContent">
      <el-button type="primary" @click="editStatus = 2">下一步</el-button>
    </div>
  </div>
  <div class="container container-collection" v-else>
    <div>
      <el-button type="text" icon="Back" @click="editStatus = 0">返回文档</el-button>
    </div>
    <div>
      <h2>添加{{ curType === 'file' ? '文件' : '在线文档' }}</h2>
    </div>
    <div class="main">
      <div class="left">
        <el-form label-position="top">
          <el-form-item label="切分">
            <div style="width: 100%">
              <el-card shadow="never">
                <div class="card-inner">
                  <div class="card-left">
                    <el-icon>
                      <Connection />
                    </el-icon>
                  </div>
                  <div class="card-right">
                    <div class="header">
                      <div class="header-left">
                        <div class="left-title">最大tokens</div>
                        <div class="left-des">知识块的最大 Tokens，系统将以此为标准进行文档切分。</div>
                      </div>
                      <div class="header-right">
                        <el-checkbox v-model="isToken" value="1" @click="isType = false" />
                      </div>
                    </div>
                    <div class="bottom" v-if="isToken">
                      <div>最大Tokens</div>
                      <el-input v-model="queryParam.charCount" placeholder="搜索"></el-input>
                      <el-button type="primary" text icon="Refresh" style="padding: 0; margin-top: 1rem;"
                        @click="updateSplit">更新预览</el-button>
                    </div>
                  </div>
                </div>
              </el-card>
              <el-card shadow="never">
                <div class="card-inner">
                  <div class="card-left">
                    <el-icon>
                      <Flag />
                    </el-icon>
                  </div>
                  <div class="card-right">
                    <div class="header">
                      <div class="header-left">
                        <div class="left-title">切分方式</div>
                        <div class="left-des">系统将按指定的切分方式进行文档切分。</div>
                      </div>
                      <div class="header-right">
                        <el-checkbox v-model="isType" value="1" @click="isToken = false" />
                      </div>
                    </div>
                    <div class="bottom" v-if="isType">
                      <div>切分方式</div>
                      <el-select v-model="queryParam.type" placeholder="切分方式" style="width: 100%">
                        <el-option label="按行" value="1" />
                        <el-option label="按自然段" value="2" />
                        <el-option label="按句子" value="3" />
                        <el-option label="按照最大字符长度进行切分" value="0" />
                      </el-select>
                      <el-button type="primary" text icon="Refresh" style="padding: 0; margin-top: 1rem;"
                        @click="updateSplit">更新预览</el-button>
                    </div>
                  </div>
                </div>
              </el-card>
            </div>
          </el-form-item>
        </el-form>
      </div>
      <div class="right">
        <el-form label-position="top">
          <el-form-item label="切片预览">
            <el-card shadow="never" class="right-card" v-for="(item, index) in splitList">
              <div class="card-top">
                <el-button size="small" icon="Compass">{{ index + 1 }}</el-button>
                <el-button size="small" text icon="Aim">{{ item.length }}</el-button>
              </div>
              <div style="margin-top: 0.5rem;">{{ item.content }}</div>
            </el-card>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div class="bottom-btns">
      <el-button type="primary" @click="saveDoc" :loading="saveLoading">保存</el-button>
      <el-button @click="editStatus = 0">返回</el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.popover-more {
  width: 100%;

  div {
    width: 100%;
    padding: 0 0.5rem;
    height: 2.5rem;
    line-height: 2.5rem;
    border-radius: 0.5rem;
    cursor: pointer;

    &:hover {
      color: #17b3a3;
      background-color: #efecfd;
    }
  }
}

.container {
  width: 100%;
  height: 100%;
  position: relative;

  .bottom-btns {
    border-top: 1px solid #ddd;
    padding-top: 1.5rem;
    width: 100%;
    position: absolute;
    left: 0;
    bottom: 0;
  }
}


.banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.main {
  width: 100%;
  display: flex;

  .left {
    flex: 3;

    .el-card {
      margin-bottom: 1rem;

      .card-inner {
        display: flex;

        .card-left {
          width: 3rem;
          display: flex;
          justify-content: center;
          margin-top: 1rem;
          font-size: 2rem;
          margin-right: 1rem;
          color: #17b3a3;
        }

        .card-right {
          flex: 1;
        }
      }
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .header-left {
        .left-title {
          font-weight: bold;
        }

        .left-des {
          font-size: 0.9rem;
          color: #777;
        }
      }
    }
  }

  .right {
    flex: 2;
    margin-left: 4rem;

    .right-card {
      width: 100%;
      background-color: #f6f8fa;

      .card-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }
  }
}
</style>