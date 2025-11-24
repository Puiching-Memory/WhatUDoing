<template>
	<view class="content">
		<view class="header">
			<text class="title">数据收集工具</text>
		</view>
		
		<view class="data-section">
			<button class="collect-btn" @click="collectData" :loading="loading">
				{{ loading ? '收集中...' : '收集数据' }}
			</button>
		</view>
		
		<view class="data-display">
			<!-- 电量信息 -->
			<view class="data-item">
				<text class="data-label">🔋 电量信息</text>
				<view class="data-content" v-if="collectedData && collectedData.battery && !collectedData.battery.error">
					<text>电量：<text class="value-text battery-level">{{ collectedData.battery.level }}%</text></text>
					<text>充电状态：<text class="value-text" :class="{'charging': collectedData.battery.isCharging}">
						{{ collectedData.battery.isCharging ? '🔌 正在充电' : '🔋 未充电' }}
					</text></text>
				</view>
				<text class="error-text" v-else-if="collectedData && collectedData.battery && collectedData.battery.error">
					{{ collectedData.battery.error }}
					<text class="note-text" style="display: block; margin-top: 10rpx;">提示：可安装 uni.getBatteryInfo 插件获取电量信息</text>
				</text>
				<text class="placeholder-text" v-else>点击上方按钮收集数据</text>
			</view>
			
			<!-- 位置信息 -->
			<view class="data-item">
				<text class="data-label">📍 位置信息</text>
				<view class="data-content" v-if="collectedData && collectedData.location && !collectedData.location.error">
					<text>纬度：<text class="value-text">{{ collectedData.location.latitude }}</text></text>
					<text>经度：<text class="value-text">{{ collectedData.location.longitude }}</text></text>
					<text>精度：<text class="value-text">{{ collectedData.location.accuracy }}m</text></text>
					<text v-if="collectedData.location.altitude">海拔：<text class="value-text">{{ collectedData.location.altitude }}m</text></text>
					<text v-if="collectedData.location.verticalAccuracy">垂直精度：<text class="value-text">{{ collectedData.location.verticalAccuracy }}m</text></text>
					<view v-if="collectedData.location.address" class="address-detail">
						<text class="address-title">📍 地址信息：</text>
						<text v-if="collectedData.location.address.country">国家：<text class="value-text">{{ collectedData.location.address.country }}</text></text>
						<text v-if="collectedData.location.address.province">省份：<text class="value-text">{{ collectedData.location.address.province }}</text></text>
						<text v-if="collectedData.location.address.city">城市：<text class="value-text">{{ collectedData.location.address.city }}</text></text>
						<text v-if="collectedData.location.address.district">区县：<text class="value-text">{{ collectedData.location.address.district }}</text></text>
						<text v-if="collectedData.location.address.street">街道：<text class="value-text">{{ collectedData.location.address.street }}</text></text>
						<text v-if="collectedData.location.address.streetNum">门牌号：<text class="value-text">{{ collectedData.location.address.streetNum }}</text></text>
						<text v-if="collectedData.location.address.poiName">POI：<text class="value-text">{{ collectedData.location.address.poiName }}</text></text>
					</view>
				</view>
				<text class="error-text" v-else-if="collectedData && collectedData.location && collectedData.location.error">{{ collectedData.location.error }}</text>
				<text class="placeholder-text" v-else>点击上方按钮收集数据</text>
			</view>
			
			<!-- 前台APP信息 -->
			<view class="data-item">
				<text class="data-label">📱 前台APP</text>
				<view class="data-content" v-if="collectedData && collectedData.foregroundApp && !collectedData.foregroundApp.error">
					<text>包名：<text class="value-text">{{ collectedData.foregroundApp.packageName }}</text></text>
					<text v-if="collectedData.foregroundApp.className">类名：<text class="value-text">{{ collectedData.foregroundApp.className }}</text></text>
					<text v-if="collectedData.foregroundApp.note" class="note-text">{{ collectedData.foregroundApp.note }}</text>
				</view>
				<text class="error-text" v-else-if="collectedData && collectedData.foregroundApp && collectedData.foregroundApp.error">{{ collectedData.foregroundApp.error }}</text>
				<text class="placeholder-text" v-else>点击上方按钮收集数据</text>
			</view>
			
			<!-- 设备信息 -->
			<view class="data-item">
				<text class="data-label">📱 设备信息</text>
				<view class="data-content" v-if="collectedData && collectedData.deviceInfo && !collectedData.deviceInfo.error">
					<text>品牌：<text class="value-text">{{ collectedData.deviceInfo.brand || collectedData.deviceInfo.deviceBrand || 'N/A' }}</text></text>
					<text>型号：<text class="value-text">{{ collectedData.deviceInfo.model || collectedData.deviceInfo.deviceModel || 'N/A' }}</text></text>
					<text>系统：<text class="value-text">{{ collectedData.deviceInfo.system || 'N/A' }}</text></text>
					<text>平台：<text class="value-text">{{ collectedData.deviceInfo.platform || 'N/A' }}</text></text>
					<text v-if="collectedData.deviceInfo.osVersion">系统版本：<text class="value-text">{{ collectedData.deviceInfo.osVersion }}</text></text>
					<text v-if="collectedData.deviceInfo.deviceId">设备ID：<text class="value-text">{{ collectedData.deviceInfo.deviceId }}</text></text>
				</view>
				<text class="error-text" v-else-if="collectedData && collectedData.deviceInfo && collectedData.deviceInfo.error">{{ collectedData.deviceInfo.error }}</text>
				<text class="placeholder-text" v-else>点击上方按钮收集数据</text>
			</view>
			
			<!-- 网络信息 -->
			<view class="data-item">
				<text class="data-label">🌐 网络信息</text>
				<view class="data-content" v-if="collectedData && collectedData.networkInfo && !collectedData.networkInfo.error">
					<text>网络类型：<text class="value-text">{{ collectedData.networkInfo.networkType || 'N/A' }}</text></text>
					<text v-if="collectedData.networkInfo.currentType">当前类型：<text class="value-text">{{ collectedData.networkInfo.currentType }}</text></text>
					<text v-if="collectedData.networkInfo.isMetered !== undefined">是否计费网络：<text class="value-text">{{ collectedData.networkInfo.isMetered ? '是' : '否' }}</text></text>
					
					<!-- WiFi详细信息 -->
					<view v-if="collectedData.networkInfo.wifiInfo" class="wifi-detail">
						<text class="wifi-title">📶 WiFi详细信息：</text>
						<text v-if="collectedData.networkInfo.wifiInfo.ssid">WiFi名称(SSID)：<text class="value-text">{{ collectedData.networkInfo.wifiInfo.ssid }}</text></text>
						<text v-if="collectedData.networkInfo.wifiInfo.bssid">MAC地址(BSSID)：<text class="value-text">{{ collectedData.networkInfo.wifiInfo.bssid }}</text></text>
						<text v-if="collectedData.networkInfo.wifiInfo.signalStrength !== undefined">信号强度：<text class="value-text">{{ collectedData.networkInfo.wifiInfo.signalStrength }} dBm</text></text>
						<text v-if="collectedData.networkInfo.wifiInfo.frequency">频率：<text class="value-text">{{ collectedData.networkInfo.wifiInfo.frequency }} MHz</text></text>
						<text v-if="collectedData.networkInfo.wifiInfo.secure !== undefined">安全类型：<text class="value-text">{{ collectedData.networkInfo.wifiInfo.secure ? '加密' : '开放' }}</text></text>
					</view>
					<text v-else-if="collectedData.networkInfo.networkType === 'wifi'" class="note-text">提示：安装 uni-wifi 插件可获取详细WiFi信息</text>
				</view>
				<text class="error-text" v-else-if="collectedData && collectedData.networkInfo && collectedData.networkInfo.error">{{ collectedData.networkInfo.error }}</text>
				<text class="placeholder-text" v-else>点击上方按钮收集数据</text>
			</view>
			
			<!-- 存储信息 -->
			<view class="data-item">
				<text class="data-label">💾 存储信息</text>
				<view class="data-content" v-if="collectedData && collectedData.storageInfo && !collectedData.storageInfo.error">
					<text>已用空间：<text class="value-text">{{ formatSize(collectedData.storageInfo.currentSize) }}</text></text>
					<text>限制空间：<text class="value-text">{{ formatSize(collectedData.storageInfo.limitSize) }}</text></text>
					<text v-if="collectedData.storageInfo.keys">存储键数量：<text class="value-text">{{ collectedData.storageInfo.keys.length }}</text></text>
				</view>
				<text class="error-text" v-else-if="collectedData && collectedData.storageInfo && collectedData.storageInfo.error">{{ collectedData.storageInfo.error }}</text>
				<text class="placeholder-text" v-else>点击上方按钮收集数据</text>
			</view>
			
			<!-- 应用信息 -->
			<view class="data-item">
				<text class="data-label">📦 应用信息</text>
				<view class="data-content" v-if="collectedData && collectedData.appInfo && !collectedData.appInfo.error">
					<text v-if="collectedData.appInfo.appName">应用名称：<text class="value-text">{{ collectedData.appInfo.appName }}</text></text>
					<text v-if="collectedData.appInfo.appVersion">应用版本：<text class="value-text">{{ collectedData.appInfo.appVersion }}</text></text>
					<text v-if="collectedData.appInfo.versionCode">版本号：<text class="value-text">{{ collectedData.appInfo.versionCode }}</text></text>
					<text v-if="collectedData.appInfo.appid">应用ID：<text class="value-text">{{ collectedData.appInfo.appid }}</text></text>
					<text v-if="collectedData.appInfo.uniVersion">uni-app版本：<text class="value-text">{{ collectedData.appInfo.uniVersion }}</text></text>
				</view>
				<text class="error-text" v-else-if="collectedData && collectedData.appInfo && collectedData.appInfo.error">{{ collectedData.appInfo.error }}</text>
				<text class="placeholder-text" v-else>点击上方按钮收集数据</text>
			</view>
			
			<!-- 屏幕信息 -->
			<view class="data-item">
				<text class="data-label">📺 屏幕信息</text>
				<view class="data-content" v-if="collectedData && collectedData.screenInfo && !collectedData.screenInfo.error">
					<text>屏幕尺寸：<text class="value-text">{{ collectedData.screenInfo.screenWidth }} × {{ collectedData.screenInfo.screenHeight }}</text></text>
					<text>窗口尺寸：<text class="value-text">{{ collectedData.screenInfo.windowWidth }} × {{ collectedData.screenInfo.windowHeight }}</text></text>
					<text v-if="collectedData.screenInfo.pixelRatio">像素比：<text class="value-text">{{ collectedData.screenInfo.pixelRatio }}</text></text>
					<text v-if="collectedData.screenInfo.statusBarHeight">状态栏高度：<text class="value-text">{{ collectedData.screenInfo.statusBarHeight }}px</text></text>
				</view>
				<text class="error-text" v-else-if="collectedData && collectedData.screenInfo && collectedData.screenInfo.error">{{ collectedData.screenInfo.error }}</text>
				<text class="placeholder-text" v-else>点击上方按钮收集数据</text>
			</view>
			
			<!-- 系统信息 -->
			<view class="data-item">
				<text class="data-label">⚙️ 系统信息</text>
				<view class="data-content" v-if="collectedData && collectedData.systemInfo && !collectedData.systemInfo.error">
					<text v-if="collectedData.systemInfo.platform">平台：<text class="value-text">{{ collectedData.systemInfo.platform }}</text></text>
					<text v-if="collectedData.systemInfo.system">系统：<text class="value-text">{{ collectedData.systemInfo.system }}</text></text>
					<text v-if="collectedData.systemInfo.timezone">时区：<text class="value-text">{{ collectedData.systemInfo.timezone }}</text></text>
					<text v-if="collectedData.systemInfo.SDKVersion">SDK版本：<text class="value-text">{{ collectedData.systemInfo.SDKVersion }}</text></text>
				</view>
				<text class="error-text" v-else-if="collectedData && collectedData.systemInfo && collectedData.systemInfo.error">{{ collectedData.systemInfo.error }}</text>
				<text class="placeholder-text" v-else>点击上方按钮收集数据</text>
			</view>
			
			<!-- 加速度计信息 -->
			<view class="data-item">
				<text class="data-label">📊 加速度计</text>
				<view class="data-content" v-if="collectedData && collectedData.accelerometer && !collectedData.accelerometer.error">
					<text v-if="collectedData.accelerometer.x !== undefined">X轴：<text class="value-text">{{ collectedData.accelerometer.x.toFixed(2) }}</text></text>
					<text v-if="collectedData.accelerometer.y !== undefined">Y轴：<text class="value-text">{{ collectedData.accelerometer.y.toFixed(2) }}</text></text>
					<text v-if="collectedData.accelerometer.z !== undefined">Z轴：<text class="value-text">{{ collectedData.accelerometer.z.toFixed(2) }}</text></text>
				</view>
				<text class="error-text" v-else-if="collectedData && collectedData.accelerometer && collectedData.accelerometer.error">{{ collectedData.accelerometer.error }}</text>
				<text class="placeholder-text" v-else>点击上方按钮收集数据</text>
			</view>
			
			<!-- 推送通知信息 -->
			<view class="data-item">
				<text class="data-label">🔔 推送通知</text>
				<view class="data-content" v-if="collectedData && collectedData.pushNotification && !collectedData.pushNotification.error">
					<!-- 客户端ID和令牌 -->
					<text v-if="collectedData.pushNotification.clientId">客户端ID：<text class="value-text">{{ collectedData.pushNotification.clientId }}</text></text>
					<text v-if="collectedData.pushNotification.token">令牌：<text class="value-text">{{ collectedData.pushNotification.token.substring(0, 20) }}...</text></text>
					
					<!-- 推送服务信息 -->
					<view v-if="collectedData.pushNotification.pushService" class="push-detail">
						<text class="push-title">📡 推送服务：</text>
						<text v-if="collectedData.pushNotification.pushService.clientid">服务客户端ID：<text class="value-text">{{ collectedData.pushNotification.pushService.clientid }}</text></text>
						<text v-if="collectedData.pushNotification.pushService.appid">应用ID：<text class="value-text">{{ collectedData.pushNotification.pushService.appid }}</text></text>
						<text v-if="collectedData.pushNotification.pushService.token">服务令牌：<text class="value-text">{{ collectedData.pushNotification.pushService.token.substring(0, 20) }}...</text></text>
					</view>
					
					<!-- 权限状态 -->
					<view v-if="collectedData.pushNotification.permission" class="push-detail">
						<text class="push-title">🔐 权限状态：</text>
						<text>平台：<text class="value-text">{{ collectedData.pushNotification.permission.platform || 'N/A' }}</text></text>
						<text v-if="collectedData.pushNotification.permission.enabled !== null">
							状态：<text class="value-text" :class="{'permission-enabled': collectedData.pushNotification.permission.enabled, 'permission-disabled': !collectedData.pushNotification.permission.enabled}">
								{{ collectedData.pushNotification.permission.enabled ? '✅ 已启用' : '❌ 未启用' }}
							</text>
						</text>
						<text v-if="collectedData.pushNotification.permission.note" class="note-text">{{ collectedData.pushNotification.permission.note }}</text>
					</view>
					
					<!-- 通道信息 -->
					<view v-if="collectedData.pushNotification.channelInfo" class="push-detail">
						<text class="push-title">📢 推送通道：</text>
						<text v-if="collectedData.pushNotification.channelInfo.id">通道ID：<text class="value-text">{{ collectedData.pushNotification.channelInfo.id }}</text></text>
						<text v-if="collectedData.pushNotification.channelInfo.name">通道名称：<text class="value-text">{{ collectedData.pushNotification.channelInfo.name }}</text></text>
						<text v-if="collectedData.pushNotification.channelInfo.description">描述：<text class="value-text">{{ collectedData.pushNotification.channelInfo.description }}</text></text>
						<text v-if="collectedData.pushNotification.channelInfo.sound !== undefined">声音：<text class="value-text">{{ collectedData.pushNotification.channelInfo.sound ? '开启' : '关闭' }}</text></text>
						<text v-if="collectedData.pushNotification.channelInfo.vibrate !== undefined">震动：<text class="value-text">{{ collectedData.pushNotification.channelInfo.vibrate ? '开启' : '关闭' }}</text></text>
					</view>
					
					<!-- 最近消息 -->
					<view v-if="collectedData.pushNotification.recentMessages" class="push-detail">
						<text class="push-title">📨 最近消息：</text>
						<text>消息数量：<text class="value-text">{{ collectedData.pushNotification.recentMessages.count || 0 }}</text></text>
						<view v-if="collectedData.pushNotification.recentMessages.latestMessage" class="message-detail">
							<text v-if="collectedData.pushNotification.recentMessages.latestMessage.title">标题：<text class="value-text">{{ collectedData.pushNotification.recentMessages.latestMessage.title }}</text></text>
							<text v-if="collectedData.pushNotification.recentMessages.latestMessage.content">内容：<text class="value-text">{{ collectedData.pushNotification.recentMessages.latestMessage.content }}</text></text>
							<text v-if="collectedData.pushNotification.recentMessages.latestMessage.timestamp">
								时间：<text class="value-text">{{ formatTime(collectedData.pushNotification.recentMessages.latestMessage.timestamp) }}</text>
							</text>
						</view>
						<text v-else class="note-text">暂无推送消息</text>
					</view>
				</view>
				<text class="error-text" v-else-if="collectedData && collectedData.pushNotification && collectedData.pushNotification.error">
					{{ collectedData.pushNotification.error }}
					<text class="note-text" style="display: block; margin-top: 10rpx;">提示：推送信息仅在App环境下可用</text>
				</text>
				<text class="placeholder-text" v-else>点击上方按钮收集数据</text>
			</view>
			
			<!-- 时间戳 -->
			<view class="data-item" v-if="collectedData && collectedData.timestamp">
				<text class="data-label">⏰ 收集时间</text>
				<text class="data-content value-text">{{ formatTime(collectedData.timestamp) }}</text>
			</view>
		</view>
	</view>
</template>

<script>
	import dataCollector from '@/utils/dataCollector.js'
	
	export default {
		data() {
			return {
				title: 'Hello',
				loading: false,
				collectedData: null
			}
		},
		onLoad() {
			// 页面加载时自动收集一次数据
			// this.collectData()
		},
		methods: {
			async collectData() {
				console.log('[Page] ===== 用户点击收集数据按钮 =====')
				const pageStartTime = Date.now()
				
				this.loading = true
				// 先清空旧数据，显示加载状态
				this.collectedData = null
				
				try {
					console.log('[Page] 调用 dataCollector.collectAll() 开始收集数据')
					const data = await dataCollector.collectAll()
					
					const pageDuration = Date.now() - pageStartTime
					console.log('[Page] 数据收集完成，准备更新页面显示')
					console.log(`[Page] 页面处理耗时: ${pageDuration}ms`)
					
					// 更新数据 - 直接赋值，uni-app会自动处理响应式
					console.log('[Page] 准备更新页面数据，数据项数量:', Object.keys(data).length)
					
					// 直接赋值，确保响应式更新
					this.collectedData = JSON.parse(JSON.stringify(data)) // 深拷贝确保响应式
					
					console.log('[Page] 数据已更新到 collectedData')
					console.log('[Page] collectedData 是否存在:', !!this.collectedData)
					console.log('[Page] collectedData 键:', this.collectedData ? Object.keys(this.collectedData) : 'null')
					
					// 延迟一下确保视图更新
					setTimeout(() => {
						console.log('[Page] 延迟检查 - collectedData:', this.collectedData ? '存在' : '不存在')
					}, 100)
					
					// 检查是否有数据收集成功
					const hasSuccess = (data.battery && !data.battery.error) || 
					                 (data.location && !data.location.error) || 
					                 (data.foregroundApp && !data.foregroundApp.error)
					
					if (hasSuccess) {
						uni.showToast({
							title: '数据收集完成',
							icon: 'success',
							duration: 2000
						})
					} else {
						uni.showToast({
							title: '部分数据收集失败',
							icon: 'none',
							duration: 2000
						})
					}
					
					console.log('[Page] ===== 数据收集流程完成 =====')
				} catch (error) {
					const pageDuration = Date.now() - pageStartTime
					console.error('[Page] ===== 数据收集异常 =====')
					console.error('[Page] 错误信息:', error)
					console.error(`[Page] 页面处理耗时: ${pageDuration}ms`)
					if (error && error.stack) {
						console.error('[Page] 错误堆栈:', error.stack)
					}
					
					// 即使出错，也尝试显示已收集的数据
					try {
						const partialData = dataCollector.getData()
						if (partialData && (partialData.battery || partialData.location || partialData.foregroundApp)) {
							this.collectedData = {
								battery: partialData.battery || { error: '收集失败' },
								location: partialData.location || { error: '收集失败' },
								foregroundApp: partialData.foregroundApp || { error: '收集失败' },
								timestamp: Date.now()
							}
							console.log('[Page] 已显示部分收集到的数据')
						}
					} catch (e) {
						console.error('[Page] 获取部分数据失败:', e)
					}
					
					uni.showToast({
						title: '数据收集异常',
						icon: 'error',
						duration: 2000
					})
					console.error('[Page] ===== 错误处理完成 =====')
				} finally {
					this.loading = false
					console.log('[Page] 加载状态已重置')
				}
			},
			formatTime(timestamp) {
				const date = new Date(timestamp)
				return date.toLocaleString('zh-CN', {
					year: 'numeric',
					month: '2-digit',
					day: '2-digit',
					hour: '2-digit',
					minute: '2-digit',
					second: '2-digit'
				})
			},
			formatSize(sizeKB) {
				if (!sizeKB && sizeKB !== 0) return 'N/A'
				if (sizeKB < 1024) {
					return sizeKB + ' KB'
				} else if (sizeKB < 1024 * 1024) {
					return (sizeKB / 1024).toFixed(2) + ' MB'
				} else {
					return (sizeKB / (1024 * 1024)).toFixed(2) + ' GB'
				}
			}
		}
	}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background-color: #f8f8f8;
		padding: 30rpx;
	}

	.header {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 40rpx 0;
	}

	.title {
		font-size: 44rpx;
		color: #333;
		font-weight: bold;
	}

	.data-section {
		width: 100%;
		margin-bottom: 30rpx;
	}

	.collect-btn {
		width: 100%;
		background-color: #007AFF;
		color: #fff;
		border-radius: 12rpx;
		padding: 24rpx;
		font-size: 34rpx;
		font-weight: 500;
		border: none;
		box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, 0.3);
	}

	.collect-btn:active {
		background-color: #0051D5;
	}

	.data-display {
		width: 100%;
		background-color: #fff;
		border-radius: 12rpx;
		padding: 30rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
	}

	.data-item {
		margin-bottom: 35rpx;
		padding-bottom: 25rpx;
		border-bottom: 1px solid #e8e8e8;
	}

	.data-item:last-child {
		border-bottom: none;
		margin-bottom: 0;
		padding-bottom: 0;
	}

	.data-label {
		font-size: 34rpx;
		color: #333;
		font-weight: bold;
		display: block;
		margin-bottom: 20rpx;
	}

	.data-content {
		display: flex;
		flex-direction: column;
		font-size: 28rpx;
		color: #666;
		line-height: 2;
	}

	.data-content text {
		margin-bottom: 10rpx;
		display: block;
	}

	.value-text {
		color: #007AFF;
		font-weight: 500;
	}

	.placeholder-text {
		font-size: 26rpx;
		color: #999;
		font-style: italic;
		padding: 20rpx 0;
	}

	.error-text {
		font-size: 26rpx;
		color: #ff3b30;
		padding: 20rpx 0;
	}

	.note-text {
		font-size: 24rpx;
		color: #999;
		margin-top: 10rpx;
		font-style: italic;
		line-height: 1.6;
	}

	.wifi-detail {
		margin-top: 15rpx;
		padding-top: 15rpx;
		border-top: 1px solid #e8e8e8;
	}

	.wifi-title {
		font-size: 28rpx;
		color: #666;
		font-weight: 500;
		display: block;
		margin-bottom: 10rpx;
	}

	.address-detail {
		margin-top: 15rpx;
		padding-top: 15rpx;
		border-top: 1px solid #e8e8e8;
	}

	.address-title {
		font-size: 28rpx;
		color: #666;
		font-weight: 500;
		display: block;
		margin-bottom: 10rpx;
	}

	.push-detail {
		margin-top: 15rpx;
		padding-top: 15rpx;
		border-top: 1px solid #e8e8e8;
	}

	.push-title {
		font-size: 28rpx;
		color: #666;
		font-weight: 500;
		display: block;
		margin-bottom: 10rpx;
	}

	.message-detail {
		margin-top: 10rpx;
		padding: 15rpx;
		background-color: #f5f5f5;
		border-radius: 8rpx;
	}

	.permission-enabled {
		color: #52c41a;
		font-weight: 500;
	}

	.permission-disabled {
		color: #ff3b30;
		font-weight: 500;
	}

	.battery-level {
		font-size: 32rpx;
		font-weight: bold;
	}

	.charging {
		color: #52c41a;
		font-weight: 500;
	}
</style>
