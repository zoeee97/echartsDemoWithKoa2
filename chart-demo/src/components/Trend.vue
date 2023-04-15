<!--
 * @Author: zyy 1741540959@qq.com
 * @Date: 2023-02-25 12:55:57
 * @LastEditors: zyy
 * @LastEditTime: 2023-02-26 22:03:25
 * @Description: file content
-->
<!-- 堆叠效果的折线图 -->
<template>
  <div class="com-container">
    <div class="title" :style="comStyle">
      <span>{{ '▎ ' + title }}</span>
      <!-- &#xe6eb iconfont 把矢量图片做成字体 引入字体文件后就能用 -->
      <span class="iconfont title-icon" @click="showChoice = !showChoice">&#xe6eb;</span>
      <div class="select-icon" v-if="showChoice" :style="marginStyle">
        <div class="select-item" v-for="item in selectTypes" :key="item.key" @click="handleSelect(item.key)">
          {{ item.text }}
        </div>
      </div>
    </div>
    <div class="com-chart" ref="ref"></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import debounce from 'lodash/debounce'
import { getThemeValue } from '@/utils/theme_utils'
export default {
  data() {
    return {
      chartInstance: null,//echarts实例对象
      allData: null,//接收来自服务器的数据
      dataType: 'map',//这项数据代表目前选择的数据类型 可选值有map seller commodity
      showChoice: false,//控制可选面板的显示或隐藏
      titleFontSize: 0,//标题字体大小
    }
  },
  computed: {
    selectTypes() {
      if (!this.allData || !this.allData.type) {
        return []
      } else {
        // 下拉选择框显示不是当前展示的趋势类型
        return this.allData.type.filter(item => item.key !== this.dataType)
      }
    },
    title() {
      if (!this.allData) {
        return ''
      } else {
        // 返回当前选中的趋势类型的标题
        return this.allData[this.dataType].title
      }
    },
    // 设置给标题的样式
    comStyle() {
      return {
        fontSize: this.titleFontSize + 'px',
        color: getThemeValue(this.theme).titleColor
      };
    },
    marginStyle() {
      return {
        marginLeft: this.titleFontSize + 'px'
      };
    },
    // 监听主题数据变化
    ...mapState(['theme'])
  },
  watch: {
    theme() {
      // 销毁实例
      this.chartInstance.dispose()
      this.initChart()
      this.screenAdapter()
      this.updateChart()
    }
  },
  created() {
    // 当socket发来数据时会调用getData这个函数
    this.$socket.registerCallBack('trendData', this.getData)
  },
  mounted() {
    this.initChart()
    // this.getData()
    this.$socket.send({
      action: 'getData',
      socketType: 'trendData',
      chartName: 'trend'
    })
    window.addEventListener('resize', debounce(this.screenAdapter,100))
    this.screenAdapter();
  },
  destroyed() {
    window.removeEventListener('resize', debounce(this.screenAdapter,100))
    this.$socket.unRegisterCallBack('trendData')
  },
  methods: {
    handleSelect(key) {
      this.dataType = key;
      this.updateChart()
      this.showChoice = false
    },
    initChart() {
      // 主题使用完之后, 发现折线图都变成了平滑折线图了, 这是因为在 chalk.js 主题文件中, 设置了smooth:true
      this.chartInstance = this.$echarts.init(this.$refs.ref, this.theme)
      const initOption = {
        // 坐标轴大小和位置
        grid: {
          left: '3%',
          top: '35%',
          right: '4%',
          bottom: '1%',
          // 把坐标轴的文字 控制在范围大小以内
          containLabel: true
        },
        // 工具提示
        tooltip: {
          trigger: 'axis'
        },
        // 图例位置和形状
        legend: {
          left: 20,
          top: '15%',
          icon: 'circle'
        },
        xAxis: {
          type: 'category',
          // x轴 挤紧挨边缘
          boundaryGap: false
        },
        yAxis: {
          type: 'value'
        }
      };
      this.chartInstance.setOption(initOption);
    },
    /* async getData() {
      const { data: res } = await this.$http.get('/trend')
      this.allData = res;
      this.updateChart()//处理数据并更新界面
    }, */
    getData(res) {
      this.allData = res;
      this.updateChart()
    },
    updateChart() {
      // 半透明的颜色值
      const colorArr1 = [
        'rgba(11, 168, 44, 0.5)',
        'rgba(44, 110, 255, 0.5)',
        'rgba(22, 242, 217, 0.5)',
        'rgba(254, 33, 30, 0.5)',
        'rgba(250, 105, 0, 0.5)'
      ];
      // 全透明的颜色值
      const colorArr2 = [
        'rgba(11, 168, 44, 0)',
        'rgba(44, 110, 255, 0)',
        'rgba(22, 242, 217, 0)',
        'rgba(254, 33, 30, 0)',
        'rgba(250, 105, 0, 0)'
      ];
      // x轴数据
      const timeArr = this.allData.common.month
      // y轴的数据, 暂时先取出map这个节点的数据
      // map代表地区销量趋势
      // seller代表商家销量趋势
      // commodity代表商品销量趋势
      const valueArr = this.allData[this.dataType].data
      // 一个图表显示五条折线图
      const seriesArr = valueArr.map((item, index) => {
        return {
          type: 'line',
          name: item.name,
          data: item.data,
          // 数据堆叠 堆叠图效果 stack值相同，可以形成堆叠图效果
          stack: this.dataType,
          // 区域面积只需要给series的每个对象增加一个areaStyle即可
          areaStyle: {
            // 颜色渐变
            color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
              // 0%的颜色值
              {
                offset: 0,
                color: colorArr1[index]
              },
              // 100%的颜色值
              {
                offset: 1,
                color: colorArr2[index]
              }
            ])
          }
        }
      })
      const legendArr = valueArr.map((item) => item.name)
      const dataOption = {
        xAxis: {
          data: timeArr
        },
        legend: {
          data: legendArr
        },
        series: seriesArr
      }
      this.chartInstance.setOption(dataOption);
    },
    screenAdapter() {
      this.titleFontSize = this.$refs.ref.offsetWidth / 100 * 3.6
      const adapterOption = {
        legend: {
          itemWidth: this.titleFontSize,
          itemHeight: this.titleFontSize,
          itemGap: this.titleFontSize,
          textStyle: {
            fontSize: this.titleFontSize / 2
          }
        }
      };
      this.chartInstance.setOption(adapterOption);
      this.chartInstance.resize();
    }
  }
}
</script>

<style lang="less" scoped>
.title {
  position: absolute;
  left: 20px;
  top: 20px;
  z-index: 10;
  color: white;

  .title-icon {
    margin-left: 10px;
    cursor: pointer;
  }

  .select-item {
    cursor: pointer;
  }

  .select-con {
    background-color: #222733;
  }
}
</style>