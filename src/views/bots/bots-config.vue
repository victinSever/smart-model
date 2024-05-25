<script setup lang='ts'>
import baseService from '@/service/baseService';
import { dataToSelectGroup } from '@/utils/utils';
import { ElMessage, ElMessageBox } from 'element-plus';
import { computed, nextTick, onMounted, ref } from 'vue';
import { useRoute } from "vue-router";

const route = useRoute();
const botInfo = ref<any>({});
const modelList = ref<any>();
const modeListGroup = computed(() => dataToSelectGroup(modelList.value));
const identityPrompt = ref(`1、建议身份提示文字更加精准、条理、清晰和逻辑
2、简短不等于清晰，所以无需过于在意内容的多少，越高质量的身份提示文字将可获得更高质量的AI响应
3、使用不同的分隔符以区分不同类型的提示内容，以便让 AI 清晰辨别
4、尽可能提供正确示例，以帮助 AI 正确输出内容
`);
const collapseName = ref('1');
const chatInput = ref('');
const chatHistoryList = ref<Array<{ role: string; content: string; }>>([]);
const scrollContainer = ref<HTMLElement | null>(null);
const loading = ref(false);
const openShare = ref(false);
const shareConfig = ref({
  lastTime: '1',
  url: ''
});
const chatResult = ref<any>({
  guessQuestion: [],
  knowledgeData: [],
  message: {
    content: '',
    role: ''
  }
});
const suggestionText = computed(() => {
  const list = chatResult.value.guessQuestion;
  return list && list.length > 0 ? list[0] : '';
});
const showKnowlegde = computed(() => {
  return botInfo.value.knowledgeFlag;
});
const drawerShowKnowlegde = ref(false);

onMounted(() => {
  getBot();
  getModelList();
});

const changeModelName = (modelId: string) => {
  for (const item of modeListGroup.value) {
    const option = item.options.find((op: any) => op.value === modelId);
    if (option) {
      botInfo.value.modelName = option.label;
      break;
    };
  }
}

const getBot = () => {
  const botId = route.query.botId || '1';
  baseService
    .get(`/bot/botinfo/${botId}`)
    .then((res) => {
      if (res.code === 0) {
        botInfo.value = res.data;
        botInfo.value.knowledgeDisplaySwitch = res.data.knowledgeDisplaySwitch === 1;
        botInfo.value.suggestionFlag = res.data.suggestionFlag === 1;
        getChatHistory(res.data.botId);
      }
    });
}

const getModelList = () => {
  baseService
    .get("/bot/model/ModelSecondaryList", botInfo.value)
    .then((res) => {
      if (res.code === 0) {
        modelList.value = res.data;
      }
    });
}

const updateBot = () => {
  botInfo.value.knowledgeDisplaySwitch = botInfo.value.knowledgeDisplaySwitch ? 1 : 0;
  botInfo.value.suggestionFlag = botInfo.value.suggestionFlag ? 1 : 0;
  baseService
    .post("/bot/botinfo/update", botInfo.value)
    .then((res) => {
      if (res.code === 0) {
        ElMessage.success('保存成功');
      }
    });
}

const submitChat = () => {
  if (loading.value) return;

  let chatContent = chatInput.value;
  chatHistoryList.value.push({
    role: 'user',
    content: chatContent
  });
  chatHistoryList.value.push({
    role: 'assistant',
    content: 'loading'
  });
  loading.value = true;
  chatInput.value = '';
  scrollToBottom();
  const value = botInfo.value;
  baseService
    .post("/bot/chat", {
      botId: value.botId,
      modelId: value.modelId,
      knowledgeBaseId: value.knowledgeBaseId,
      content: chatContent,
      botName: value.botName,
      describe: value.describe,
      identityPrompt: value.identityPrompt,
      suggestionFlag: value.suggestionFlag,
      temperature: value.temperature,
      memoryConfig: {
        flag: value.memoryFlag || false,
        memoryStrategy: value.memoryStrategy
      },
      knowledgeConfig: {
        flag: value.knowledgeFlag || false,
        relativity: value.relativity,
        matchingQuantity: value.matchingQuantity,
        knowledgeNull: parseInt(value.knowledgeNull) || 0,
        knowledgeDisplaySwitch: value.knowledgeDisplaySwitch,
      }
    })
    .then((res) => {
      loading.value = false;
      if (res.code === 0) {
        scrollToBottom();
        chatResult.value = res.data;
        chatHistoryList.value.pop();
        chatHistoryList.value.pop();
        chatHistoryList.value.push({ content: chatContent, role: 'user' });
        chatHistoryList.value.push({ content: res.data.message.content, role: 'assistant' });
      }
    }).catch(() => {
      chatHistoryList.value.pop();
      chatHistoryList.value.pop();
      loading.value = false;
    });
}

const getChatHistory = (id: string) => {
  baseService
    .get(`/bot/chat/history/${id}`)
    .then((res) => {
      if (res.code === 0 && res.data) {
        chatHistoryList.value = res.data;
        scrollToBottom();
        if (botInfo.value.suggestionFlag && res.data.length !== 0) {
          ElMessage.success(botInfo.value.guide);
        }
      }
    });
}

const flushChat = () => {
  ElMessageBox.confirm('是否清除所有聊天记录？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      baseService
        .get(`/bot/chat/flush/${botInfo.value.botId}`)
        .then((res) => {
          if (res.code === 0) {
            getChatHistory(botInfo.value.botId);
            ElMessage.success('聊天已重置');
          }
        });
    })
}

const scrollToBottom = () => {
  nextTick(() => {
    if (scrollContainer.value) {
      const content = scrollContainer.value.querySelector('.list-content');
      if (content) {
        scrollContainer.value.scrollTo({
          top: content.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  })
};

const handleCreateLink = () => {
  if (!botInfo.value) return;
  baseService
    .get(`/bot/chat/share/${botInfo.value.botId}/${shareConfig.value.lastTime}`)
    .then((res) => {
      if (res.code === 0) {
        const baseRoute = 'history'
        shareConfig.value.url = `${window.location.origin}/#/${baseRoute}/${res.data}`
      }
    });
}

const handleSubmitSuggestion = () => {
  chatInput.value = suggestionText.value;
  chatResult.value.guessQuestion = [];
  scrollToBottom();
}
</script>

<template>
  <el-row class="container">
    <el-col class="left-container" :span="12">
      <div class="top-header">
        <div>
          <h3 class="top-title">Bot设置</h3>
          <el-button type="primary" @click="updateBot">保存</el-button>
        </div>
      </div>

      <el-collapse v-model="collapseName">
        <el-collapse-item name="1">
          <template #title>
            <div class="collapse-item-title">
              <el-icon>
                <Mug />
              </el-icon>
              <span>LLM</span>
            </div>
          </template>
          <el-card class="bot-config" shadow="never">
            <el-form :model="botInfo" label-position="left" label-width="160px">
              <el-form-item label="bot名称（LLM）">
                <el-input placeholder="Bot名称" v-model="botInfo.botName"></el-input>
              </el-form-item>
              <el-form-item label="大语言模型（LLM）">
                <el-select v-model="botInfo.modelId" placeholder="请选择" @change="changeModelName" style="width: 100%;">
                  <el-option-group v-for="group in modeListGroup" :key="group.label" :label="group.label">
                    <el-option v-for="item in group.options" :key="item.value" :label="item.label"
                      :value="item.value" />
                  </el-option-group>
                </el-select>
              </el-form-item>
              <el-form-item>
                <template #label>
                  <div class="label-box">
                    <span>温度</span>
                    <el-tooltip effect="dark" placement="right">
                      <template #content>
                        <div>较低数值会让 LLM 响应更加准确<br />和稳定，较高数值更加随机和创造。</div>
                      </template>
                      <el-icon>
                        <BellFilled />
                      </el-icon>
                    </el-tooltip>
                  </div>
                </template>
                <div class="content-box">
                  <el-popover placement="bottom-start" trigger="click" :width="400">
                    <template #reference>
                      <span>{{ botInfo.temperature }}</span>
                    </template>
                    <el-form :model="botInfo" label-position="left" label-width="120px">
                      <el-form-item label="温度">
                        <el-input-number v-model="botInfo.temperature" :min="-47" :max="1400" size="small"></el-input-number>
                      </el-form-item>
                    </el-form>
                  </el-popover>
                </div>
              </el-form-item>
              <el-form-item label-width="0">
                <div style="display: flex; flex-direction: column; width: 100%;">
                  <label for="identityPrompt" style="color: #777;">身份提示(Identity Prompt)</label>
                  <el-input name="identityPrompt" :placeholder="identityPrompt" v-model="botInfo.identityPrompt"
                    type="textarea" :rows="8" maxlength="13004" show-word-limit></el-input>
                </div>
              </el-form-item>
            </el-form>
          </el-card>
        </el-collapse-item>
        <el-collapse-item name="2">
          <template #title>
            <div class="collapse-item-title">
              <el-icon>
                <Coordinate />
              </el-icon>
              <span>知识库设置</span>
            </div>
          </template>
          <el-card class="bot-config" shadow="never">
            <el-form :model="botInfo" label-position="left" label-width="160px">
              <el-form-item>
                <template #label>
                  <div class="label-box">
                    <span>是否开启知识库设置</span>
                  </div>
                </template>
                <el-switch v-model="botInfo.knowledgeFlag"></el-switch>
              </el-form-item>
              <el-form-item>
                <template #label>
                  <div class="label-box">
                    <span>知识数量</span>
                    <el-tooltip effect="dark" placement="right">
                      <template #content>
                        <div>Bot 可用的知识数量，更多更高质量<br />的知识可以让 Bot 响应更准确和优<br />秀。</div>
                      </template>
                      <el-icon>
                        <BellFilled />
                      </el-icon>
                    </el-tooltip>
                  </div>
                </template>
                <div class="content-box">
                  <el-popover placement="top-start" trigger="click" content="去知识库上传" :show-arrow="false">
                    <template #reference>
                      <span>{{ botInfo.matchingQuantity }}条知识可用</span>
                    </template>
                  </el-popover>
                </div>
              </el-form-item>
              <el-form-item>
                <template #label>
                  <div class="label-box">
                    <span>召回机制</span>
                    <el-tooltip effect="dark" placement="right">
                      <template #content>
                        <div>配置召回机制和参数，从知识库检索<br />并召回最准确的知识数据。</div>
                      </template>
                      <el-icon>
                        <BellFilled />
                      </el-icon>
                    </el-tooltip>
                  </div>
                </template>
                <div class="content-box">
                  <el-popover placement="bottom-start" trigger="click" :width="400" :show-arrow="false">
                    <template #reference>
                      <span>知识相关性：{{ botInfo.relativity }}</span>
                    </template>
                    <el-form :model="botInfo" label-position="left" label-width="120px">
                      <el-form-item label="知识相关性">
                        <el-input-number v-model="botInfo.relativity" :min="0" :max="100" size="small"></el-input-number>
                      </el-form-item>
                    </el-form>
                  </el-popover>
                  <el-popover placement="bottom-start" trigger="click" :width="400" :show-arrow="false">
                    <template #reference>
                      <span>召回数量：{{ botInfo.matchingQuantity }}</span>
                    </template>
                    <el-form :model="botInfo" label-position="left" label-width="120px">
                      <el-form-item label="召回数量">
                        <el-input-number v-model="botInfo.matchingQuantity" :min="0" :max="100" size="small"></el-input-number>
                      </el-form-item>
                    </el-form>
                  </el-popover>
                </div>
              </el-form-item>
              <el-form-item label="知识检索为空">
                <template #label>
                  <div class="label-box">
                    <span>知识检索为空</span>
                    <el-tooltip effect="dark" placement="right">
                      <template #content>
                        <div>当用户提问在知识库内检索不到任何结果时，Bot 的回复模式。<br />
                          - LLM 响应：Bot 使用 LLM 本身的知识和推理能力，去响应用户。<br />
                          - 预置响应： Bot 不通过 LLM 响应，而是通过设置的固定回复语进行响应。<br />
                          注意，选择该选项会导致 Tools 也无法调用。</div>
                      </template>
                      <el-icon>
                        <BellFilled />
                      </el-icon>
                    </el-tooltip>
                  </div>
                </template>
                <div class="content-box">
                  <el-popover placement="bottom-start" trigger="click" :width="400" :show-arrow="false">
                    <template #reference>
                      <span v-if="botInfo.knowledgeNull && botInfo.knowledgeNull == 1">知识库未找到对应数据</span>
                      <span v-else>正常返回</span>
                    </template>
                    <el-form :model="botInfo" label-position="left" label-width="120px">
                      <el-form-item label="知识检索为空">
                        <el-radio-group v-model="botInfo.knowledgeNull" class="ml-4">
                          <el-radio value="0" label="0" size="large">正常返回</el-radio>
                          <el-radio value="1" label="1" size="large">知识库未找到对应数据</el-radio>
                        </el-radio-group>
                      </el-form-item>
                    </el-form>
                  </el-popover>
                </div>
              </el-form-item>
              <el-form-item>
                <template #label>
                  <div class="label-box">
                    <span>展示引用知识</span>
                    <el-tooltip effect="dark" placement="right">
                      <template #content>
                        <div>是否允许在对话界面，为用户展示 <br /> Bot 回答时所引用的知识库内容。</div>
                      </template>
                      <el-icon>
                        <BellFilled />
                      </el-icon>
                    </el-tooltip>
                  </div>
                </template>
                <el-switch v-model="botInfo.knowledgeDisplaySwitch"></el-switch>
              </el-form-item>
            </el-form>
          </el-card>
        </el-collapse-item>
        <el-collapse-item name="3">
          <template #title>
            <div class="collapse-item-title">
              <el-icon>
                <CoffeeCup />
              </el-icon>
              <span>记忆</span>
            </div>
          </template>
          <el-card class="bot-config" shadow="never">
            <el-form :model="botInfo" label-position="left" label-width="160px">
              <el-form-item>
                <template #label>
                  <div class="label-box">
                    <span>是否开启记忆设置</span>
                  </div>
                </template>
                <el-switch v-model="botInfo.memoryFlag"></el-switch>
              </el-form-item>
              <el-form-item>
                <template #label>
                  <div class="label-box">
                    <span>短期记忆</span>
                    <el-tooltip effect="dark" placement="right">
                      <template #content>
                        <div>最近 N 轮的对话历史作为上下文<br />
                          帮助 Bot 提升响应质量。<br />
                        </div>
                      </template>
                      <el-icon>
                        <BellFilled />
                      </el-icon>
                    </el-tooltip>
                  </div>
                </template>
                <div class="content-box"> 
                  <el-popover placement="bottom-start" trigger="click" :width="400" :show-arrow="false">
                    <template #reference>
                      <span>启用最近{{ botInfo.memoryStrategy }}轮聊天记录</span>
                    </template>
                    <el-form :model="botInfo" label-position="left" label-width="120px">
                      <el-form-item label="短期记忆">
                        <el-input-number v-model="botInfo.memoryStrategy" :min="0" :max="100" size="small"></el-input-number>
                      </el-form-item>
                    </el-form>
                  </el-popover>
                </div>
              </el-form-item>
            </el-form>
          </el-card>
        </el-collapse-item>
        <el-collapse-item name="4">
          <template #title>
            <div class="collapse-item-title">
              <el-icon>
                <Ship />
              </el-icon>
              <span>欢迎引导</span>
            </div>
          </template>
          <el-card class="bot-config" shadow="never">
            <el-form :model="botInfo" label-position="left" label-width="160px">
              <el-form-item>
                <template #label>
                  <div class="label-box">
                    <span>用户提问建议</span>
                    <el-tooltip effect="dark" placement="right">
                      <template #content>
                        <div>是否为用户提供 3 个问题，以引导用<br /> 户继续与 Bot 对话。该功能将会消耗<br /> 额外的积分。</div>
                      </template>
                      <el-icon>
                        <BellFilled />
                      </el-icon>
                    </el-tooltip>
                  </div>
                </template>
                <el-switch v-model="botInfo.suggestionFlag"></el-switch>
              </el-form-item>
              <el-form-item>
                <template #label>
                  <div class="label-box">
                    <span>Bot欢迎语</span>
                  </div>
                </template>
                <el-input name="identityPrompt" placeholder="用户首次使用Bot的欢迎语" v-model="botInfo.guide" type="textarea"
                  :rows="8" maxlength="13004" show-word-limit></el-input>
              </el-form-item>
            </el-form>
          </el-card>
        </el-collapse-item>
      </el-collapse>
    </el-col>

    <el-col class="right-container" :span="12">
      <div class="top-header">
        <div v-if="!openShare" class="header-content">
          <div class="header-title">
            <p class="top-title" style="font-size: 1.2rem;">调试</p>
            <div class="top-header-btns">
              <el-tooltip class="box-item" effect="dark" content="知识库" placement="top" v-if="showKnowlegde">
                <span @click="drawerShowKnowlegde = true">
                  <el-icon>
                    <Histogram />
                  </el-icon>
                </span>
              </el-tooltip>
              <el-tooltip class="box-item" effect="dark" content="分享" placement="top">
                <span @click="openShare = true">
                  <el-icon>
                    <Share />
                  </el-icon>
                </span>
              </el-tooltip>
              <el-tooltip class="box-item" effect="dark" content="重置会话" placement="top">
                <span @click="flushChat">
                  <el-icon>
                    <DeleteFilled />
                  </el-icon>
                </span>
              </el-tooltip>
            </div>
          </div>
        </div>
        <div v-else class="header-content share-content">
          <div class="header-title">
            <p class="top-title" style="font-size: 1.2rem;">分享</p>
            <el-icon @click="openShare = false" size="20">
              <Close />
            </el-icon>
          </div>
          <el-input v-model="shareConfig.url" placeholder="点击生成分享链接">
            <template #append>
              <el-button type="primary" @click="handleCreateLink">生成分享链接</el-button>
            </template>
          </el-input>
          <el-radio-group v-model="shareConfig.lastTime" style="margin-top: 1rem;">
            <el-radio value="1" label="1">1天</el-radio>
            <el-radio value="2" label="2">7天</el-radio>
            <el-radio value="3" label="3">30天</el-radio>
          </el-radio-group>
        </div>
      </div>
      <div class="chat-content" ref="scrollContainer">
        <div class="list-content">
          <div :class="['session-item', { 'session-user': item.role === 'user' }]" v-for="item in chatHistoryList">
            <div class="item-user">
              <svg v-if="item.role !== 'user'" t="1713974680474" class="icon" viewBox="0 0 1024 1024" version="1.1"
                xmlns="http://www.w3.org/2000/svg" p-id="4345" xmlns:xlink="http://www.w3.org/1999/xlink" width="200"
                height="200">
                <path
                  d="M789.333333 938.666667H234.666667c-36.266667 0-64-27.733333-64-64V405.333333c0-36.266667 27.733333-64 64-64h554.666666c36.266667 0 64 27.733333 64 64v469.333334c0 36.266667-27.733333 64-64 64zM234.666667 384c-12.8 0-21.333333 8.533333-21.333334 21.333333v469.333334c0 12.8 8.533333 21.333333 21.333334 21.333333h554.666666c12.8 0 21.333333-8.533333 21.333334-21.333333V405.333333c0-12.8-8.533333-21.333333-21.333334-21.333333H234.666667z"
                  fill="#333333" p-id="4346"></path>
                <path
                  d="M597.333333 384c-4.266667 0-8.533333 0-10.666666-4.266667-10.666667-6.4-12.8-19.2-6.4-29.866666l106.666666-170.666667c6.4-10.666667 19.2-12.8 29.866667-6.4 10.666667 6.4 12.8 19.2 6.4 29.866667l-106.666667 170.666666c-4.266667 6.4-12.8 10.666667-19.2 10.666667zM426.666667 384c-6.4 0-14.933333-4.266667-17.066667-10.666667l-106.666667-170.666666c-6.4-10.666667-4.266667-23.466667 6.4-29.866667 10.666667-6.4 23.466667-4.266667 29.866667 6.4l106.666667 170.666667c6.4 10.666667 4.266667 23.466667-6.4 29.866666-4.266667 4.266667-8.533333 4.266667-12.8 4.266667z"
                  fill="#333333" p-id="4347"></path>
                <path
                  d="M725.333333 213.333333c-36.266667 0-64-27.733333-64-64s27.733333-64 64-64 64 27.733333 64 64-27.733333 64-64 64z m0-85.333333c-12.8 0-21.333333 8.533333-21.333333 21.333333s8.533333 21.333333 21.333333 21.333334 21.333333-8.533333 21.333334-21.333334-8.533333-21.333333-21.333334-21.333333zM298.666667 213.333333c-36.266667 0-64-27.733333-64-64s27.733333-64 64-64 64 27.733333 64 64-27.733333 64-64 64z m0-85.333333c-12.8 0-21.333333 8.533333-21.333334 21.333333s8.533333 21.333333 21.333334 21.333334 21.333333-8.533333 21.333333-21.333334-8.533333-21.333333-21.333333-21.333333zM597.333333 704h-170.666666c-59.733333 0-106.666667-46.933333-106.666667-106.666667s46.933333-106.666667 106.666667-106.666666h170.666666c59.733333 0 106.666667 46.933333 106.666667 106.666666s-46.933333 106.666667-106.666667 106.666667z m-170.666666-170.666667c-36.266667 0-64 27.733333-64 64s27.733333 64 64 64h170.666666c36.266667 0 64-27.733333 64-64s-27.733333-64-64-64h-170.666666zM192 746.666667H85.333333c-12.8 0-21.333333-8.533333-21.333333-21.333334V512c0-12.8 8.533333-21.333333 21.333333-21.333333h106.666667c12.8 0 21.333333 8.533333 21.333333 21.333333s-8.533333 21.333333-21.333333 21.333333H106.666667v170.666667h85.333333c12.8 0 21.333333 8.533333 21.333333 21.333333s-8.533333 21.333333-21.333333 21.333334zM938.666667 746.666667h-106.666667c-12.8 0-21.333333-8.533333-21.333333-21.333334s8.533333-21.333333 21.333333-21.333333h85.333333v-170.666667h-85.333333c-12.8 0-21.333333-8.533333-21.333333-21.333333s8.533333-21.333333 21.333333-21.333333h106.666667c12.8 0 21.333333 8.533333 21.333333 21.333333v213.333333c0 12.8-8.533333 21.333333-21.333333 21.333334z"
                  fill="#333333" p-id="4348">
                </path>
              </svg>
              <svg v-else t="1713974796339" class="icon" viewBox="0 0 1024 1024" version="1.1"
                xmlns="http://www.w3.org/2000/svg" p-id="5327" width="200" height="200">
                <path
                  d="M956.098517 789.181927c-14.806217-42.936905-63.826678-49.086975-104.791671-66.37471-44.98761-18.957771-94.855368-40.97625-139.734508-59.392692-12.80463-3.481288-25.620517-6.982018-38.425148-10.475586-15.286148-10.522658-30.250978-45.488007-38.425148-62.873979-8.15268-1.159406-16.296151-2.320858-24.459065-3.481288 1.25969-26.900673 17.906835-28.351722 24.459065-48.898687 5.763261-18.138102 0.592494-41.697681 9.733689-58.472739 6.343475-11.645225 20.678972-11.735275 27.841092-21.719674 6.503111-9.073656 10.784624-24.870434 12.80463-35.985586 3.702322-20.287045 6.922666-48.066739-2.710738-68.185962-5.542226-11.573593-9.042957-12.673647-10.584056-26.720571-1.870604-17.007349 5.021364-72.499198 5.302773-84.492346 0.700965-31.132044-0.049119-33.653471-7.582699-63.97608 0 0-9.154497-27.470655-23.48897-35.743062l-28.580942-4.92108-17.667382-16.367783c-71.179133-43.805692-147.499355-13.07376-188.365088 3.483334-58.903551 19.107173-96.137571 76.788897-70.136384 199.9878 4.442172 21.039175-11.524474 30.451546-10.483772 41.926902 2.279926 25.120121 2.77009 85.48393 26.499537 100.358709 2.200108 1.370207 19.027355 5.593392 18.918885 4.442172 2.329045 24.450878 4.66116 48.919153 6.982018 73.359798 5.931083 16.255219 20.137643 18.037818 24.267706 40.986483l-18.185174 4.421706c-8.175193 17.385972-23.149233 52.351322-38.435381 62.873979-12.80463 3.493567-25.620517 6.994298-38.414915 10.475586-44.887326 18.416442-94.757131 40.434921-139.744741 59.392692-40.955784 17.287735-89.985454 23.437805-104.802928 66.37471 0 29.16218-2.739391 98.038874-1.989307 136.234801l391.601886 0 28.752858-196.35711-23.899316-50.439786 55.17053-26.452465 46.479591 25.911136-25.620517 51.940976 45.307905 195.396225 374.406249 0C958.858374 887.2208 956.098517 818.344107 956.098517 789.181927z"
                  fill="#7367f0" p-id="5328"></path>
              </svg>
            </div>
            <div class="item-main">
              <div class="item-content">
                <div v-html="item.content" v-if="item.content !== 'loading'"></div>
                <div v-else>
                  <el-button type="primary" text loading-icon="Eleme" loading>Loading</el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="input-content">
        <div class="input-suggestion" v-if="suggestionText && !loading">
          <span v-html="'你可以继续问我：' + suggestionText" @click="handleSubmitSuggestion"></span>
        </div>
        <el-input placeholder="请输入消息" v-model="chatInput" maxlength="200" :show-word-limit="true" :disabled="loading"
          @keydown.enter="submitChat">
          <template #suffix>
            <div :class="['input-suffix', { 'disabled': loading }]" @click="submitChat">
              <el-icon>
                <Position />
              </el-icon>
            </div>
          </template>
        </el-input>
      </div>
    </el-col>
  </el-row>

  <el-drawer v-model="drawerShowKnowlegde" title="I am the title" :with-header="false">
    <div class="knowledge-drawer">
      <h2 class="drawer-header">知识库列表</h2>
      <div class="drawer-list">
        <el-card class="list-item" v-for="item in chatResult.knowledgeData">
          <p v-html="item.content"></p>
        </el-card>
      </div>
    </div>
  </el-drawer>
</template>

<style scoped lang="scss">
.container {
  border: 1px solid #ddd;
  height: 795px;
  max-height: 795px;
  overflow: hidden;

  .left-container {
    padding: 0 1rem;
    border-right: 1px solid #ddd;
    height: 100%;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 2px;
    }

    .top-header>div {
      height: 3rem;
      margin: 1rem 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .label-box,
    .collapse-item-title {
      display: flex;
      align-items: center;

      span {
        margin-left: 0.5rem;
        cursor: default;
      }
    }

    .collapse-item-title {
      .el-icon {
        color: #17b3a3;
      }
    }

    .bot-config {

      .label-box {
        display: flex;
        align-items: center;

        span {
          margin-right: 0.5rem;
          cursor: default;
        }

        .el-icon {
          color: #ccc;
          cursor: pointer;
        }
      }

      .content-box {
        font-size: 0.85rem;

        span {
          margin-right: 0.5rem;
          background-color: #f7f8fa;
          padding: 0.3rem 0.7rem;
          border-radius: 3px;
          cursor: pointer;

          &:hover {
            background-color: #edeef1;
          }
        }
      }

      label {
        font-weight: bold;
      }

      .el-form-item :deep(.el-form-item__label) {
        font-weight: bold;
      }
    }
  }

  .right-container {
    padding: 0 1rem;
    display: flex;
    flex-direction: column;
    height: 100%;

    .top-header {
      margin: 0.3rem 0 1rem 0;

      .header-content {
        width: 100%;

        .header-title {
          display: flex;
          align-items: center;
          justify-content: space-between;

          .el-icon {
            cursor: pointer;
          }
        }
      }

      .top-header-btns {
        display: flex;

        span {
          display: inline-block;
          padding: 0 0.5rem;
          margin: 0 0.5rem;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 1.2rem;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 2.5rem;

          &:hover {
            background-color: #eff0f2;
          }
        }
      }
    }

    .chat-content {
      flex: 1;
      border-top: 1px solid #ddd;

      overflow-y: auto;

      &::-webkit-scrollbar {
        width: 0;
      }

      .list-content {
        .session-item {
          margin: 1rem 0;
          display: flex;
          width: 100%;

          .item-user {
            width: 2.5rem;
            min-width: 2.5rem;
            height: 2.5rem;
            padding: 0.3rem;
            border-radius: 0.5rem;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #f7f7fa;
            font-size: 0.85rem;
          }

          .item-main {
            margin: 0 0.5rem;

            .item-content {
              padding: 0.5rem 0.8rem;
              background-color: #f7f7fa;
              border-radius: 0.5rem;
              white-space: pre-line;
            }
          }
        }

        .session-user {
          flex-direction: row-reverse;

          .item-user {
            background-color: #e8e7fd;
          }

          .item-main .item-content {
            background-color: #e8e7fd;
          }
        }
      }
    }

    .input-content {
      display: flex;
      flex-direction: column;
      margin-bottom: 0.5rem;
      margin-top: 1rem;

      .input-suggestion {
        margin-bottom: 1rem;
        background-color: #fff;

        span {
          display: inline-block;
          text-wrap: wrap;
          border: 1px solid #ddd;
          color: #777;
          padding: 0.5rem;
          border-radius: 0.2rem;
          cursor: pointer;

          &:hover {
            color: #000;
          }
        }
      }

      .el-input {
        height: 3rem;
      }

      .input-suffix {
        height: 80%;
        display: flex;
        align-items: center;
        cursor: pointer;
        padding: 0.3px 0.5rem;
        border-radius: 0.5rem;
        color: #485162;

        &:hover {
          background-color: #d9d9e7;
        }
      }

      .disabled {
        &:hover {
          background-color: transparent;
          cursor: not-allowed;
        }
      }
    }
  }


}

.knowledge-drawer {
  .drawer-list {
    &:deep(.el-card__body) {
      padding: 0 1rem;
    }

    .list-item {
      margin: 1rem 0;
      white-space: pre-line;
    }
  }

}
</style>