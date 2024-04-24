<script setup lang='ts'>
import { ElMessage, ElMessageBox, UploadProps } from 'element-plus';
import { computed, ref } from 'vue';
import { getToken } from "@/utils/cache";

const props = defineProps({
    baseUrl: {
        type: String,
    },
})

const action = computed(() => props.baseUrl + '/file/upload');
const header = ref({
    token: getToken()
})

const beforeUpload: UploadProps['beforeUpload'] = (rawFile) => {
    console.log(rawFile)
    if (!['image/jpeg', 'image/png'].includes(rawFile.type)) {
        ElMessage.error('格式不正确，上传必须是图片类型!')
        return false
    } else if (rawFile.size / 1024 / 1024 > 2) {
        ElMessage.error('上传超出限制!')
        return false
    }
    return true

}

const handleRemove: UploadProps['onRemove'] = (file, uploadFiles) => {
    console.log(file, uploadFiles)
}

const handlePreview: UploadProps['onPreview'] = (uploadFile) => {
    console.log(uploadFile)
}

const handleAvatarSuccess: UploadProps['onSuccess'] = (
  response,
  uploadFile
) => {
    console.log(response, uploadFile)
//   imageUrl.value = URL.createObjectURL(uploadFile.raw!)
}

const handleExceed: UploadProps['onExceed'] = (files, uploadFiles) => {
    ElMessage.warning(
        `The limit is 3, you selected ${files.length} files this time, add up to ${files.length + uploadFiles.length
        } totally`
    )
}

const beforeRemove: UploadProps['beforeRemove'] = (uploadFile, uploadFiles) => {
    return ElMessageBox.confirm(
        `Cancel the transfer of ${uploadFile.name} ?`
    ).then(
        () => true,
        () => false
    )
}
</script>

<template>
  <el-upload 
        ref="uploadRef" 
        class="upload-demo" 
        :before-upload="beforeUpload" 
        :on-preview="handlePreview"
        :on-remove="handleRemove" 
        :before-remove="beforeRemove" 
        :on-exceed="handleExceed"
        :on-success="handleAvatarSuccess"
        :action="action"
        :header="header"
        
    >
        <template #trigger>
            1231
            <slot name="trigger"></slot>
        </template>
        <slot></slot>
    </el-upload>
</template>

<style scoped>

</style>
