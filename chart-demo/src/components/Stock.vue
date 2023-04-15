<!--
 * @Author: zyy 1741540959@qq.com
 * @Date: 2023-02-25 16:09:40
 * @LastEditors: zyy
 * @LastEditTime: 2023-02-26 21:56:22
 * @Description: file content
-->
<!--圆环图-->
<template>
  <div class="com-container">
    <div class="com-chart" ref="ref"></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import debounce from 'lodash/debounce'
export default {
  data() {
    return {
      chartInstance: null,//echarts实例对象
      allData: [],//接收来自服务器的数据
      currentIndex: 0,
      timerId: null
    }
  },
  computed:{
    // 监听主题数据变化
    ...mapState(['theme'])
  },
  watch:{
    theme(){
      // 销毁实例
      this.chartInstance.dispose()
      this.initChart()
      this.screenAdapter()
      this.updateChart()
    }
  },
  created(){
    this.$socket.registerCallBack('stockData',this.getData)
  },
  mounted() {
    this.initChart()
    // this.getData()
    this.$socket.send({
      action:'getData',
      socketType:'stockData',
      chartName:'stock'
    })
    window.addEventListener('resize', debounce(this.screenAdapter,100))
    this.screenAdapter();
  },
  destroyed() {
    window.removeEventListener('resize', debounce(this.screenAdapter,100))
    clearInterval(this.timerId)
    this.$socket.unRegisterCallBack('stockData')
  },
  methods: {
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.ref, this.theme)
      const initOption = {
        title: {
          text: '▎库存和销量分析',
          left: 20,
          top: 20
        }
      };
      this.chartInstance.setOption(initOption);
      this.chartInstance.on('mouseover', () => {
        clearInterval(this.timerId);
      });
      this.chartInstance.on('mouseout', () => {
        this.startInterval();
      });
    },
    /* async getData() {
      const { data: res } = await this.$http.get('/stock')
      this.allData = res;
      this.updateChart()
      this.startInterval()
    }, */
    getData(res){
      this.allData = res;
      this.updateChart()
    },
    updateChart() {
      // 处理图表所需数据
      // 5个圆环对应的圆心点 圆心坐标是相对于容器的
      const centerArr = [
        ['18%', '40%'],
        ['50%', '40%'],
        ['82%', '40%'],
        ['34%', '75%'],
        ['66%', '75%']
      ];
      const colorArr = [
        ['#4FF778', '#0BA82C'],
        ['#E5DD45', '#E8B11C'],
        ['#E8821C', '#E55445'],
        ['#5052EE', '#AB6EE5'],
        ['#23E5E5', '#2E72BF']
      ];
      const start = this.currentIndex * 5;
      const end = (this.currentIndex + 1) * 5;
      const showData = this.allData.slice(start, end);
      const seriesArr = showData.map((item, index) => {
        return {
          type: 'pie',
          // 外圆半径 内圆半径
          // radius: [110, 100],
          center: centerArr[index],
          avoidLabelOverlap: false,
          // 关闭输入移入饼图时的动画效果
          hoverAnimation: false,
          // 图形是否不响应和触发鼠标事件，默认为 false，即响应和触发鼠标事件
          silent: true,
          // 指示线 隐藏
          labelLine: {
            normal: {
              show: false
            },
            emphasis: {
              show: false
            }
          },
          data: [
            // 销量
            {
              name: item.name + '\n\n' + item.sales,
              value: item.sales,
              itemStyle: {
                color: new this.$echarts.graphic.LinearGradient(0, 1, 0, 0,
                  [
                    {
                      offset: 0,
                      color: colorArr[index][0]
                    },
                    {
                      offset: 1,
                      color: colorArr[index][1]
                    }
                  ])
              },
              label: {
                show: true,
                color: colorArr[index][0],
                position: 'center'
              }
            },
            // 库存
            {
              value: item.stock,
              itemStyle: {
                color: '#333843'
              }
            }
          ]
        };
      });
      const dataOption = {
        series: seriesArr
      };

      this.chartInstance.setOption(dataOption);
    },
    screenAdapter() {
      const titleFontSize = this.$refs.ref.offsetWidth / 100 * 3.6
      const innerRadius = titleFontSize * 2.8;
      const outterRadius = innerRadius * 1.125;

      let config = {
        type: 'pie',
        radius: [outterRadius, innerRadius],
        label: {
          fontSize: titleFontSize / 2
        }
      }

      let ret = [];
      for (let index = 0; index < 5; index++) {
        ret.push(config);
      }

      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        series: ret
      };

      this.chartInstance.setOption(adapterOption);
      this.chartInstance.resize();
    }
  }
}
</script>

<style lang="less" scoped></style>