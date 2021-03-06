<template>
    <transition
        name="slide-down">
        <header class="app-header-wrapper" v-show="show">
            <div class="app-header-middle" v-cloak>
                <slot name="title">
                    {{ title }}
                </slot>
            </div>
        </header>
    </transition>
</template>

<script>
import {mapState} from 'vuex';
import EventBus from '@/core/event-bus';

export default {
    name: 'appHeader',
    computed: {
        ...mapState('appShell/appHeader', [
            'show',
            'title'
        ]),
        ...mapState('appShell/common', [
            'isPageSwitching'
        ])
    },
    methods: {

        /**
         * 处理按钮点击事件
         *
         * @param {string} source 点击事件源名称 menu/logo/action
         * @param {Object} data 随点击事件附带的数据对象
         */
        handleClick(source, {actionIdx, route} = {}) {

            // 页面正在切换中，不允许操作，防止滑动效果进行中切换
            if (this.isPageSwitching) {
                return;
            }
            let eventData = {};

            // 点击右侧动作按钮，事件对象中附加序号
            if (source === 'action') {
                eventData.actionIdx = actionIdx;
            }

            // 发送给父组件，内部处理
            this.$emit(`click-${source}`, eventData);

            // 发送全局事件，便于非父子关系的路由组件监听
            EventBus.$emit(`app-header:click-${source}`, eventData);

            // 如果传递了路由对象，进入路由
            if (route) {
                this.$router.push(route);
            }
        }
    }
};
</script>

<style lang="stylus" scoped>
@require '~@/assets/stylus/variable'
$btn-color = #fff

.app-header-wrapper
    display flex
    justify-content space-between
    align-items center
    height $app-header-height
    background $colorPrimaryBlue
    color $btn-color
    padding 0
    box-shadow 0 2px 4px -1px rgba(0,0,0,.2), 0 4px 5px rgba(0,0,0,.14), 0 1px 10px rgba(0,0,0,.12)
    transition transform 0.3s ease-out

    &.slide-down-enter,
    &.slide-down-leave-to
        transform translate(0, -100%)

    & > div
        display flex
        align-items center

    .app-header-middle
        flex 1
        font-size 1.2em

    // 改变 icon 大小
    .app-header-icon
        color $btn-color
        width 20px
        height 20px

</style>
