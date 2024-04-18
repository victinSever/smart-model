<template>
    <el-row :gutter="20">
        <el-col :span="6">
            <div class="grid-content ep-bg-purple" />
            <el-card style="max-width: 480px">
                <template #header>
                    <div class="card-header">
                        <span>Card name</span>
                    </div>
                </template>
            </el-card>
        </el-col>
        <el-col :span="6">
            <div class="grid-content ep-bg-purple" />
            <el-card style="max-width: 480px">
                <template #header>
                    <div class="card-header">
                        <span>Card name</span>
                    </div>
                </template>
            </el-card>
        </el-col>
        <el-col :span="6">
            <div class="grid-content ep-bg-purple" />
            <el-card style="max-width: 480px">
                <template #header>
                    <div class="card-header">
                        <span>Card name</span>
                    </div>
                </template>
            </el-card>
        </el-col>
        <el-col :span="6">
            <div class="grid-content ep-bg-purple" />
            <el-card style="max-width: 480px">
                <template #header>
                    <div class="card-header">
                        <span>Card name</span>
                    </div>
                </template>
            </el-card>
        </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card style="max-width: 480px">
    <template #header>
      <div class="card-header">
        <span>Card name</span>
      </div>
    </template>
  </el-card>
      </el-col>
    </el-row>
</template>

<style>
.el-row {
    margin-bottom: 20px;
}

.el-row:last-child {
    margin-bottom: 0;
}

.el-col {
    border-radius: 4px;
}

.grid-content {
    border-radius: 4px;
    min-height: 36px;
}
</style>