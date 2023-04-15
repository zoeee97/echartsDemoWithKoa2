<!--
 * @Author: zyy 1741540959@qq.com
 * @Date: 2023-02-24 21:07:24
 * @LastEditors: zyy
 * @LastEditTime: 2023-02-24 21:16:18
 * @Description: file content
-->
<template>
	<div class="com-page">
		<seller></seller>
	</div>
</template>

<script>
	import Seller from '@/components/Seller'
	export default {
		name: 'SellerPage',
		components: {
			seller: Seller
		}
	};
</script>

<style lang="less" scoped>
</style>
