<script setup lang='ts'>
import { computed, ref } from 'vue';
import IndexHeader from "./components/index-header.vue";
import { useRoute } from 'vue-router';
const route = useRoute();
const footerList = ref([
  ['特性', '构建和训练 AI Bot', '更精准的知识库', '更可控的 LLMs', '更强大的 Agents'],
  ['解决方案', 'SEO写作', '售前客户线索', '售后客户服务', '数据分析'],
  ['资源', '使用教程', 'API 文档', '最佳实践', '博客'],
  ['公司', '关于我', '合作伙伴'],
]);
const isIndex = computed(() => route.name === 'index');
</script>

<template>
  <IndexHeader />
  <div class="container">  
    <div class="banner">
      <div class="main">
        <div class="introduce">
          <h1 class="int">让每个人都能构建 AI Bot 的强大平台</h1>
          <p class="desc">GPTBots 是一个强大的无代码平台，用于创建 AI 驱动的商业应用程序。
          </p>
          <div class="start">
            <el-button style="background-color: #24293d; color: #fff;" round>开始使用</el-button>
          </div>
        </div>
        <video class="video" src="https://static.gptbots.cc/aigc/d/website/2024/_nuxt/home-mobile.17559f06.mp4" autoplay
          muted playsinline loop></video>
      </div>
    </div>
    <div class="list-intro">
      <h2 class="title">GPTBots 是如何构建有用的 AI Bot 的？</h2>
      <div class="desc">GPTBots 将 LLMs 与企业的数据、服务和工作流程无缝连接，让 AI Bot 为企业发展提供强大动力。</div>
    </div>
    <div class="list-session">
      <div class="session">
        <div class="introduce">
          <h3 class="title">轻松构建和训练 AI Bot</h3>
          <div class="desc">从开始到结束，都不需要写代码，任何人都可以非常轻松高效地为业务构建一个 AI Bot。通过实时生效的训练让 Bot 更加聪明和稳定。</div>
        </div>
        <el-image src="https://static.gptbots.cc/aigc/d/website/2024/_nuxt/introduce1.711d7590.png"></el-image>
      </div>
      <div class="session">
        <el-image src="https://static.gptbots.cc/aigc/d/website/2024/_nuxt/introduce2.65123147.png"></el-image>
        <div class="introduce">
          <h3 class="title">企业专属知识库，让 AI 响应更精准</h3>
          <div class="desc">无缝连接企业散布在各平台的多种类型的知识数据，通过 RAG 的结构化知识和召回机制，让 AI 的响应更加精准。</div>
        </div>
      </div>
      <div class="session">
        <div class="introduce">
          <h3 class="title">可控的 LLMs ，让 AI 更适配您的业务</h3>
          <div class="desc">Flow 编排、多模态、Agents 和 Plugins 等能力，我们所做的一切都让 LLMs 变的更加可控和稳定，让 AI 能够真正融入企业业务场景，助力业务发展。</div>
        </div>
        <el-image src="https://static.gptbots.cc/aigc/d/website/2024/_nuxt/introduce3.6f53ea47.png"></el-image>
      </div>
      <div class="session">
        <el-image src="https://static.gptbots.cc/aigc/d/website/2024/_nuxt/introduce4.c7f5bcc9.png"></el-image>
        <div class="introduce">
          <h3 class="title">简单，但很强大的 Agents</h3>
          <div class="desc">简单一个指令即可让多个 Agents 协同工作，自主规划和执行任务，让企业拥有无限的专家技术团队和团队技能。</div>
        </div>
      </div>
    </div>

    <div class="footer">
      <div class="footer-inner">
        <div class="left">
          <h3 class="title">
            GPTBots.ai
          </h3>
          <div class="desc">
            让每个人都能构建 AI Bot 的强大平台
          </div>
        </div>
        <div class="right">
          <div class="list">
            <div class="item-col" v-for="item in footerList">
              <div class="item-text" v-for="item1 in item" v-text="item1"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.container {
  width: 100%;
  background-color: #fff;


  .main,
  .list-intro,
  .list-session {
    width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    flex-direction: column;
  }

  .banner {
    background-image: url(@/assets/images/index-bgc.svg);
    background-size: cover;

    .main {

      .introduce {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 6rem 0;

        .int {
          font-size: 4.5rem;
          color: #000;
        }

        .desc {
          font-size: 1.5rem;
        }

        .start {
          margin-top: 5rem;

          .el-button {
            width: 8rem;
            height: 3rem;
          }
        }
      }

      video {
        width: 100%;
        transform: translate(30deg, 60deg);
        border-radius: 2rem;
      }
    }
  }


  .list-intro {
    margin: 6rem auto;

    .title {
      font-size: 4rem;
    }

    .desc {
      font-size: 1.5rem;
    }
  }

  .list-session {
    width: 1200px;
    margin: 0 auto;

    .session {
      display: flex;
      width: 100%;
      margin: 2rem 0;

      .introduce {
        flex: 1;

        .title {
          font-size: 2rem;
        }

        .desc {
          font-size: 1.2rem;
          line-height: 1.5;
        }
      }

      .el-image {
        width: 50%;
      }
    }
  }

  .footer {
    background-color: #202d31;
    color: #fff;


    .footer-inner {
      width: 1200px;
      margin: 0 auto;
      display: flex;
      padding: 3rem 0;

      .left {
        flex: 2;

        .title {
          font-size: 2rem;
        }
      }

      .right {
        flex: 3;

        .list {
          display: flex;

          .item-col {
            margin: 0 3rem;
            .item-text {
              margin: 2rem 0;
              cursor: pointer;
              &:hover {
                color: aqua;
              }
            }
          }
        }
      }
    }

  }
}
</style>