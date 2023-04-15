<!-- 散点图 -->
<template>
  <!-- 双击回到中国地图 -->
  <div class="com-container" @dblclick="revertMap">
    <div class="com-chart" ref="ref"></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import debounce from 'lodash/debounce'
import {getProvinceMapInfo} from '@/utils/map_utils'
export default {
  data() {
    return {
      chartInstance: null,//echarts实例对象
      allData: null,//接收来自服务器的数据
      mapData:{},
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
    this.$socket.registerCallBack('mapData',this.getData)
  },
  mounted() {
    this.initChart()
    // this.getData()
    this.$socket.send({
      action:'getData',
      socketType:'mapData',
      chartName:'map'
    })
    window.addEventListener('resize', debounce(this.screenAdapter,100))
    this.screenAdapter();
  },
  destroyed() {
    window.removeEventListener('resize', debounce(this.screenAdapter,100))
    this.$socket.unRegisterCallBack('mapData')
  },
  methods: {
    async initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.ref, this.theme)
      const { data: mapData } = await this.$http.get('/map/china')
      // 注册地图数据到全局echarts对象中
      this.$echarts.registerMap('china', mapData)
      const initOption = {
        title: {
          text: '▎商家分布',
          left: 20,
          top: 20
        },
        // 地图位置和颜色
        geo: {
          type: 'map',
          map: 'china',
          top: '5%',
          bottom: '5%',
          itemStyle: {
            areaColor: '#2e72bf',
            borderColor: '#333'
          }
        },
        legend: {
          left: '5%',
          bottom: '5%',
          // 图例方向
          orient: 'vertical'
        }
      };
      this.chartInstance.setOption(initOption);
      // 响应图表的点击事件，并获取点击项区域的地图数据
      this.chartInstance.on('click',async arg=>{
        // arg.name是所点击的中文省份名称
        const provinceInfo = getProvinceMapInfo(arg.name)
        if(provinceInfo.key===undefined) return;
        if(!this.mapData[provinceInfo.key]){
          const {data:res} = await this.$http.get(provinceInfo.path)
          // 注册地图矢量数据
          this.$echarts.registerMap(provinceInfo.key,res)
          this.mapData[provinceInfo.key] = res
        }
        this.chartInstance.setOption({
          geo:{
            map:provinceInfo.key
          }
        })
      })
    },
    /* async getData() {
      const { data: res } = await this.$http.get('/map')
      this.allData = res;
      this.updateChart()
    }, */
    getData(res){
      this.allData = res;
      this.updateChart()
    },
    updateChart() {
      // 图例数据
      const legendData = this.allData.map(item => item.name)
      // 散点数据
      const seriesArr = this.allData.map(item => {
        // return的这个对象就代表的是一个类别下的所有散点数据
        // 如果需要在地图中显示散点的数据，所以我们需要给散点的图标增加一个配置，coordinateSystem:geo
        return {
          type: 'effectScatter',
          // 涟漪效果
          rippleEffect: {
            scale: 5,
            // 空心的涟漪效果
            brushType: 'stroke'
          },
          coordinateSystem: 'geo',
          name: item.name,
          data: item.children
        }
      })
      const dataOption = {
        legend: {
          data: legendData
        },
        series: seriesArr
      }
      this.chartInstance.setOption(dataOption);
    },
    screenAdapter() {
      const titleFontSize = this.$refs.ref.offsetWidth / 100 * 3.6
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        legend: {
          itemWidth: titleFontSize / 2,
          itemHeight: titleFontSize / 2,
          // 图例之间的间隔
          itemGap: titleFontSize / 2,
          textStyle: {
            fontSize: titleFontSize / 2
          }
        }

      };
      this.chartInstance.setOption(adapterOption);
      this.chartInstance.resize();
    },
    revertMap(){
      this.chartInstance.setOption({
        geo:{
          map:'china'
        }
      })
    }
  }
}
</script>

<style lang="less" scoped></style>