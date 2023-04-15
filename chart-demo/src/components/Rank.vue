<!--利用datazoom实现平移动画的纵向柱状图-->
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
      startValue:0,
      endValue:9,
      timerId:null,
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
    this.$socket.registerCallBack('rankData',this.getData)
  },
  mounted() {
    this.initChart()
    // this.getData()
    this.$socket.send({
      action:'getData',
      socketType:'rankData',
      chartName:'rank'
    })
    window.addEventListener('resize', debounce(this.screenAdapter,100))
    this.screenAdapter();
  },
  destroyed() {
    window.removeEventListener('resize', debounce(this.screenAdapter,100))
    clearInterval(this.timerId)
    this.$socket.unRegisterCallBack('rankData')
  },
  methods: {
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.ref, this.theme)
      const initOption = {
        title: {
          text: '▎地区销售排行',
          left: 20,
          top: 20
        },
        grid: {
          top: '40%',
          left: '5%',
          right: '5%',
          bottom: '5%',
          // 坐标轴的大小是否包含坐标轴上的文字
          containLabel: true
        },
        tooltip: {
          show: true
        },
        xAxis: {
          type: 'category'
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            type: 'bar'
          }
        ]
      };
      this.chartInstance.setOption(initOption);
      // 鼠标移入停止
      this.chartInstance.on('mouseover',()=>clearInterval(this.timerId))
      this.chartInstance.on('mouseout',()=>this.startInterval())
    },
 /*    async getData() {
      const { data: res } = await this.$http.get('/rank')
      this.allData = res;
      // 从大到小排序
      this.allData.sort((a, b) => b.value - a.value)
      this.updateChart()
      this.startInterval()
    }, */
    getData(res){
      this.allData = res;
      // 从大到小排序
      this.allData.sort((a, b) => b.value - a.value)
      this.updateChart()
      this.startInterval()
    },
    updateChart() {
      const colorArr = [
        ['#0ba82c', '#4ff778'],
        ['#2e72bf', '#23e5e5'],
        ['#5052ee', '#ab6ee5']
      ];
      const provinceArr = this.allData.map((item) => item.name)
      const valueArr = this.allData.map((item) => item.value)
      const dataOption = {
        xAxis: {
          data: provinceArr
        },
        // 平移动画可以用dataZoom中的startValue和endValue实现
        dataZoom: {
          show: false,//隐藏dataZoom的显示
          startValue: this.startValue,
          endValue: this.endValue
        },
        series: [
          {
            data: valueArr,
            itemStyle: {
              color: arg => {
                let targetColorArr = null;
                if (arg.value > 300) {
                  targetColorArr = colorArr[0];
                } else if (arg.value > 200) {
                  targetColorArr = colorArr[1];
                } else {
                  targetColorArr = colorArr[2];
                }
                return new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: targetColorArr[0]
                  },
                  {
                    offset: 1,
                    color: targetColorArr[1]
                  }
                ]);
              }
            }
          }
        ]

      }
      this.chartInstance.setOption(dataOption);
    },
    startInterval() {
      if (this.timerId) {
        clearInterval(this.timerId)
      }
      this.timerId = setInterval(() => {
        this.startValue++
        if (++this.endValue > this.allData.length-1) {
          this.startValue = 0;
          this.endValue = 9
        }
        this.updateChart()
      }, 3000)
    },
    screenAdapter() {
      const titleFontSize = this.$refs.ref.offsetWidth / 100 * 3.6
      const adapterOption = {
        title: {
						textStyle: {
							fontSize: titleFontSize
						}
					},
					series: [
						{
							// 柱的宽度
							barWidth: titleFontSize,
							// 实现柱顶部半圆形效果
							itemStyle: {
								borderRadius: [
									// 左上角
									titleFontSize / 2,
									// 右上角
									titleFontSize / 2,
									0,
									0
								]
							}
						}
					]
      };
      this.chartInstance.setOption(adapterOption);
      this.chartInstance.resize();
    }
  }
}
</script>

<style lang="less" scoped></style>