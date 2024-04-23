<script setup lang='ts'>
import {
  CirclePlus,
  ArrowRight,
  MagicStick,
  Plus
} from '@element-plus/icons-vue';
import { onMounted, ref } from 'vue';
import { useRouter } from "vue-router";
import { Search } from '@element-plus/icons-vue';
import baseService from '@/service/baseService';
import { copyTextToClipboard } from "@/utils/utils";
import { ElMessage } from "element-plus";

interface IPromptParam {
  limit: number;
  order?: string;
  orderField?: string;
  page: number,
  templateName?: string;
  isPublic?: number;
  category?: string;
}

const router = useRouter();
const promptTmp = ref('prompt-tem');
const promptParam = ref<IPromptParam>({
  limit: 10,
  order: 'des',
  orderField: '',
  page: 1,
  templateName: '',
  isPublic: 1,
  category: ''
});
const promptMap = ref<{
  list: any[],
  total: number
}>({
  list: [],
  total: 0
});
const promptCate = ref<string[]>([]);
const isPublic = ref(true);
const dialogVisible = ref(false);
const dialogItem = ref<any>({})


onMounted(() => {
  getPrompt();
  getPromptCate();
});

const gotoCreatePrompt = () => {
  router.push({ path: '/prompt/prompt-create' });
}

const gotoUpdatePrompt = () => {
  router.push({ path: '/prompt/prompt-up' });
}

const getPrompt = () => {
  promptParam.value.isPublic = isPublic.value ? 1 : 0;
  baseService
    .get("/prompt/page", promptParam.value)
    .then((res) => {
      if (res.code === 0) {
        promptMap.value = res.data;
      }
    });
}

const getPromptCate = () => {
  baseService
    .get("/prompt/category")
    .then((res) => {
      if (res.code === 0) {
        promptCate.value = res.data.category;
      }
    });
}

const changeSelectedPromptCate = (text: string) => {
  promptParam.value.category = promptParam.value.category === text ? '' : text;
  getPrompt();
}

const handleSizeChange = (val: number) => {
  promptParam.value.limit = val;
  getPrompt();
}
const handleCurrentChange = (val: number) => {
  promptParam.value.page = val;
  getPrompt();
}

const openDialogVisible = (item: any) => {
  dialogVisible.value = true;
  dialogItem.value = item;
}

const copyText = (text: string, item: any, e: MouseEvent) => {
  e.stopPropagation();
  if (copyTextToClipboard(text)) {
    baseService
      .post("/prompt/starOrCopy", {
        promptId: item.promptId,
        type: 3
      })
      .then((res) => {
        if (res.code === 0) {
          getPrompt();
          ElMessage({
            type: 'success',
            message: `复制成功`,
          })
        }
      });
  }
}

const starText = (item: any, e: MouseEvent) => {
  e.stopPropagation();
  baseService
    .post("/prompt/starOrCopy", {
      promptId: item.promptId,
      type: 1
    })
    .then((res) => {
      if (res.code === 0) {
        getPrompt();
      }
    });
}

</script>

<template>
  <div class="top-header">
    <h3 class="top-title">Prompt 模板</h3>
    <p class="top-des">管理和查看prompt模板，支持在服务调用时组合prompt输入推理。</p>
  </div>
  <el-row :gutter="20" class="banner">
    <el-col :span="12">
      <el-card class="banner-session" shadow="hover" @click="gotoCreatePrompt">
        <div class="session-box">
          <div class="left">
            <el-icon>
              <CirclePlus />
            </el-icon>
          </div>
          <div class="center">
            <div class="center-top">
              <div>创建你的Prompt</div>
              <el-icon>
                <ArrowRight />
              </el-icon>
            </div>
            <p>保存和管理prompt模板，支持在服务调用时组合 prompt输入推理。</p>
          </div>
        </div>
      </el-card>
    </el-col>
    <el-col :span="12">
      <el-card class="banner-session" shadow="hover" @click="gotoUpdatePrompt">
        <div class="session-box">
          <div class="left">
            <el-icon>
              <MagicStick />
            </el-icon>
          </div>
          <div class="center">
            <div class="center-top">
              <div>在线优化Prompt</div>
              <el-icon>
                <ArrowRight />
              </el-icon>
            </div>
            <p>对Prompt进行内容质量和结构上的优化获得更符合期望的大模型推理结果。</p>
          </div>
        </div>
      </el-card>
    </el-col>
  </el-row>
  <el-row>
    <el-tabs v-model="promptTmp" class="tab-container">
      <el-tab-pane label="预制模板" name="prompt-tem">
        <div>
          <el-button :icon="Plus" type='primary' @click="gotoCreatePrompt">创建模板</el-button>
          <el-input v-model="promptParam.templateName" style="width: 240px; margin-left: 2rem;" placeholder="输入模型名称"
            :suffix-icon="Search" @change="getPrompt" />
          <span style="margin: 0 0.5rem 0 2rem;">公开</span>
          <el-switch v-model="isPublic" @change="getPrompt" />
        </div>
        <div class="prompt-cate">
          <span :class="['cate-item', { 'active': promptParam.category === item }]" v-for="item in promptCate"
            v-text="item" @click="changeSelectedPromptCate(item)"></span>
        </div>
        <div class="prompt-list">
          <el-card @click="openDialogVisible(item)" v-for="item in promptMap.list" class="prompt-item" shadow="hover">
            <el-row class="item-top">
              <span class="item-title" v-text="item.templateName"></span>
              <el-button class="item-copy" v-text="'复制'" size="small"
                @click="(e: MouseEvent) => copyText(item.content, item, e)"></el-button>
            </el-row>
            <el-row>
              <span class="item-category" v-text="item.category"></span>
            </el-row>
            <el-row>
              <p class="item-des" v-html="item.content"></p>
            </el-row>
            <el-row class="item-bottom">
              <div class="item-session item-star" @click="(e: MouseEvent) => starText(item, e)">
                <el-icon>
                  <svg t="1713873123919" class="icon" viewBox="0 0 1024 1024" version="1.1"
                    xmlns="http://www.w3.org/2000/svg" p-id="1513" xmlns:xlink="http://www.w3.org/1999/xlink"
                    width="200" height="200">
                    <path
                      d="M757.76 852.906667c36.906667-0.021333 72.832-30.208 79.296-66.56l51.093333-287.04c10.069333-56.469333-27.093333-100.522667-84.373333-100.096l-10.261333 0.085333a19972.266667 19972.266667 0 0 1-52.842667 0.362667 3552.853333 3552.853333 0 0 1-56.746667 0l-30.997333-0.426667 11.498667-28.8c10.24-25.642667 21.76-95.744 21.504-128.021333-0.618667-73.045333-31.36-114.858667-69.290667-114.410667-46.613333 0.554667-69.461333 23.466667-69.333333 91.136 0.213333 112.661333-102.144 226.112-225.130667 225.109333a1214.08 1214.08 0 0 0-20.629333 0l-3.52 0.042667c-0.192 0 0.64 409.109333 0.64 409.109333 0-0.085333 459.093333-0.490667 459.093333-0.490666z m-17.301333-495.914667a15332.288 15332.288 0 0 0 52.693333-0.362667l10.282667-0.085333c84.010667-0.618667 141.44 67.52 126.72 150.250667L879.061333 793.813333c-10.090667 56.661333-63.68 101.696-121.258666 101.76l-458.922667 0.384A42.666667 42.666667 0 0 1 256 853.546667l-0.853333-409.173334a42.624 42.624 0 0 1 42.346666-42.730666l3.669334-0.042667c5.909333-0.064 13.12-0.064 21.333333 0 98.176 0.789333 182.293333-92.437333 182.144-182.378667C504.469333 128.021333 546.24 86.186667 616.106667 85.333333c65.173333-0.768 111.68 62.506667 112.448 156.714667 0.256 28.48-6.848 78.826667-15.701334 115.050667 8.021333 0 17.28-0.042667 27.584-0.106667zM170.666667 448v405.333333h23.466666a21.333333 21.333333 0 0 1 0 42.666667H154.837333A26.709333 26.709333 0 0 1 128 869.333333v-437.333333c0-14.784 12.074667-26.666667 26.773333-26.666667h38.912a21.333333 21.333333 0 0 1 0 42.666667H170.666667z"
                      fill="#3D3D3D" p-id="1514">
                    </path>
                  </svg>
                </el-icon>
                <span>{{ item.star }}</span>
              </div>
              <div class="item-session item-copyCount">
                <el-icon><Crop /></el-icon>
                <span>{{ item.copyCount }}</span>
              </div>
            </el-row>
          </el-card>
        </div>

        <el-pagination v-model:current-page="promptParam.page" v-model:page-size="promptParam.limit"
          :page-sizes="[5, 10, 20, 50]" :small="true" :background="false"
          layout="total, sizes, prev, pager, next, jumper" :total="promptMap.total" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </el-tab-pane>
    </el-tabs>
  </el-row>

  <el-dialog v-model="dialogVisible" :show-close="false" width="700" top="20vh"
    :title="'模板详情（' + dialogItem.templateName + '）'">
    <el-row class="dialog-main">
      <el-col :span="11" class="left-container">
        <el-row class="top-title">
          <span>Prompt：</span>
          <span>模板</span>
          <span>实例</span>
        </el-row>
        <el-row class="template-box">
          <p class="item-des" v-html="dialogItem.content"></p>
          <el-row>
            <el-button v-text="'复制'"
              @click="(e: MouseEvent) => copyText(dialogItem.content, dialogItem, e)"></el-button>
          </el-row>
        </el-row>
        <el-row>
          <el-form :inline="false" :model="dialogItem" class="demo-form-inline" label-width="80px"
            label-position="left">
            <el-form-item label="模板来源">
              <span>{{ '预制模板' }}</span>
            </el-form-item>
            <el-form-item label="场景类型">
              <span>{{ dialogItem.category }}</span>
            </el-form-item>
            <el-form-item label="参数格式">
              <span>{{ dialogItem.parameterFormat }}</span>
            </el-form-item>
            <el-form-item label="创建时间">
              <span>{{ dialogItem.createTime }}</span>
            </el-form-item>
            <el-form-item label="点赞数">
              <el-row>
                <el-col :span="12"><span>{{ dialogItem.star }}</span></el-col>
              </el-row>
            </el-form-item>
            <el-form-item label="复制次数">
              <el-row>
                <el-col :span="12"><span>{{ dialogItem.copyCount }}</span></el-col>
              </el-row>
            </el-form-item>
          </el-form>
        </el-row>
      </el-col>
      <el-col :span="12" :offset="1" class="right-container">
        <el-row>
          <span>推理结果：</span>
        </el-row>
        <el-row class="result">
          <p v-html="dialogItem.inferenceResult"></p>
        </el-row>
      </el-col>
    </el-row>
    <template #footer>
      <el-button @click="dialogVisible = false" type="primary">关闭</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.top-header {
  border-bottom: 1px solid #e8e9eb;

  .top-des {
    font-size: 0.85rem;
  }
}

.banner {
  margin: 20px 0;
  display: flex;

  .banner-session {
    flex: 1;
    cursor: pointer;

    .session-box {
      display: flex;
      justify-content: space-between;
    }

    .left {
      width: 50px;
      font-size: 3rem;
      display: flex;
      align-items: center;

    }

    .center {
      flex: 1;
      margin-left: 1rem;
      display: flex;
      flex-direction: column;
      justify-content: center;

      .center-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      p {
        margin-bottom: 0;
        font-size: 0.85rem;
        line-height: 2;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        /* 显示最多两行 */
        overflow: hidden;
      }
    }
  }
}

.tab-container {
  width: 100%;

  .prompt-cate {
    width: 100%;
    background-color: #fafafb;
    display: flex;
    align-items: center;
    padding: 1rem 1.5rem;
    margin-top: 1rem;
    font-size: 0.85rem;

    .cate-item {
      margin: 0 0.5rem;
      display: inline-block;
      padding: 0.3rem 0.5rem;
      cursor: pointer;
      border-radius: 3px;

      &:hover {
        color: #2468f2;
        background-color: #eef3fe;
      }
    }

    .active {
      color: #2468f2;
      background-color: #eef3fe;
    }
  }

  .prompt-list {
    min-height: 400px;
    margin-top: 1rem;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(20%, 1fr));
    gap: 1.5rem;
    align-content: start;
    grid-auto-rows: auto;

    .prompt-item {
      margin-left: 0;
      margin-right: 0;
      cursor: pointer;
      font-size: 0.85rem;
      background-image: url(@/assets/images/prompt-item-bgc.png);
      background-size: cover;

      .item-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;

        .item-title {
          font-size: 1.2rem;
        }
      }

      .item-category {
        background-color: #e6f9ff;
        padding: 0.3rem 0.5rem;
        border-radius: 3px;
      }


      .item-des {
        line-height: 2;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        /* 显示最多两行 */
        overflow: hidden;
        color: #635656;
        min-height: 3.4rem;
      }

      .item-bottom {
        display: flex;
        justify-content: flex-end;
        align-items: center;

        .item-session {
          display: flex;
          align-items: center;
          margin-left: 1rem;

          span {
            margin-left: 0.3rem;
            transform: translateY(1px);
          }
        }
      }
    }
  }
}

.dialog-main {
  .top-title {
    span {
      margin-right: 0.5rem;
    }
  }

  .template-box {
    margin: 1rem 0;
    background-color: #f7f7f9;
    padding: 0.75rem 1rem;
    line-height: 2;
    border-radius: 0.5rem;

    .el-row {
      width: 100%;
      display: flex;
      justify-content: flex-end;
    }

  }

  .result {
    margin: 1rem 0;
    background-color: #f7f7f9;
    padding: 0.75rem 1rem;
    line-height: 2;
    border-radius: 0.5rem;
  }
}

@media screen and (max-width: 1400px) {
  .tab-container .prompt-list {
    grid-template-columns: repeat(auto-fit, minmax(calc(33.33% - 20px), 1fr));
  }
}
</style>