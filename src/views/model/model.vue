<template>
    <div class="top-header" v-if="!showDetail">
        <h3 class="top-title">模型广场</h3>
        <p class="top-des">集中展示与管理百度千帆精选预置大模型，支持对模型进行评估、体验或部署。</p>
    </div>
    <el-row class="main-container" v-if="!showDetail">
        <div class="main-left">
            <div class="left-top">
                <span class="left-title">筛选</span>
                <span class="left-clear-btn" @click="clearOrderParam">清空</span>
            </div>
            <div class="left-list">
                <div class="list-session" v-for="item in orderList">
                    <div class="session-title">
                        <span>{{ item.name }}</span>
                    </div>
                    <div class="session-content">
                        <span :class="['item',
                            {
                                'active': modelParam.label.indexOf(text) !== -1
                            }
                        ]" v-for="text in item.children" v-text="text" @click="addOrderItem(text)"></span>
                    </div>
                </div>
            </div>
        </div>
        <div class="main-right">
            <div class="right-top">
                <el-input v-model="modelParam.modelName" style="width: 240px" placeholder="输入模型名称" 
                    :suffix-icon="Search" @change="getModel"/>
            </div>
            <div class="right-main">
                <el-row :gutter="20" class="model-list">
                    <el-col :span="8" v-for="item in modelMap.list" class="model-item">
                        <el-card style="min-width: 300px;" @click="gotoDetail(item)">
                            <template #header>
                                <div class="card-header">
                                    <div class="item-img">
                                        <el-image :src="item.imagePath"></el-image>
                                    </div>
                                    <div class="item-info">
                                        <p class="modelName">{{ item.modelName }}</p>
                                        <p class="label">{{ item.label }}</p>
                                    </div>
                                </div>
                            </template>

                            <el-tooltip class="box-item" effect="light" placement="top"
                                content-class="item-describe-full">
                                <p class="item-describe">{{ item.describe }}</p>
                                <template #content>
                                    <p class="item-describe-full">{{ item.describe }}</p>
                                </template>
                            </el-tooltip>

                            <template #footer>
                                <span>{{ item.updateTime + '更新' }}</span>
                            </template>
                        </el-card>
                    </el-col>
                </el-row>
            </div>
            <el-pagination v-model:current-page="modelParam.page" v-model:page-size="modelParam.limit"
                :page-sizes="[5, 10, 20, 50]" :small="true" :background="false"
                layout="total, sizes, prev, pager, next, jumper" :total="modelMap.total" @size-change="handleSizeChange"
                @current-change="handleCurrentChange" />
        </div>
    </el-row>
    <div class="model-detail-container" v-else>
        <el-card class="back" @click="gotoBack">
            <div class="back-box">
                <el-icon><ArrowLeft /></el-icon>
                <span>返回</span>
            </div>
        </el-card>
        <el-card>
            <template #header>
                <div class="card-header">
                        <h2 class="modelName">{{ currentDetail.modelName }}</h2>
                        <p class="label">{{ currentDetail.label }}</p>
                        <p class="item-describe">{{ currentDetail.describe }}</p>
                        <p class="item-modelId">模型ID：{{ currentDetail.modelId }}</p>
                </div>
            </template>
            <div class="session">
                <h2>模型介绍</h2>
                <p>{{  currentDetail.describe }}</p>
            </div>
            <div class="session">
                <h2>免责声明</h2>
                <p>{{ currentDetail.explain }}</p>
            </div>
        </el-card>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from "vue";
import baseService from '@/service/baseService';
import { Search } from '@element-plus/icons-vue';
import { useRouter } from "vue-router";

const router = useRouter();

interface IModelItem {
    category?: string;
    contextLength?: string;
    createTime?: string;
    describe?: string;
    explain?: string;
    imagePath?: string;
    label?: string;
    languageSupport?: string;
    modelId?: string;
    modelName?: string;
    updateTime?: string;
}

const modelParam = ref({
    limit: 5,
    order: 'des',
    orderField: '',
    page: 1,
    label: '',
    modelName: ''
})
const modelMap = ref<{
    list: any[],
    total: number
}>({
    list: [],
    total: 0
});
const orderList = ref([
    {
        type: 'category',
        name: '模型类别',
        children: ['文本生成', '图像生成', '文本表示', '图像理解', '行业大模型']
    },
    {
        type: 'lan',
        name: '语言支持',
        children: ['中文', '英文', '小语种']
    },
    {
        type: 'company',
        name: '厂商',
        children: ['百度', 'Meta', '百川智能', '智谱AI', '零一万物', '智源研究院', '度小满', 'Stability AI', '其他']
    },
    {
        type: 'number',
        name: '上下文长度',
        children: ['4K以下', '4K-16K', '16K以上']
    },
    {
        type: 'extend',
        name: '模型扩展能力',
        children: ['联网搜索', '千帆中文增强', '人设增强', '支持精调']
    },
])
const seletedOrderList = ref<string[]>([]);
const showDetail = ref(false);
const currentDetail = ref<IModelItem>({});

onMounted(() => {
    getModel();
});

const getModel = () => {
    baseService
        .get("/bot/model/page", modelParam.value)
        .then((res) => {
            console.log(res)
            if (res.code === 0) {
                modelMap.value = res.data;
            }
        });
}

const clearOrderParam = () => {
    modelParam.value = {
        limit: 10,
        order: '',
        orderField: '',
        page: 1,
        label: '',
        modelName: ''
    }
    getModel();
}

const addOrderItem = (text: string) => {
    if (seletedOrderList.value.includes(text)) {
        const index = seletedOrderList.value.indexOf(text);
        seletedOrderList.value.splice(index, 1);
    } else {
        seletedOrderList.value.push(text);
    }
    modelParam.value.label = seletedOrderList.value.join(';');
    getModel();
}

const handleSizeChange = (val: number) => {
    modelParam.value.limit = val;
    getModel();
}
const handleCurrentChange = (val: number) => {
    modelParam.value.page = val;
    getModel();
}

const gotoDetail = (item: any) => {
    showDetail.value = true;
    baseService
        .get(`/bot/model/${item.modelId}`)
        .then((res) => {
            if (res.code === 0) {     
                currentDetail.value = res.data;
                console.log(currentDetail.value)
            }
        });
}

const gotoBack = () => {
    showDetail.value = false;
}
</script>

<style lang="scss" scoped>
.top-header {
    padding: 0 0.7rem;
    border-bottom: 1px solid #e8e9eb;

    .top-des {
        font-size: 0.85rem;
    }
}

.main-container {
    font-size: 0.85rem;
    height: 100%;
    width: 100%;
    display: flex;

    .main-left {
        height: 100%;
        padding: 2rem 1rem;
        width: 250px;

        .left-top {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .left-title {
                font-size: 1.1rem;
            }

            .left-clear-btn {
                color: #d4cabf;
                cursor: pointer;
            }
        }

        .left-list {
            .list-session {
                margin: 2rem 0;

                .session-title {
                    font-size: 0.85rem;
                    color: #9078ab;
                }

                .session-content {
                    display: flex;
                    flex-wrap: wrap;
                    margin-top: 1rem;

                    .item {
                        background-color: #f7f7f9;
                        border-radius: 3px;
                        margin-right: 10px;
                        margin: 0.5rem 1rem 0.5rem 0;
                        padding: 3px 8px;
                        cursor: pointer;

                    }

                    .active {
                        background-color: #2468f2;
                        color: #fff;
                    }
                }
            }
        }
    }

    .main-right {
        flex: 1;
        height: 100%;
        padding: 2rem;
        background-color: #f7f7f9;
        display: flex;
        flex-direction: column;
        position: relative;

        .model-list {
            margin: 2rem 0;
            flex: 1;
            overflow-y: auto;

            .model-item {
                margin: 10px 0;
                cursor: pointer;

                .el-card {
                    &:hover {
                        border: 1px solid #2468f2;
                    }

                    & :deep(.el-card__body) {
                        padding-top: 0.2rem;
                        padding-bottom: 0.2rem;
                    }
                }

                .card-header {
                    display: flex;
                    align-items: center;
                    height: 3rem;

                    .el-image {
                        width: 3rem;
                        height: 3rem;
                        margin-right: 0.8rem;
                    }
                    .item-info {
                        .label {
                            white-space: nowrap;
                            /* 保持文本在一行 */
                            overflow: hidden;
                            /* 隐藏溢出的文本 */
                            text-overflow: ellipsis;
                        }
                    }
                }

                .item-describe {
                    line-height: 2;
                    display: -webkit-box;
                    -webkit-box-orient: vertical;
                    -webkit-line-clamp: 2;
                    /* 显示最多两行 */
                    overflow: hidden;
                }

                .item-describe-full {
                    max-width: 300px;
                    width: 200px;
                }
            }
        }

        .el-pagination {
            position: absolute;
            bottom: 5rem;
            right: 2rem;
        }
    }
}

.model-detail-container {
    line-height: 2;
    .card-header p {
        font-size: 0.85rem;
    }
    .back {
        margin-bottom: 2rem;
        .back-box {
            display: flex;
            align-items: center;
            cursor: pointer;
        }
        &:hover {
            background-color: #e8e9eb;
        }
    }
}
</style>