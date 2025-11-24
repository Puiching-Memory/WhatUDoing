<script>
	import dataSender from './utils/dataSender.js'
	import config from './utils/config.js'
	
	export default {
		onLaunch: function() {
			console.log('App Launch')
			
			// 启动定时数据发送
			// 服务器地址和发送间隔可以在 utils/config.js 中配置
			
			// 检查服务器连接
			dataSender.checkConnection().then(connected => {
				if (connected) {
					console.log('服务器连接正常，启动定时发送')
					dataSender.start()
				} else {
					console.warn('服务器连接失败，请检查服务器地址配置:', config.serverUrl)
				}
			})
		},
		onShow: function() {
			console.log('App Show')
			// 应用显示时，确保定时发送正在运行
			if (!dataSender.timerId) {
				dataSender.start()
			}
		},
		onHide: function() {
			console.log('App Hide')
			// 应用隐藏时的处理，根据配置决定是否停止发送
			if (!config.keepSendingWhenHidden) {
				dataSender.stop()
			}
		}
	}
</script>

<style>
	/*每个页面公共css */
</style>
