<script setup lang='ts'>
import baseService from '@/service/baseService';
import { dataToSelectGroup } from '@/utils/utils';
import { ElMessage } from 'element-plus';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from "vue-router";

const router = useRoute();
const botInfo = ref<any>({});
const modelList = ref<any>();
const modeListGroup = computed(() => dataToSelectGroup(modelList.value));
const identityPrompt = ref(`1、建议身份提示文字更加精准、条理、清晰和逻辑
2、简短不等于清晰，所以无需过于在意内容的多少，越高质量的身份提示文字将可获得更高质量的AI响应
3、使用不同的分隔符以区分不同类型的提示内容，以便让 AI 清晰辨别
4、尽可能提供正确示例，以帮助 AI 正确输出内容
`);
const collapseName = ref('2');
const chatInput = ref('');
const chatHistoryList = ref<Array<{ role: string; content: string; }>>([]);

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
  const botId = router.query.botId || '1';
  baseService
    .get(`/bot/botinfo/${botId}`)
    .then((res) => {
      console.log(res.data)
      if (res.code === 0) {
        botInfo.value = res.data;
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
      console.log(res)
      if (res.code === 0) {
        ElMessage.success('保存成功');
      }
    });
}


const submitChat = () => { 
  chatHistoryList.value.push({
    role: 'user',
    content: chatInput.value
  });
  chatHistoryList.value.push({
    role: 'assistant',
    content: 'loading'
  });
  chatInput.value = '';
  baseService
    .post("/bot/chat", {
      content: chatInput.value,
      ...botInfo.value
    })
    .then((res) => {
      console.log(res)
      if (res.code === 0) {
        getChatHistory(botInfo.value.botId);
      }
    });
}

const getChatHistory = (id: string) => {
  baseService
    .get(`/bot/chat/history/${id}`)
    .then((res) => {
      console.log(res.data)
      if (res.code === 0) {
        chatHistoryList.value = res.data;
      }
    });
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
                <el-input name="name" placeholder="Bot名称" v-model="botInfo.name"></el-input>
              </el-form-item>
              <el-form-item label="大语言模型（LLM）">
                <el-select name="modelName" v-model="botInfo.modelId" placeholder="请选择" @change="changeModelName"
                  style="width: 100%;">
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
                  <span>{{ botInfo.temperature }}</span>
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
                  <span>{{ botInfo.matchingQuantity }}条知识可用</span>
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
                  <span>知识相关性：{{ botInfo.relativity }}</span>
                  <span>召回数量：{{ botInfo.matchingQuantity }}</span>
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
                    <span>长期记忆</span>
                    <el-tooltip effect="dark" placement="right">
                      <template #content>
                        <div>开启后，将把短期记<br />
                          忆之前的聊天记录进行向量化存储，匹配与用户问题<br />
                          相关的记录，作为上下文帮助 Bot 提<br />
                          升响应质量。</div>
                      </template>
                      <el-icon>
                        <BellFilled />
                      </el-icon>
                    </el-tooltip>
                  </div>
                </template>
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
                  <span>启用最近{{ botInfo.memoryStrategy }}轮聊天记录</span>
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
                    <span>Bot欢迎语</span>
                  </div>
                </template>
                <el-input name="identityPrompt" placeholder="用户首次使用Bot的欢迎语" v-model="botInfo.guide" type="textarea"
                  :rows="8" maxlength="13004" show-word-limit></el-input>
              </el-form-item>
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
            </el-form>
          </el-card>
        </el-collapse-item>
      </el-collapse>
    </el-col>

    <el-col class="right-container" :span="12">
      <div class="top-header">
        <div>
          <p class="top-title" style="font-size: 1.2rem;">调试</p>
          <div class="top-header-btns">
            <el-tooltip class="box-item" effect="dark" content="重置会话" placement="top">
              <el-icon>
                <DeleteFilled />
              </el-icon>
            </el-tooltip>
          </div>
        </div>
      </div>
      <div class="chat-content">
        <div class="list-content">
          <div :class="['session-item', { 'session-user': item.role === 'user' }]" v-for="item in chatHistoryList">
            <div class="item-user">
              <el-icon>
                  <DataLine/>
              </el-icon>
            </div>
            <div class="item-main">
              <!-- <div class="item-time">time</div> -->
              <div class="item-content" v-text="item.content">
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="input-content">
        <el-input placeholder="请输入消息" v-model="chatInput" maxlength="200" :show-word-limit="true" @keydown.enter="submitChat">
          <template #suffix>
            <div class="input-suffix" @click="submitChat">
                <el-icon><Position /></el-icon>
            </div>
          </template>
        </el-input>
      </div>
    </el-col>
  </el-row>
</template>

<style scoped lang="scss">
.container {
  border: 1px solid #ddd;
  min-height: 795px;

  .left-container {
    padding: 0 1rem;
    border-right: 1px solid #ddd;

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
          background-color: #edeff4;
          padding: 0.3rem 0.5rem;
          border-radius: 3px;
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
    .chat-content {
      flex: 1;
      border-top: 1px solid #ddd;
      .list-content {
        .session-item {
          margin: 1rem 0;
          display: flex;
          width: 100%;
          .item-user {
            width: 2rem;
            height: 2rem;
            border-radius: 0.5rem;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #f7f7fa;
          }
          .item-main {
            margin: 0 0.5rem;
            .item-content {
              padding: 0.5rem 0.8rem;
              background-color: #f7f7fa;
              border-radius: 0.5rem;

            }
          }
        }
        .session-user {
          flex-direction: row-reverse
        }
      }
    }
    .input-content {
      height: 4rem;
      display: flex;
      align-items: center;
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
    }
  }

  .top-header {
    height: 3rem;
    line-height: 3rem;
    margin-bottom: 2rem;

    &>div {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}
</style>