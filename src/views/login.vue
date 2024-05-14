<template>
  <div class="rr-login">
    <div class="rr-login-wrap">
      <div class="rr-login-left hidden-sm-and-down">
        <el-image src="src\assets\images\login.png" style="height: 500px; width: 500px;"></el-image>
        <!-- <p class="rr-login-left-title">大模型应用平台</p> -->
      </div>
      <el-tabs v-model="activeName" :stretch="true">
        <el-tab-pane label="登录" name="first">
          <div class="rr-login-right-main">
            <h4 class="rr-login-right-main-title">登录</h4>
            <el-form ref="formRef" label-width="80px" :status-icon="true" :model="login" :rules="rules"
              @keyup.enter="onLogin">
              <el-form-item label-width="0" prop="username">
                <el-input v-model="login.username" placeholder="用户名" prefix-icon="user" autocomplete="off"></el-input>
              </el-form-item>
              <el-form-item label-width="0" prop="password">
                <el-input placeholder="密码" v-model="login.password" prefix-icon="lock" autocomplete="off"
                  show-password></el-input>
              </el-form-item>
              <el-form-item label-width="0" prop="captcha">
                <el-space class="rr-login-right-main-code">
                  <el-input v-model="login.captcha" placeholder="验证码" prefix-icon="first-aid-kit"></el-input>
                  <img style="vertical-align: middle; height: 35px; cursor: pointer" :src="state.captchaUrl"
                    @click="onRefreshCode" alt="" />
                </el-space>
              </el-form-item>
              <el-form-item label-width="0">
                <el-button type="primary" size="small" :disabled="state.loading" @click="onLogin"
                  class="rr-login-right-main-btn"> 登录 </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
        <el-tab-pane label="注册" name="second">
          <div class="rr-login-right-main">
            <h4 class="rr-login-right-main-title">注册</h4>
            <el-form ref="formRefForRegist" label-width="80px" :status-icon="true" :model="regist" :rules="rulesForRigister"
              @keyup.enter="onRegist">
              <el-form-item label-width="0" prop="username">
                <el-input v-model="regist.username" placeholder="用户名" prefix-icon="user" autocomplete="off"></el-input>
              </el-form-item>
              <el-form-item label-width="0" prop="email">
                <el-input v-model="regist.email" type="email" placeholder="邮箱" prefix-icon="box" autocomplete="off"></el-input>
              </el-form-item>
              <el-form-item label-width="0" prop="email">
                <div style="display: flex;" class="email-pass">
                  <el-input v-model="registEmailPass.input" placeholder="验证码"></el-input>
                  <el-button type="primary" :disabled="!isValidatEmail" @click="onSendEmail">发送验证码</el-button>
                </div>
              </el-form-item>
              <el-form-item label-width="0" prop="password">
                <el-input placeholder="密码" v-model="regist.password" prefix-icon="lock" autocomplete="off"
                  show-password></el-input>
              </el-form-item>
              <el-form-item label-width="0" prop="confirmPassword">
                <el-input placeholder="确认密码" v-model="regist.confirmPassword" prefix-icon="lock" autocomplete="off"
                  show-password></el-input>
              </el-form-item>
              <el-form-item label-width="0">
                <el-button type="primary" size="small" :disabled="state.loading" @click="onRegist" style="margin-top: 0px;"
                  class="rr-login-right-main-btn"> 注册 </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
        <el-tab-pane label="重置密码" name="third">
          <div class="rr-login-right-main">
            <h4 class="rr-login-right-main-title">重置密码</h4>
            <el-form ref="formRef" label-width="80px" :status-icon="true" :model="regist" :rules="rules"
              @keyup.enter="onRegist">
              <el-form-item label-width="0" prop="username">
                <el-input v-model="regist.username" placeholder="用户名" prefix-icon="user" autocomplete="off"></el-input>
              </el-form-item>
              <el-form-item label-width="0" prop="password">
                <el-input placeholder="密码" v-model="regist.password" prefix-icon="lock" autocomplete="off"
                  show-password></el-input>
              </el-form-item>
              <el-form-item label-width="0" prop="confirmPassword">
                <el-input placeholder="确认密码" v-model="regist.confirmPassword" prefix-icon="lock" autocomplete="off"
                  show-password></el-input>
              </el-form-item>
              <el-form-item label-width="0">
                <el-button type="primary" size="small" :disabled="state.loading" @click="onRegist"
                  class="rr-login-right-main-btn"> 注册 </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { TabsPaneContext } from 'element-plus'
import { computed, onMounted, reactive, ref } from "vue";
import { CacheToken } from "@/constants/cacheKey";
import baseService from "@/service/baseService";
import { setCache } from "@/utils/cache";
import { ElMessage } from "element-plus";
import { getUuid } from "@/utils/utils";
import app from "@/constants/app";
import { useAppStore } from "@/store";
import { useRouter, useRoute } from "vue-router";

const store = useAppStore();
const route = useRoute();
const router = useRouter();
const activeName = ref('first')
const state = reactive({
  captchaUrl: "",
  loading: false,
  year: new Date().getFullYear()
});

const login = reactive({ username: "", password: "", captcha: "", uuid: "" });
const regist = reactive({ username: "", password: "", email: "", confirmPassword: "" });
const registEmailPass = ref({
  source: '',
  input: ''
});
const isValidatEmail = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regist.email));
const formRef = ref();
const formRefForRegist = ref();
const emailSendLoading = ref(false);

const validateEmail = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('必填项不能为空'))
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    callback(new Error("不是正确的邮箱格式!"))
  } else {
    callback()
  }
}

const validatePass = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('必填项不能为空'))
  } else {
    if (regist.confirmPassword !== '') {
      if (!formRef.value) return
      formRef.value.validateField('checkPass')
    }
    callback()
  }
}
const validatePass2 = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('必填项不能为空'))
  } else if (value !== regist.password) {
    callback(new Error("两次输入密码不一致"))
  } else {
    callback()
  }
}


const rules = ref({
  username: [{ required: true, message: "必填项不能为空", trigger: "blur" }],
  password: [{ required: true, message: "必填项不能为空", trigger: "blur" }],
  captcha: [{ required: true, message: "必填项不能为空", trigger: "blur" }],
});

const rulesForRigister = ref({
  username: [{ required: true, message: "必填项不能为空", trigger: "blur" }],
  email: [{ required: true, validator: validateEmail, trigger: "blur" }],
  password: [{ required: true, validator: validatePass, trigger: "blur" }],
  confirmPassword: [{ required: true, validator: validatePass2, trigger: "blur" }],
});

onMounted(() => {
  //清理数据
  store.logout();
  getCaptchaUrl();
  if(route.query.isRegister) {
    activeName.value = 'second';
  }
});



const getCaptchaUrl = () => {
  login.uuid = getUuid();
  state.captchaUrl = `${app.api}/captcha?uuid=${login.uuid}`;
};

const onRefreshCode = () => {
  getCaptchaUrl();
};

const onLogin = () => {
  formRef.value.validate((valid: boolean) => {
    if (valid) {
      state.loading = true;
      baseService
        .post("/login", login)
        .then((res) => {
          state.loading = false;
          if (res.code === 0) {
            formRef.value.resetFields();
            setCache(CacheToken, res.data, true);
            ElMessage.success("登录成功");
            router.push("/index");
          } else {
            ElMessage.error(res.msg);
          }
        })
        .catch(() => {
          state.loading = false;
          onRefreshCode();
        });
    }
  });
};

const onRegist = () => {  
  formRefForRegist.value.validate((valid: boolean) => {
    console.log(valid)
    if (valid) {
      if (!registEmailPass.value.input.trim()) {
        ElMessage.error("验证码为空");
        registEmailPass.value.input = '';
        return
      }
      if (registEmailPass.value.source.trim() !== registEmailPass.value.input.trim()) {
        ElMessage.error("验证码不正确");
        registEmailPass.value.input = '';
        return
      }
      baseService
        .post("/regist", regist)
        .then((res) => {
          if (res.code === 0) {
            activeName.value = 'first'
            ElMessage.success("注册成功");
            formRefForRegist.value.resetFields();
          } else {
            ElMessage.error(res.msg);
          }
        });
    } else {
      ElMessage.error("表单不合法");
    }
  });
}

const onSendEmail = () => {
  if(!regist.email.trim()) return;
  emailSendLoading.value = true;
  baseService
        .get("/sendEmail", { email: regist.email })
        .then((res) => {
          emailSendLoading.value = false;
          if (res.code === 0) {
            registEmailPass.value.source = res.data;
          } else {
            ElMessage.error(res.msg);
          }
        })
        .catch(() => emailSendLoading.value = false);
}
</script>

<style lang="less" scoped>
@import url("@/assets/theme/base.less");

.rr-login {
  width: 100vw;
  height: 100vh;
  background: #e7eef0;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  @media only screen and (max-width: 992px) {
    .rr-login-wrap {
      width: 96% !important;
    }

    .rr-login-right {
      width: 100% !important;
    }
  }

  &-wrap {
    margin: 0 auto;
    height: auto;
    width: 1000px;
    box-shadow: -4px 5px 10px rgba(0, 0, 0, 0.4);
    animation-duration: 1s;
    animation-fill-mode: both;
    border-radius: 5px;
    overflow: hidden;
  }

  &-left {
    justify-content: center;
    flex-direction: column;
    color: #000000;
    float: left;
    width: 50%;

    &-title {
      text-align: center;
      color: #6e4646;
      font-weight: 300;
      letter-spacing: 2px;
      font-size: 32px;
    }
  }

  &-right {
    border-left: none;
    color: #fff;
    background-color: #fff;
    width: 50%;
    float: left;

    &-main {
      margin: 0 auto;
      width: 65%;

      .email-pass {
        width: 100%;
        display: flex;
        justify-content: space-between;
        .el-button {
          margin-left: 0.5rem;
        }
      }

      &-title {
        color: #333;
        margin-bottom: 40px;
        font-weight: 500;
        font-size: 24px;
        text-align: center;
        letter-spacing: 4px;
      }

      &-lang .iconfont {
        font-size: 20px;
        color: #606266;
        font-weight: 800;
        width: 20px;
        height: 20px;
      }

      .el-input__inner {
        border-width: 0;
        border-radius: 0;
        border-bottom: 1px solid #dcdfe6;
      }

      &-code {
        width: 100%;

        .el-space__item:first-child {
          flex: 1;
        }
      }

      &-btn {
        width: 100%;
        height: 45px;
        font-size: 18px !important;
        letter-spacing: 2px;
        font-weight: 300 !important;
        cursor: pointer;
        margin-top: 30px;
        font-family: neo, sans-serif;
        transition: 0.25s;
      }
    }
  }

  .login-footer {
    text-align: center;
    position: absolute;
    bottom: 0;
    padding: 20px;
    color: rgba(255, 255, 255, 0.6);

    p {
      margin: 10px 0;
    }

    a {
      padding: 0 5px;
      color: rgba(255, 255, 255, 0.6);

      &:focus,
      &:hover {
        color: #fff;
      }
    }
  }

  &-left,
  &-right {
    position: relative;
    min-height: 500px;
    align-items: center;
    display: flex;
  }

  @keyframes animate-down {

    0%,
    60%,
    75%,
    90%,
    to {
      animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    }

    0% {
      opacity: 0;
      transform: translate3d(0, -3000px, 0);
    }

    60% {
      opacity: 1;
      transform: translate3d(0, 25px, 0);
    }

    75% {
      transform: translate3d(0, -10px, 0);
    }

    90% {
      transform: translate3d(0, 5px, 0);
    }

    to {
      transform: none;
    }
  }

  .animate-down {
    animation-name: animate-down;
  }
}


</style>
