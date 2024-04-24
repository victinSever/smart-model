<script setup lang='ts'>
import {
    Plus
} from '@element-plus/icons-vue';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from "vue-router";
import { Search } from '@element-plus/icons-vue';
import baseService from '@/service/baseService';
import { ElMessage, ElMessageBox, UploadProps } from "element-plus";
import { getToken } from '@/utils/cache';
import { dataToSelectGroup } from '@/utils/utils';

interface IBotParam {
    limit: number;
    order?: string;
    orderField?: string;
    page: number,
    name?: string;
    isPublic?: number;
}

interface ICreateBotParam {
    identityPrompt: string,
    name: string;
    modelId: string;
    modelName: string;
    imagePath: string;
}

const router = useRouter();
const botTmp = ref('bot-tem');
const botParam = ref<IBotParam>({
    limit: 10,
    order: 'des',
    orderField: '',
    page: 1,
    name: '',
    isPublic: 1,
});
const botMap = ref<{
    list: any[],
    total: number
}>({
    list: [],
    total: 0
});
const isPublic = ref(true);
const dialogVisible = ref(false);
const createBotParam = ref<ICreateBotParam>({
    name: '',
    modelId: '',
    modelName: '',
    identityPrompt: '',
    imagePath: ''
});
const modelList = ref<any>();
const modeListGroup = computed(() => dataToSelectGroup(modelList.value));
const identityPrompt = ref(`1、建议身份提示文字更加精准、条理、清晰和逻辑
2、简短不等于清晰，所以无需过于在意内容的多少，越高质量的身份提示文字将可获得更高质量的AI响应
3、使用不同的分隔符以区分不同类型的提示内容，以便让 AI 清晰辨别
4、尽可能提供正确示例，以帮助 AI 正确输出内容
`);
const headers = ref({ token: getToken() });
const action = ref('https://53r23232p6.goho.co/api/file/upload');

onMounted(() => {
    getBot();
    getModelList();
});

const getBot = () => {
    botParam.value.isPublic = isPublic.value ? 1 : 0;
    baseService
        .get("/bot/botinfo/page", botParam.value)
        .then((res) => {
            if (res.code === 0) {
                botMap.value = res.data;
            }
        });
}

const getModelList = () => {
    baseService
        .get("/bot/model/ModelSecondaryList", botParam.value)
        .then((res) => {
            if (res.code === 0) {
                modelList.value = res.data;
            }
        });
}

const deleteBot = (botId: string) => {
    ElMessageBox.confirm('确定要删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        baseService
            .delete("/bot/botinfo/delete", { ids: [botId] })
            .then((res) => {
                if (res.code === 0) {
                    getBot();
                }
            });
    })
}

const resetCreateBotParam = () => {
    createBotParam.value = {
        name: '',
        modelId: '',
        modelName: '',
        identityPrompt: '',
        imagePath: ''
    }
}

const judgeCreateParam = () => {
    const value = createBotParam.value;
    if (!value.identityPrompt || !value.modelId || !value.modelName || !value.name) {
        ElMessage.warning('填写不完整');
        return false;
    }
    return true;
}

const createBot = () => {
    if (!judgeCreateParam()) return;

    dialogVisible.value = false;
    baseService
        .post("/bot/botinfo/save", createBotParam.value)
        .then((res) => {
            if (res.code === 0) {
                ElMessage.success('创建成功！');
                resetCreateBotParam();
                getBot();
            }
        });
}


const handleSizeChange = (val: number) => {
    botParam.value.limit = val;
    getBot();
}
const handleCurrentChange = (val: number) => {
    botParam.value.page = val;
    getBot();
}

const gotoBotConfig = (item: any) => {
    router.push({
        path: '/bots/bots-config',
        query: {
            botId: item.botId || ''
        }
    });
}

const changeModelName = (modelId: string) => {
    for (const item of modeListGroup.value) {
        const option = item.options.find((op: any) => op.value === modelId);
        if (option) {
            createBotParam.value.modelName = option.label;
            break;
        };
    }
}

const beforeUpload: UploadProps['beforeUpload'] = (rawFile) => {
    let types = ['image/jpeg', 'image/jpg', 'image/gif', 'image/bmp', 'image/png'];
    if (!types.includes(rawFile.type)) {
        ElMessage.error('上传图片只能是 JPG、JPEG、gif、bmp、PNG 格式!')
        return false
    } else if (rawFile.size / 1024 / 1024 > 2) {
        ElMessage.error('上传图片大小不能超过 2MB!')
        return false
    }
    return true

}

const handleAvatarSuccess: UploadProps['onSuccess'] = (res) => {
    console.log(res)
    if (res.code === 0) {
        createBotParam.value.imagePath = res.data;
    }
}


</script>

<template>
    <div class="container">
        <div class="top-header">
            <h2 class="top-title">Bots</h2>
        </div>
        <div class="">
            <el-tabs v-model="botTmp" class="tab-container">
                <el-tab-pane label="Bot" name="bot-tem">
                    <div class="btns">
                        <div class="left-btns">
                            <el-input v-model="botParam.name" style="width: 240px" placeholder="搜索"
                                :suffix-icon="Search" @change="getBot" />
                            <span style="margin: 0 0.5rem 0 2rem;">公开</span>
                            <el-switch v-model="isPublic" @change="getBot" />
                        </div>
                        <div class="right-btns">
                            <el-button :icon="Plus" type='primary' @click="dialogVisible = true">创建Bot</el-button>
                        </div>
                    </div>
                    <div class="bot-list">
                        <el-card @click="gotoBotConfig(item)" v-for="item in botMap.list" class="bot-item"
                            shadow="hover">
                            <el-row class="item-top">
                                <div class="item-img">
                                    <el-image :src="item.imagePath" alt="" v-if="item.imagePath"></el-image>
                                    <el-icon v-else>
                                        <DataLine />
                                    </el-icon>
                                </div>
                                <div class="item-title" v-text="item.botName"></div>
                            </el-row>
                            <el-row class="item-bottom">
                                <div class="item-bottom-left">
                                    <div class="item-modelname">
                                        <el-icon>
                                            <Coin />
                                        </el-icon>
                                        <span>{{ item.botName }}</span>
                                    </div>
                                    <div class="item-count">
                                        <el-icon>
                                            <Tickets />
                                        </el-icon>
                                        <span>{{ item.memoryStrategy }}</span>
                                    </div>
                                </div>

                                <el-popover trigger="click" placement="bottom-start">
                                    <template #reference>
                                        <div class="item-more" @click.native.stop>
                                            <el-icon>
                                                <More />
                                            </el-icon>
                                        </div>
                                    </template>
                                    <template #default>
                                        <div class="popover-more">
                                            <div @click="router.push({ path: '/bots/bots-config' })">设置</div>
                                            <div @click="deleteBot(item.botId)">删除</div>
                                        </div>
                                    </template>
                                </el-popover>
                            </el-row>
                        </el-card>
                    </div>
                </el-tab-pane>
            </el-tabs>

            <el-pagination v-model:current-page="botParam.page" v-model:page-size="botParam.limit"
                :page-sizes="[5, 10, 20, 50]" :small="true" :background="false"
                layout="total, sizes, prev, pager, next, jumper" :total="botMap.total" @size-change="handleSizeChange"
                @current-change="handleCurrentChange" />
        </div>
    </div>

    <el-dialog v-model="dialogVisible" :show-close="true" width="700" title="创建Bot">
        <div class="dialog-container">
            <div class="dialog-title">
                <el-upload ref="uploadRef" class="upload-demo" accept=".jpg,.jpeg,.png,.gif.JPG,.JPEG,.PNG,.GIF"
                    :show-file-list="false" :before-upload="beforeUpload" :on-success="handleAvatarSuccess"
                    :action="action" :headers="headers">
                    <template #trigger>
                        <div class="title-logo">
                            <el-image :src="createBotParam.imagePath" v-if="createBotParam.imagePath"></el-image>
                            <el-icon class="default-icon" v-if="!createBotParam.imagePath">
                                <DataLine />
                            </el-icon>
                            <el-icon class="hover-icon" v-if="!createBotParam.imagePath">
                                <EditPen />
                            </el-icon>
                        </div>
                    </template>
                </el-upload>
            </div>
            <div>
                <el-form :model="createBotParam" label-position="left">
                    <el-form-item>
                        <label for="name">Bot名称</label>
                        <el-input name="name" placeholder="Bot名称" v-model="createBotParam.name"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <div style="display: flex; flex-direction: column; width: 100%;">
                            <label for="modelName">模型版本</label>
                            <el-select name="modelName" v-model="createBotParam.modelId" placeholder="请选择"
                                @change="changeModelName">
                                <el-option-group v-for="group in modeListGroup" :key="group.label" :label="group.label">
                                    <el-option v-for="item in group.options" :key="item.value" :label="item.label"
                                        :value="item.value" />
                                </el-option-group>
                            </el-select>
                        </div>
                    </el-form-item>
                    <el-form-item>
                        <label for="identityPrompt">Bot身份提示</label>
                        <el-input name="identityPrompt" :placeholder="identityPrompt"
                            v-model="createBotParam.identityPrompt" type="textarea" :rows="8" maxlength="13004"
                            show-word-limit></el-input>
                    </el-form-item>
                </el-form>
            </div>
        </div>
        <template #footer>
            <el-button @click="dialogVisible = false">关闭</el-button>
            <el-button @click="createBot" type="primary">创建</el-button>
        </template>
    </el-dialog>
</template>

<style scoped lang="scss">
.btns {
    width: 100%;
    display: flex;
    justify-content: space-between;
    margin: 0 0 1.5rem 0;
}

.bot-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(20%, 1fr));
    gap: 1.5rem;
    align-content: start;
    /* 控制子元素在垂直方向上的对齐方式 */
    grid-auto-rows: auto;
    /* 设置子元素的行高为自动 */
    min-height: 600px;

    .bot-item {
        margin-left: 0;
        margin-right: 0;
        cursor: pointer;
        background-image: url(@/assets/images/prompt-item-bgc.png);
        background-size: cover;

        &:hover {
            transform: translateY(-0.5rem);
            border: 1px solid #17b3a3;
        }

        .item-top {
            display: flex;
            margin-bottom: 2rem;

            .item-img {
                margin-right: 1rem;
                height: 5rem;
                width: 5rem;
                border-radius: 1rem;
                display: flex;
                justify-content: center;
                align-items: center;
                background-color: #f4f4f5;
                border: 1px solid #dcdee1;
                font-size: 3rem;
                color: #b1b4bc;
                overflow: hidden;

                .el-image {
                    width: 100%;
                    height: 100%;
                }
            }

            .item-title {
                flex: 1;
                font-size: 1.2rem;
                line-height: 1.5;
                font-weight: bold;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }

        .item-bottom {
            display: flex;
            align-items: center;
            justify-content: space-between;

            .item-bottom-left {
                display: flex;
                color: #b1b4bc;

                &>div {
                    display: flex;
                    align-items: center;
                    margin-right: 1rem;

                    span {
                        margin-left: 0.3rem;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        max-width: 8rem;
                    }
                }
            }

            .item-more {
                padding: 0.5rem 0.8rem;
                align-self: flex-end;
                border-radius: 0.5rem;
                transition: .4s;

                &:hover {
                    background-color: #f3f4f6;
                }
            }
        }
    }
}

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

.dialog-container {
    .dialog-title {
        margin-bottom: 2rem;

        .title-logo {
            width: 5rem;
            height: 5rem;
            border-radius: 1rem;
            background-color: #f4f4f5;
            color: #b1b4bc;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 3rem;
            overflow: hidden;
            box-sizing: border-box;

            .hover-icon {
                display: none;
            }

            .el-image {
                width: 100%;
                height: 100%;
            }

            &:hover {
                background-color: #464f60;

                .hover-icon {
                    display: inline-block;
                }

                .default-icon {
                    display: none;
                }
            }
        }
    }

    >div {
        width: 100%;
        display: flex;
        justify-content: center;
        padding: 0 5rem;
        width: 100%;

        .el-form {
            width: 100%;

            .el-form-item {
                label {
                    font-weight: bold;
                }
            }
        }
    }
}

@media screen and (max-width: 1400px) {
    .bot-list {
        grid-template-columns: repeat(auto-fit, minmax(calc(33.33% - 20px), 1fr));
    }
}
</style>