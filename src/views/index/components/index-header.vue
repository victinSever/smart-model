<script setup lang='ts'>
import { ref } from 'vue';
import { useRouter } from 'vue-router'

const router = useRouter();
const menuList = ref([
    { label: '特性', value: 'feature' },
    { label: '解决方案', value: 'method' },
    { label: '定价', value: 'price' },
    { label: '关于我们', value: 'about' },
]);
const active = ref('');

const handleClick = (value: string) => {
    active.value = value;
    router.push({ name: value});
}
</script>

<template>
    <div class="header">
        <div class="header-left">
            <div class="header-title">
                <span @click="handleClick('index')">GPTBots.ai</span>
            </div>
            <div class="header-menu">
                <div :class="['menu-item', { 'active': item.value === active }]" v-for="item in menuList" @click="handleClick(item.value)">
                    <span class="menu-label" v-text="item.label"></span>
                </div>
            </div>
        </div>
        <div class="header-right">
            <el-button class="login" type="primary" style="background-color: #202d31;" size="large" @click="router.push('/login')">登录</el-button>
            <el-button size="large" class="register" @click="router.push({ path: '/login', query: { isRegister: 1 }})">注册</el-button>
        </div>
    </div>
</template>

<style scoped lang="scss">
.header {
    width: 100%;
    height: 6rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #202d31;
    color: #fff;
    padding: 0 7rem;
    position: sticky;
    top: 0;
    z-index: 10;

    .header-left {
        display: flex;
        align-items: center;

        .header-title {
            margin-right: 6rem;
            font-size: 2.5rem;
            cursor: pointer;
        }

        .header-menu {
            display: flex;
            font-size: 1.3rem;

            .menu-item {
                margin: 0 2rem;
                cursor: pointer;

                &:hover {
                    color: aquamarine;
                }
                &.active {
                    color: aquamarine;
                }
            }
        }
    }

    .header-right {
        .login {
            border: 1px solid #fff;

            &:hover {
                color: aquamarine;
            }
        }
    }
}
</style>