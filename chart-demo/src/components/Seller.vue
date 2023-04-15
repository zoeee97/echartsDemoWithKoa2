<!-- 横向柱状图 -->
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
      allData: null,//接收来自服务器的数据
      /* 
      AllData:[{
        name:string,
        value:number
      },...]
      */
      currentPage: 1,
      totalPage: 0,//总页数，每页显示五个条目
      timerId: null,//定时器标识
    }
  },
  computed: {
    // 监听主题数据变化
    ...mapState(['theme']),
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
    this.$socket.registerCallBack('sellerData', this.getData)
  },
  mounted() {
    // 因为初始化echarts实例对象需要用到DOM对象，所以只能放在mounted()
    this.initChart()
    // this.getData()
    this.$socket.send({
      action: 'getData',
      socketType: 'sellerData',
      chartName: 'seller'
    })
    // 对窗口大小变化的事件进行监听
    window.addEventListener('resize', debounce(this.screenAdapter,100))
    // 界面加载完成的时候，主动进行屏幕的适配
    this.screenAdapter();
  },
  destroyed() {
    // 组件销毁时，清空定时器
    clearInterval(this.timerId)
    // 组件销毁时，取消监听器
    window.removeEventListener('resize', debounce(this.screenAdapter,100))
    this.$socket.unRegisterCallBack('sellerData')
  },
  methods: {
    initChart() {
      // 初始化实例对象
      // 主题的指定，要在初始化echarts实例对象的时候就指定
      this.chartInstance = this.$echarts.init(this.$refs.ref, this.theme)
      // 对图表初始化配置的控制
      const initOption = {
        title: {
          text: '▎商家销售统计',
          left: 20,
          top: 20
        },
        grid: {
          // 坐标轴位置
          top: '20%',
          left: '3%',
          right: '6%',
          bottom: '3%',
          containLabel: true // 距离包含坐标轴上的内容
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line',
            z: 0,//z-index将层级降低
            lineStyle: {
              color: '#2D3443'
            }
          }
        },
        xAxis: {
          type: 'value'
        },
        yAxis: {
          type: 'category'
        },
        series: [
          {
            type: 'bar',
            label: {
              show: true,
              position: 'right',
              textStyle: {
                color: 'white'
              }
            },
            itemStyle: {
              // 指明柱状图的颜色渐变
              color: new this.$echarts.graphic.LinearGradient(0, 0, 1, 0, [
                {
                  offset: 0,
                  color: '#5052EE'
                },
                {
                  offset: 1,
                  color: '#AB6EE5'
                }
              ])
            }
          }
        ]
      }
      this.chartInstance.setOption(initOption);
      // 鼠标事件处理，如果光标从元素外部移到元素内部时就不轮播数据了-清空定时器
      // echarts实例对象的on方法可以绑定或解绑事件处理函数
      this.chartInstance.on('mouseover', () => {
        clearInterval(this.timerId)
      })
      this.chartInstance.on('mouseout', () => {
        this.startInterval()
      })
    },
    // async getData() {
    // 获取数据
    /* {data:res}解构赋值 把对象中的data变量重新命名成res【不是说改变原对象的属性名】，
    下面直接用res变量即可 */
    /*  const { data: res } = await this.$http.get('/seller')
     this.allData = res;
     // 对allData排序
     this.allData.sort((a, b) => a.value - b.value)
     // 计算总页数 向下取整 因为从0开始
     this.totalPage = Math.ceil(this.allData.length / 5)
     this.updateChart()//处理数据并更新界面
     // 开启动画效果
     this.startInterval() */
    // },
    getData(res) {
      this.allData = res;
      // 对allData排序
      this.allData.sort((a, b) => a.value - b.value)
      // 计算总页数 
      this.totalPage = Math.ceil(this.allData.length / 5)
      this.updateChart()//处理数据并更新界面
      // 开启动画效果
      this.startInterval()
    },
    updateChart() {
      const start = (this.currentPage-1) * 5;
      const end = this.currentPage * 5
      // 若start+5大于数组长度也没事，它会返回到最后一个元素为止
      const showData = this.allData.slice(start, end)
      // 处理数据
      const sellerNames = showData.map((item) => item.name)
      const sellerValues = showData.map((item) => item.value)

      const dataOption = {
        yAxis: {
          data: sellerNames
        },
        series: {
          data: sellerValues
        }
      }
      this.chartInstance.setOption(dataOption);
    },
    startInterval() {
      if (this.timerId) {
        clearInterval(this.timerId)
      }
      this.timerId = setInterval(() => {
        if (++this.currentPage > this.totalPage) {
          this.currentPage = 1;
        }
        this.updateChart()
      }, 3000)
    },
    // 当浏览器窗口大小发生变化时，hi调用的方法，完成屏幕的适配
    screenAdapter() {
      // 获取图标容器的宽度来计算字体大小
      const titleFontSize = (this.$refs.ref.offsetWidth / 100) * 3.6
      // 和分辨率大小相关的配置项
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        tooltip: {
          axisPointer: {
            lineStyle: {
              width: titleFontSize
            }
          }
        },
        series: {
          barWidth: titleFontSize,
          itemStyle: {
            barBorderRadius: [0, titleFontSize / 2, titleFontSize / 2, 0]
          }
        }
      };
      this.chartInstance.setOption(adapterOption);
      // 手动调用echars对象的resize()才能生效
      this.chartInstance.resize();
    }
  }
}
</script>

<style lang="less" scoped></style>