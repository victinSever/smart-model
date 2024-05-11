<script setup lang='ts'>
import baseService from '@/service/baseService';
import { FormInstance, FormRules } from 'element-plus';
import { onMounted, reactive, ref } from 'vue';
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";

interface IPromptCreateParam {
    templateName?: string;
    category?: string;
    content?: string;
    parameterFormat?: string;
}

const promptParam = ref<IPromptCreateParam>({
    templateName: '',
    content: '',
    category: '',
    parameterFormat: ''
});

const rules = reactive<FormRules<IPromptCreateParam>>({
    templateName: [
        { required: true, message: '请输入名称', trigger: 'blur' },
        { min: 0, max: 20, message: '字数超限', trigger: 'blur' },
    ],
    category: [
        { required: true, message: '请选择', trigger: 'change' },
    ],
    parameterFormat: [
        { required: true, message: '请选择', trigger: 'change' },
    ],
    content: [
        { required: true, message: '请输入模板内容', trigger: 'blur' },
        { min: 0, max: 11200, message: '字数超限', trigger: 'blur' },
    ],
})

const router = useRouter();
const ruleFormRef = ref<FormInstance>();
const promptCate = ref<string[]>([]);
const parameters = ref(['大括号{}','双大括号{{}}','中括号[]','双大括号[[]]','小括号()','双小括号(())']);

onMounted(() => {
    getPromptCate();
});

const getPromptCate = () => {
    baseService
        .get("/prompt/category")
        .then((res) => {
            if (res.code === 0) {
                promptCate.value = res.data.category;
            }
        });
}

const createPrompt = () => {
    baseService
        .post("/prompt/save", promptParam.value)
        .then((res) => {
            if (res.code === 0) {
                router.push({ path: '/prompt/prompt-tem' })
                ElMessage.success('创建成功');
            }
        });
}

const submitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate((valid, fields) => {
        if (valid) {
            createPrompt();
        } else {
            ElMessage.error('输入不完整')
        }
    })
}

const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.resetFields()
}
</script>

<template>
    <el-col class="create-container">
        <div class="top-header">
            <h3 class="top-title">创建 Prompt 模板</h3>
        </div>
        <el-form ref="ruleFormRef" :model="promptParam" :rules="rules" class="prompt-create-form"
            label-width="120px" label-position="left" size="small">
            <el-form-item label="模板名称" prop="templateName">
                <el-input 
                    v-model="promptParam.templateName" 
                    placeholder="请输入模板名称" 
                    clearable 
                    maxlength="20" 
                    show-word-limit 
                    style="width: 480px"
                />
            </el-form-item>
            <el-form-item label="场景类型" prop="category">
                <el-select v-model="promptParam.category" placeholder="请选择场景类型" size="small" style="width: 480px">
                    <el-option v-for="item in promptCate" :key="item" :label="item" :value="item" />
                </el-select>
            </el-form-item>
            <el-form-item label="变量提示符" prop="parameterFormat">
                <el-select v-model="promptParam.parameterFormat" placeholder="请输入变量提示符" size="small" style="width: 480px">
                    <el-option v-for="item in parameters" :key="item" :label="item" :value="item" />
                </el-select>
            </el-form-item>
            <el-form-item label="Prompt" prop="content">
                <el-input 
                    type="textarea" 
                    :rows="6" 
                    v-model="promptParam.content"
                    maxlength="11200"
                    show-word-limit
                    clearable
                    placeholder="请输入模板内容，插值参数通过{}中填写定义，支持英文、数字、下划线（_），且不能以数字开头，长度2-30
示例：文章内容：{article}，请以{number}字数进行总结" 
 />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="submitForm(ruleFormRef)" size="default">
                    确定
                </el-button>
                <el-button @click="resetForm(ruleFormRef)" size="default">取消</el-button>
            </el-form-item>
        </el-form>
    </el-col>
</template>

<style scoped lang="scss">
.create-container {
    width: 800px;
    min-width: 800px;
}

.top-header {
    padding: 0 2rem;
}

.prompt-create-form {
    padding: 2rem;
    font-size: 0.85rem;

    .el-form-item {
        margin: 2rem 0;
    }

    &:deep(.el-input__wrapper) {
        padding-top: 0.4rem;
        padding-bottom: 0.4rem;
    }
}
</style>