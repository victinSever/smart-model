<script setup lang='ts'>
import baseService from '@/service/baseService';
import { ElMessage } from 'element-plus';
import { onMounted, ref } from 'vue';

interface IOptimizationParam {
  model: string;
  n: number;
  prompt: string;
  shortenFlag: boolean;
  thinkChainFlag: boolean;
}

interface IPromptRes {
  source: string;
  sourceToOptimization: string;
  sourceToReasoning: string;
  optimizationToReasoning: string;
}

const manufacturerList = ref<string[]>();
const template = ref('');
const dialogVisible = ref(false);
const optimizationParam = ref<IOptimizationParam>({
  model: '',
  n: 1,
  prompt: '',
  shortenFlag: false,
  thinkChainFlag: true
});
const promptRes = ref<IPromptRes>({
  source: '',
  sourceToOptimization: '',
  sourceToReasoning: '',
  optimizationToReasoning: ''
});
const loading = ref(false);

onMounted(() => {
  getManufacturerList();
})

const getManufacturerList = () => {
  baseService
    .get("/prompt/manufacturer")
    .then((res) => {
      if (res.code === 0) {
        manufacturerList.value = res.data as any[];
        if (manufacturerList.value.length > 0) {
          optimizationParam.value.model = manufacturerList.value[0];
        }
      }
    });
}
const judgeParam = () => {
  const { model, prompt } = optimizationParam.value;
  if (loading.value) {
    return false;
  }
  if (!model.trim()) {
    ElMessage.warning('未选择模型！');
    return false;
  }
  if (!prompt.trim()) {
    ElMessage.warning('原始prompt为空！');
    return false;
  }
  return true;
}
const optimizationPrompt = () => {
  if (!judgeParam()) return;
  promptRes.value.source = optimizationParam.value.prompt;
  loading.value = true;
  baseService
    .post("/prompt/optimization", optimizationParam.value)
    .then((res) => {
      loading.value = false;
      if (res.code === 0) {
        promptRes.value.sourceToOptimization = res.data;
      }
    }).catch(() => loading.value = false);
}

const reasoningPrompt = () => {
  if (!judgeParam()) return;
  loading.value = true;
  baseService
    .post("/prompt/reasoning", {
      model: optimizationParam.value.model,
      prompt: optimizationParam.value.prompt
    })
    .then((res) => {
      loading.value = false;
      if (res.code === 0) {
        promptRes.value.sourceToReasoning = res.data;
      }
    }).catch(() => loading.value = false);

  if (promptRes.value.sourceToOptimization) {
    loading.value = true;
    baseService
      .post("/prompt/reasoning", {
        model: optimizationParam.value.model,
        prompt: promptRes.value.sourceToOptimization
      })
      .then((res) => {
        loading.value = false;
        if (res.code === 0) {
          promptRes.value.optimizationToReasoning = res.data;
        }
      }).catch(() => loading.value = false);
  }
}
</script>

<template>
  <div>
    <div class="top-header">
      <h3 class="top-title">Prompt 优化</h3>
      <p class="top-des">对Prompt语料进行内容质量和结构上的优化，便于获得更符合期望的大模型推理结果。</p>
    </div>
    <el-card class="up-container" shadow="never" style="border: none;">
      <el-row>
        <el-input 
          type="textarea" 
          :rows="3" 
          v-model="optimizationParam.prompt" 
          maxlength="1500" 
          show-word-limit 
          :disabled="loading"
          placeholder="请输入原始Prompt" />
      </el-row>
      <el-row class="prompt-box">
        <div class="config">
          <div class="up-config" @click="dialogVisible = true">
            <el-icon>
              <Operation />
            </el-icon>
            <span>优化参数配置</span>
            <el-icon>
              <ArrowDownBold />
            </el-icon>
          </div>
          <div class="up-config-list">
            <span v-if="optimizationParam.shortenFlag">缩短提示词</span>
            <span v-if="optimizationParam.n > 0">迭代轮次</span>
            <span v-if="optimizationParam.thinkChainFlag">思维链条</span>
          </div>
          <div class="up-model-name">
            <el-icon>
              <HelpFilled />
            </el-icon>
            <span>模型对话</span>
          </div>
          <div class="up-model">
            <el-popover placement="bottom" :width="120" trigger="hover" class="up-model-popover">
              <template #reference>
                <div class="up-model">
                  <el-icon>
                    <DataLine />
                  </el-icon>
                  <span>{{ optimizationParam.model }}</span>
                  <el-icon>
                    <ArrowDownBold />
                  </el-icon>
                </div>
              </template>
              <template #default>
                <div class="manufacturer-list">
                  <div class="manufacturer-item" v-for="item in manufacturerList"
                    @click="optimizationParam.model = item">
                    <span v-text="item"></span>
                  </div>
                </div>
              </template>
            </el-popover>
          </div>
        </div>
        <div class="btns">
          <el-button 
            type="primary" 
            @click="optimizationPrompt" 
            :disabled="loading"
          >优化</el-button>
          <el-button 
            type="primary" 
            @click="reasoningPrompt"
            :disabled="loading"
          >推理</el-button>
        </div>
      </el-row>
      <el-row>
          <div style="width: 100%;" class="card-show" >
            <div  class="card-item card-left">
              <div>
                <span class="title">原始</span>
              </div>
              <div class="prompt">
                <p class="prompt-title">Prompt：</p>
                <p class="text">{{ promptRes.source }}</p>
              </div>
              <div class="result">
                <p class="result-title">推理结果：
                </p>
                <p class="text">
                  {{ promptRes.sourceToReasoning }}
                </p>
                <p class="tips" v-if="promptRes.sourceToReasoning">AI⽣成内容仅供参考，不代表平台⽴场。</p>
              </div>
            </div>
            <div  class="card-item card-right">
              <div>
                <span class="title">优化后</span>
              </div>
              <div class="prompt">
                <p class="prompt-title">Prompt：</p>
                <p class="text">{{ promptRes.sourceToOptimization }}</p>
                <p class="tips" v-if="promptRes.sourceToOptimization">AI⽣成内容仅供参考，不代表平台⽴场。</p>
              </div>
              <div class="result">
                <p class="result-title">
                  推理结果：
                </p>
                <p class="text">
                  {{ promptRes.optimizationToReasoning }}
                </p>
                <p class="tips" v-if="promptRes.optimizationToReasoning">AI⽣成内容仅供参考，不代表平台⽴场。</p>
              </div>
            </div>
          </div>
      </el-row>
    </el-card>
  </div>
  <el-dialog v-model="dialogVisible" :show-close="false" width="600" top="20vh" title="参数配置">
    <el-row class="dialog-main">
      <el-form :inline="false" :model="optimizationParam" class="dialog-form" label-width="100px" label-position="left">
        <el-form-item label="思维链条">
          <el-switch v-model="optimizationParam.thinkChainFlag" />
          <p class="tip">开启后将指引模型拆解Prompt内容，逐步进行推理。建议仅在数学计算、逻辑推理等场景下开启使用</p>
        </el-form-item>
        <el-form-item label="缩短提示词：">
          <div style="width: 100%;">
            <el-switch v-model="optimizationParam.shortenFlag" />
          </div>
          <p class="tip">可以省去“的”、“吧”等含义不强的文本实体，精炼语料内容并降低推理成本</p>
        </el-form-item>
        <el-form-item label="迭代轮次：">
          <el-input v-model="optimizationParam.n" type="number" max="10" min="0" style="width: 100px;" />
          <p class="tip">反复迭代Prompt优化，更多的迭代次数意味着优化效果越强，但也需要花费更长时间</p>
        </el-form-item>
      </el-form>
    </el-row>
    <template #footer>
      <el-button @click="dialogVisible = false">关闭</el-button>
      <el-button @click="dialogVisible = false" type="primary">确定</el-button>
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

.up-container {
  width: 100%;
  margin-top: 1rem;

  .prompt-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 1rem 0;

    .config {
      display: flex;
      align-items: center;
      font-size: 0.85rem;

      .up-model-name,
      .up-config-list,
      .up-config,
      .up-model {
        display: flex;
        align-items: center;
        margin-right: 0.8rem;

        span {
          margin: 0.3rem;
        }
      }

      .up-config-list {
        span {
          background-color: #f7f7f9;
          border-radius: 3px;
          padding: 0.3rem 0.5rem;
        }
      }

      .up-config,
      .up-model {
        cursor: pointer;
      }
    }
  }

  .card-show {
    min-height: 500px;
    border-radius: 0.5rem;
    box-sizing: border-box;
    border: 1px solid #ddd;
    display: flex;
    background-image: url(@/assets/images/prompt-item-bgc.png);
      background-size: cover;

    .card-item {
      flex: 1;
      height: 100%;
      padding: 2rem;
      .title {
        font-size: 1.5rem;
      }
      .title, .result-title, .prompt-title {
        color: #84868c;
      }
      .prompt, .result {
        margin-top: 2rem;
      }
      .text {
        line-height: 2;
      }
      .result {
        border-top: 1px dashed #a8caff;
        .result-title {
          font-size: 1.3rem;
        }
      }
      .tips {
        font-size: 0.85rem;
        color: #84868c;
      }
    }

    .card-left {
      border-right: 1px solid #ddd;
    }
  }

  .el-textarea :deep(.el-textarea__inner) {
    border-radius: 0.5rem;
  }
}

.manufacturer-list {
  .manufacturer-item {
    padding: 0 0.5rem;
    height: 2rem;
    line-height: 2rem;
    cursor: pointer;
    font-size: 0.85rem;

    &:hover {
      background-color: #e6f0ff;
    }
  }
}

.dialog-main {
  .tip {
    font-size: 0.85rem;
    color: #84868c;
  }
}
</style>