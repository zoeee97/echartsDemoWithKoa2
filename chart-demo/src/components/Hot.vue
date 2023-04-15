<!--饼图-->
<template>
  <div class="com-container">
    <div class="com-chart" ref="ref"></div>
    <span class="iconfont arr-left" @click="toLeft" :style="comStyle">&#xe6ef;</span>
    <span class="iconfont arr-right" @click="toRight" :style="comStyle">&#xe6ed;</span>
    <!-- 分类名称 -->
    <span class="cate-name" :style="comStyle">
      {{ cateName }}
    </span>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getThemeValue } from '@/utils/theme_utils'
import debounce from 'lodash/debounce'
export default {
  name:'Hot',
  data() {
    return {
      chartInstance: null,//echarts实例对象
      allData: null,//接收来自服务器的数据
      currentIndex: 0,//代表当前显示的数据索引，通过左右箭头改变该值
      titleFontSize:0
    }
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
  computed:{
    cateName(){
      if(!this.allData){
        return ''
      }
      return this.allData[this.currentIndex].name
    },
    comStyle(){
      return {
        fontSize:this.titleFontSize+'px',
        color:getThemeValue(this.theme).titleColor
      }
    },
    // 监听主题数据变化
    ...mapState(['theme'])
  },
  created(){
    this.$socket.registerCallBack('hotData',this.getData)
  },
  mounted() {
    this.initChart()
    // this.getData()
    this.$socket.send({
      action:'getData',
      socketType:'hotData',
      chartName:'hot'
    })
    window.addEventListener('resize', debounce(this.screenAdapter,100))
    this.screenAdapter();
  },
  destroyed() {
    window.removeEventListener('resize', debounce(this.screenAdapter,100))
    this.$socket.unRegisterCallBack('hotData')
  },
  methods: {
    toLeft(){
      this.currentIndex--
      if(this.currentIndex<0){
        this.currentIndex = this.allData.length-1
      }
      this.updateChart()
    },
    toRight(){
      this.currentIndex++
      if(this.currentIndex>this.allData.length-1){
        this.currentIndex = 0
      }
      this.updateChart()
    },
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.ref, this.theme)
      const initOption = {
        title: {
          text: '▎热销商品占比',
          left: 20,
          top: 20
        },
        legend: {
          top: '15%',
          icon: 'circle'
        },
        // 工具提示
        /* 当鼠标移入某个扇区时，需要将二级分类下的三级分类数据进行展示 */
        tooltip: {
          show: true,
          // 决定tooltip中的显示文字内容 提示框浮层内容格式器，支持字符串模板和回调函数两种形式
          formatter: arg => {
            const thirdCategory = arg.data.children;
            let total = 0;
            thirdCategory.forEach(element => {
              total += element.value;
            });
            let retStr = '';
            thirdCategory.forEach(item => {
              retStr += `${item.name}: ${parseInt(item.value / total * 100) + '%'} <br/>`;
            });
            return retStr;
          }
        },
        series: [
          {
            type: 'pie',
            label: {
              show: false
            },
            // 饼图处于高亮状态情况下，应用的一些样式
            emphasis: {
              label: {
                show: true
              },
              labelLine: {
                show: false
              }
            }
          }
        ]

      };
      this.chartInstance.setOption(initOption);
    },
    /* async getData() {
      const { data: res } = await this.$http.get('/hot')
      this.allData = res;
      this.updateChart()
    }, */
    getData(res){
      this.allData = res;
      this.updateChart()
    },
    updateChart() {
      // 饼图数据
      const seriesData = this.allData[this.currentIndex].children.map(item => {
        return {
          name: item.name,
          value: item.value,
          children: item.children // 新增加children的原因是为了在tooltip中的formatter的回调函数中,来拿到这个二级分类下的三级分类数据
        };
      })
      // 图例数据
      const legendData = this.allData[this.currentIndex].children.map((item) => item.name)
      const dataOption = {
        legend: {
          data: legendData
        },
        series: [
          {
            data: seriesData
          }
        ]
      }
      this.chartInstance.setOption(dataOption);
    },
    screenAdapter() {
      this.titleFontSize = (this.$refs.ref.offsetWidth) / 100 * 3.6
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: this.titleFontSize
          }
        },
        legend: {
          // 图例的大小
          itemWidth: this.titleFontSize ,
          itemHeight: this.titleFontSize ,
          // 图例也图例之间的间隔
          itemGap: this.titleFontSize / 2,
          // 图例文字的大小
          textStyle: {
            fontSize: this.titleFontSize / 2
          }
        },
        series: [
          {
            // 饼图的大小是通过半径决定
            radius: this.titleFontSize * 4.5,
            // 饼图的位置
            center: ['50%', '60%']
          }
        ]

      };
      this.chartInstance.setOption(adapterOption);
      this.chartInstance.resize();
    }
  }
}
</script>

<style lang="less" scoped>
.arr-left {
	position: absolute;
	left: 10%;
	top: 50%;
	transform: translateY(-50%);
	cursor: pointer;
	color: white;
}

.arr-right {
	position: absolute;
	right: 10%;
	top: 50%;
	transform: translateY(-50%);
	cursor: pointer;
	color: white;
}

.cate-name {
	position: absolute;
	right: 10%;
	bottom: 20px;
	color: white;
}

</style>