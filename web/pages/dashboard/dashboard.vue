<template>
	<view class="dashboard">
		<!-- 头部 -->
		<view class="header">
			<text class="title">📊 WhatUDoing 数据大屏</text>
			<view class="header-info">
				<text class="time">{{ currentTime }}</text>
				<text class="update-time" v-if="latestData?.created_at">
					上次更新：{{ formatUpdateTime(latestData.created_at) }}
				</text>
			</view>
		</view>

		<!-- 错误提示 -->
		<view v-if="error" class="error">
			{{ error }}
		</view>

		<!-- 加载中 -->
		<view v-if="loading" class="loading">
			加载中...
		</view>

		<!-- 内容区域 -->
		<view v-else class="content-wrapper">
			<!-- 设备信息区域 -->
			<view class="device-info-grid">
				<!-- 设备信息 -->
				<view class="info-card">
					<text class="info-title">📱 设备信息</text>
					<view class="info-content">
						<view class="info-item" v-if="latestData?.data?.deviceInfo">
							<text class="info-label">品牌：</text>
							<text class="info-value">{{ latestData.data.deviceInfo.brand || latestData.data.deviceInfo.deviceBrand || 'N/A' }}</text>
						</view>
						<view class="info-item" v-if="latestData?.data?.deviceInfo">
							<text class="info-label">系统：</text>
							<text class="info-value">{{ latestData.data.deviceInfo.system || 'N/A' }}</text>
						</view>
						<view class="info-item" v-if="latestData?.data?.deviceInfo?.platform">
							<text class="info-label">平台：</text>
							<text class="info-value">{{ latestData.data.deviceInfo.platform }}</text>
						</view>
					</view>
				</view>

				<!-- 位置信息 -->
				<view class="info-card">
					<text class="info-title">📍 位置信息</text>
					<view class="info-content">
						<view class="info-item" v-if="latestData?.data?.location">
							<text class="info-label">纬度：</text>
							<text class="info-value">{{ latestData.data.location.latitude || 'N/A' }}</text>
						</view>
						<view class="info-item" v-if="latestData?.data?.location">
							<text class="info-label">经度：</text>
							<text class="info-value">{{ latestData.data.location.longitude || 'N/A' }}</text>
						</view>
						<view class="info-item" v-if="latestData?.data?.location?.accuracy">
							<text class="info-label">精度：</text>
							<text class="info-value">{{ latestData.data.location.accuracy }}m</text>
						</view>
					</view>
				</view>

				<!-- 地址信息 -->
				<view class="info-card">
					<text class="info-title">🏠 地址信息</text>
					<view class="info-content">
						<view class="info-item" v-if="latestData?.data?.location?.address">
							<text class="info-label">地址：</text>
							<text class="info-value address-value">
								{{ formatAddress(latestData.data.location.address) }}
							</text>
						</view>
						<view class="info-item" v-else>
							<text class="info-value">暂无地址信息</text>
						</view>
					</view>
				</view>

				<!-- 网络信息 -->
				<view class="info-card">
					<text class="info-title">🌐 网络信息</text>
					<view class="info-content">
						<view class="info-item" v-if="latestData?.data?.networkInfo">
							<text class="info-label">网络类型：</text>
							<text class="info-value">{{ latestData.data.networkInfo.networkType || 'N/A' }}</text>
						</view>
						<view class="info-item" v-if="latestData?.data?.networkInfo?.wifiInfo?.ssid">
							<text class="info-label">WiFi名称：</text>
							<text class="info-value">{{ latestData.data.networkInfo.wifiInfo.ssid }}</text>
						</view>
						<view class="info-item" v-if="latestData?.data?.networkInfo?.wifiInfo?.signalStrength !== undefined">
							<text class="info-label">信号强度：</text>
							<text class="info-value">{{ latestData.data.networkInfo.wifiInfo.signalStrength }} dBm</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 图表区域 -->
			<view class="charts-grid">
				<!-- 电量信息与趋势 -->
				<view class="chart-container battery-container">
					<text class="chart-title">🔋 电量信息</text>
					<!-- 电量信息摘要 -->
					<view class="battery-summary">
						<view class="battery-summary-item">
							<text class="battery-summary-label">当前电量：</text>
							<text class="battery-summary-value battery-value" :class="getBatteryClass(latestData?.data?.battery?.level)">
								{{ latestData?.data?.battery?.level !== undefined ? latestData.data.battery.level + '%' : 'N/A' }}
							</text>
						</view>
						<view class="battery-summary-item" v-if="latestData?.data?.battery?.isCharging !== undefined">
							<text class="battery-summary-label">状态：</text>
							<text class="battery-summary-value">{{ latestData.data.battery.isCharging ? '充电中' : '未充电' }}</text>
						</view>
						<view class="battery-bar" v-if="latestData?.data?.battery?.level !== undefined">
							<view class="battery-fill" :style="{ width: latestData.data.battery.level + '%' }"></view>
						</view>
					</view>
					<!-- 电量变化趋势图表 -->
					<view ref="batteryChart" id="battery-chart" class="chart battery-chart"></view>
				</view>

				<!-- 网络信号强度 -->
				<view class="chart-container">
					<text class="chart-title">📶 网络信号强度</text>
					<view ref="networkChart" id="network-chart" class="chart small"></view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	// #ifdef H5
	import * as echarts from 'echarts'
	// #endif
	import api from '../../utils/api.js'
	
	export default {
		data() {
			return {
				loading: true,
				error: null,
				currentTime: '',
				latestData: null,
				charts: {},
				refreshTimer: null,
				resizeHandler: null,
				resizeObservers: []
			}
		},
		onLoad() {
			this.updateTime()
			setInterval(() => this.updateTime(), 1000)
			// 动态加载 ECharts
			this.loadECharts().then(() => {
				// 延迟一下确保 DOM 渲染完成
				setTimeout(() => {
					this.loadData()
				}, 100)
			}).catch(err => {
				console.error('ECharts 加载失败:', err)
				this.error = 'ECharts 加载失败，请刷新页面重试'
			})
			// 每30秒自动刷新
			this.refreshTimer = setInterval(() => {
				if (!this.loading) {
					this.loadData()
				}
			}, 30000)
			
			// 设置窗口resize监听
			this.setupResizeHandler()
		},
		onReady() {
			// 页面渲染完成后，确保 ECharts 已加载
			// #ifdef H5
			if (window.echarts) {
				// 如果数据已加载，重新渲染图表
				if (this.latestData) {
					setTimeout(() => {
						this.renderAllCharts()
						// 确保图表大小正确
						this.resizeAllCharts()
					}, 200)
				}
			}
			// #endif
		},
		onUnload() {
			if (this.refreshTimer) {
				clearInterval(this.refreshTimer)
			}
			
			// 移除resize事件监听
			// #ifdef H5
			if (this.resizeHandler && typeof window !== 'undefined') {
				window.removeEventListener('resize', this.resizeHandler)
			}
			
			// 断开所有ResizeObserver
			this.resizeObservers.forEach(observer => {
				if (observer && observer.disconnect) {
					observer.disconnect()
				}
			})
			this.resizeObservers = []
			// #endif
			
			// 销毁图表
			Object.values(this.charts).forEach(chart => {
				if (chart && chart.dispose) {
					chart.dispose()
				}
			})
		},
		methods: {
			loadECharts() {
				return new Promise((resolve, reject) => {
					// #ifdef H5
					// H5 环境，使用本地安装的 ECharts
					if (echarts && echarts.init) {
						// 将 echarts 挂载到 window 上，方便其他方法使用
						window.echarts = echarts
						console.log('ECharts 已加载（本地依赖）')
						resolve()
					} else {
						reject(new Error('ECharts 未正确导入，请检查依赖安装'))
					}
					// #endif
					
					// #ifndef H5
					// 非 H5 环境，使用 uni-app 的方式
					// 这里可以提示用户或使用其他图表库
					console.warn('当前环境不支持 ECharts，请使用 H5 环境')
					resolve()
					// #endif
				})
			},
			updateTime() {
				const now = new Date()
				this.currentTime = now.toLocaleString('zh-CN')
			},
			async loadData() {
				this.loading = true
				this.error = null
				try {
					await Promise.all([
						this.loadLatestData(),
						this.loadBattery(),
						this.loadNetwork()
					])
				} catch (error) {
					this.error = '加载数据失败: ' + (error.message || '未知错误')
					console.error('加载数据失败:', error)
				} finally {
					this.loading = false
				}
			},
			async loadLatestData() {
				try {
					this.latestData = await api.getLatestData()
				} catch (error) {
					console.error('获取最新数据失败:', error)
				}
			},
			async loadBattery() {
				try {
					const data = await api.getBattery(24)
					if (data && data.points && Array.isArray(data.points)) {
						this.$nextTick(() => {
							this.renderBatteryChart(data)
						})
					} else {
						console.warn('电量数据格式错误:', data)
					}
				} catch (error) {
					console.error('获取电量数据失败:', error)
				}
			},
			async loadNetwork() {
				try {
					const data = await api.getNetwork(24)
					if (data && data.points && Array.isArray(data.points)) {
						this.$nextTick(() => {
							this.renderNetworkChart(data)
						})
					} else {
						console.warn('网络数据格式错误:', data)
					}
				} catch (error) {
					console.error('获取网络数据失败:', error)
				}
			},
			getChartDom(id, refName) {
				// #ifdef H5
				// 优先使用 ref 获取 DOM
				if (refName && this.$refs[refName]) {
					const refEl = this.$refs[refName]
					// ref 可能是数组，取第一个元素
					const el = Array.isArray(refEl) ? refEl[0] : refEl
					// 如果是 Vue 组件实例，获取其 $el
					return el.$el || el
				}
				// 回退到使用 id
				return document.getElementById(id)
				// #endif
				// #ifndef H5
				return null
				// #endif
			},
			renderBatteryChart(batteryData) {
				// #ifdef H5
				if (!window.echarts || !window.echarts.init) return
				
				// 验证数据
				if (!batteryData || !batteryData.points || !Array.isArray(batteryData.points)) {
					console.warn('电量数据无效:', batteryData)
					return
				}
				
				const points = batteryData.points
				if (points.length === 0) {
					console.warn('电量数据为空')
					return
				}
				
				this.$nextTick(() => {
					setTimeout(() => {
						const chartDom = this.getChartDom('battery-chart', 'batteryChart')
						if (!chartDom) return
						
						try {
							if (!this.charts.battery) {
								this.charts.battery = window.echarts.init(chartDom)
							}
							
							// 格式化时间标签
							const formatTime = (timeStr) => {
								if (!timeStr) return ''
								const date = new Date(timeStr)
								const hours = date.getHours().toString().padStart(2, '0')
								const minutes = date.getMinutes().toString().padStart(2, '0')
								return `${hours}:${minutes}`
							}
							
							// 准备数据
							const times = points.map(p => formatTime(p.time))
							const levels = points.map(p => p.level || 0)
							const isCharging = points.map(p => p.isCharging || false)
							
							// 根据电量值设置颜色：0%红色，100%绿色
							const getBatteryColor = (level) => {
								// 将电量从0-100映射到0-1
								const ratio = Math.max(0, Math.min(1, level / 100))
								
								// 从红色(255,107,107)渐变到绿色(107,207,127)
								const r = Math.round(255 - (255 - 107) * ratio)
								const g = Math.round(107 + (207 - 107) * ratio)
								const b = Math.round(107 + (127 - 107) * ratio)
								
								return `rgb(${r}, ${g}, ${b})`
							}
							
							const option = {
								backgroundColor: 'transparent',
								textStyle: { color: '#fff', fontSize: 10 },
								tooltip: {
									trigger: 'axis',
									textStyle: { fontSize: 10 },
									formatter: (params) => {
										const param = params[0]
										const index = param.dataIndex
										const point = points[index]
										const charging = point && point.isCharging ? '充电中' : '未充电'
										return `${param.name}<br/>电量: ${param.value}%<br/>状态: ${charging}`
									}
								},
								grid: { left: '8%', right: '5%', bottom: '10%', top: '10%' },
								xAxis: {
									type: 'category',
									data: times,
									axisLabel: { 
										color: '#fff', 
										fontSize: 9,
										rotate: 45,
										interval: Math.floor(times.length / 10)  // 显示部分标签，避免重叠
									},
									axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.3)' } }
								},
								yAxis: {
									type: 'value',
									min: 0,
									max: 100,
									axisLabel: { color: '#fff', fontSize: 9 },
									axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.3)' } },
									splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } }
								},
								series: [{
									name: '电量',
									type: 'line',
									data: levels.map((level, index) => ({
										value: level,
										itemStyle: {
											color: getBatteryColor(level)
										}
									})),
									smooth: true,
									symbol: 'circle',
									symbolSize: 4,
									lineStyle: {
										width: 2,
										color: {
											type: 'linear',
											x: 0, y: 0, x2: 1, y2: 0,
											colorStops: [
												{ offset: 0, color: '#ff6b6b' },  // 0%红色
												{ offset: 1, color: '#6bcf7f' }   // 100%绿色
											]
										}
									},
									areaStyle: {
										color: {
											type: 'linear',
											x: 0, y: 0, x2: 0, y2: 1,
											colorStops: [
												{ offset: 0, color: 'rgba(255, 107, 107, 0.3)' },  // 0%红色
												{ offset: 1, color: 'rgba(107, 207, 127, 0.1)' }   // 100%绿色
											]
										}
									}
								}]
							}
							
							this.charts.battery.setOption(option)
							
							// 延迟调整大小，确保图表完全初始化
							setTimeout(() => {
								if (this.charts.battery && typeof this.charts.battery.resize === 'function') {
									try {
										// 检查图表是否已被销毁
										if (this.charts.battery.isDisposed && this.charts.battery.isDisposed()) {
											return
										}
										// 确保图表已完全初始化后再调用 resize
										const chartDom = this.getChartDom('battery-chart', 'batteryChart')
										if (chartDom && chartDom.offsetWidth > 0 && chartDom.offsetHeight > 0) {
											// 检查图表是否已设置 option（通过 getOption 方法）
											let option = null
											try {
												option = this.charts.battery.getOption ? this.charts.battery.getOption() : null
											} catch (e) {
												// getOption 可能抛出错误，忽略
											}
											if (option) {
												this.charts.battery.resize()
											}
										}
									} catch (error) {
										// 静默处理，避免频繁报错
										// console.warn('初始化电量图表大小失败:', error)
									}
								}
								// 设置ResizeObserver（如果还未设置）
								this.setupResizeObservers()
							}, 200)
						} catch (error) {
							console.error('渲染电量图表失败:', error)
						}
					}, 100)
				})
				// #endif
			},
			renderNetworkChart(networkData) {
				// #ifdef H5
				if (!window.echarts || !window.echarts.init) return
				
				// 验证数据
				if (!networkData || !networkData.points || !Array.isArray(networkData.points)) {
					console.warn('网络数据无效:', networkData)
					return
				}
				
				const points = networkData.points
				if (points.length === 0) {
					console.warn('网络信号数据为空')
					return
				}
				
				this.$nextTick(() => {
					setTimeout(() => {
						const chartDom = this.getChartDom('network-chart', 'networkChart')
						if (!chartDom) return
						
						try {
							if (!this.charts.network) {
								this.charts.network = window.echarts.init(chartDom)
							}
							
							// 格式化时间标签
							const formatTime = (timeStr) => {
								if (!timeStr) return ''
								const date = new Date(timeStr)
								const hours = date.getHours().toString().padStart(2, '0')
								const minutes = date.getMinutes().toString().padStart(2, '0')
								return `${hours}:${minutes}`
							}
							
							// 准备数据
							const times = points.map(p => formatTime(p.time))
							const signalStrengths = points.map(p => p.signalStrength || 0)
							
							// 根据信号强度设置颜色（信号强度通常是负数，越接近0越好）
							const getSignalColor = (strength) => {
								// 信号强度范围通常是 -100 到 0 dBm
								// -50 以上：优秀（绿色）
								// -70 到 -50：良好（黄色）
								// -70 以下：较差（红色）
								if (strength >= -50) return '#6bcf7f'  // 绿色
								if (strength >= -70) return '#ffd93d'  // 黄色
								return '#ff6b6b'  // 红色
							}
							
							const option = {
								backgroundColor: 'transparent',
								textStyle: { color: '#fff', fontSize: 10 },
								tooltip: {
									trigger: 'axis',
									textStyle: { fontSize: 10 },
									formatter: (params) => {
										const param = params[0]
										const index = param.dataIndex
										const point = points[index]
										const ssid = point && point.ssid ? point.ssid : 'N/A'
										return `${param.name}<br/>信号强度: ${param.value} dBm<br/>WiFi: ${ssid}`
									}
								},
								grid: { left: '8%', right: '5%', bottom: '10%', top: '10%' },
								xAxis: {
									type: 'category',
									data: times,
									axisLabel: { 
										color: '#fff', 
										fontSize: 9,
										rotate: 45,
										interval: Math.floor(times.length / 10)  // 显示部分标签，避免重叠
									},
									axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.3)' } }
								},
								yAxis: {
									type: 'value',
									name: '信号强度 (dBm)',
									nameTextStyle: { color: '#fff', fontSize: 9 },
									axisLabel: { color: '#fff', fontSize: 9 },
									axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.3)' } },
									splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } },
									// 信号强度通常是负数，范围 -100 到 0
									min: -100,
									max: 0
								},
								series: [{
									name: '信号强度',
									type: 'line',
									data: signalStrengths.map((strength, index) => ({
										value: strength,
										itemStyle: {
											color: getSignalColor(strength)
										}
									})),
									smooth: true,
									symbol: 'circle',
									symbolSize: 4,
									lineStyle: {
										width: 2,
										color: {
											type: 'linear',
											x: 0, y: 0, x2: 1, y2: 0,
											colorStops: [
												{ offset: 0, color: '#6bcf7f' },  // 绿色（强信号）
												{ offset: 0.5, color: '#ffd93d' },  // 黄色（中等）
												{ offset: 1, color: '#ff6b6b' }  // 红色（弱信号）
											]
										}
									},
									areaStyle: {
										color: {
											type: 'linear',
											x: 0, y: 0, x2: 0, y2: 1,
											colorStops: [
												{ offset: 0, color: 'rgba(107, 207, 127, 0.3)' },
												{ offset: 0.5, color: 'rgba(255, 217, 61, 0.2)' },
												{ offset: 1, color: 'rgba(255, 107, 107, 0.1)' }
											]
										}
									}
								}]
							}
							
							this.charts.network.setOption(option)
							
							// 延迟调整大小，确保图表完全初始化
							setTimeout(() => {
								if (this.charts.network && typeof this.charts.network.resize === 'function') {
									try {
										// 检查图表是否已被销毁
										if (this.charts.network.isDisposed && this.charts.network.isDisposed()) {
											return
										}
										// 确保图表已完全初始化后再调用 resize
										const chartDom = this.getChartDom('network-chart', 'networkChart')
										if (chartDom && chartDom.offsetWidth > 0 && chartDom.offsetHeight > 0) {
											// 检查图表是否已设置 option（通过 getOption 方法）
											let option = null
											try {
												option = this.charts.network.getOption ? this.charts.network.getOption() : null
											} catch (e) {
												// getOption 可能抛出错误，忽略
											}
											if (option) {
												this.charts.network.resize()
											}
										}
									} catch (error) {
										// 静默处理，避免频繁报错
										// console.warn('初始化网络图表大小失败:', error)
									}
								}
								// 设置ResizeObserver（如果还未设置）
								this.setupResizeObservers()
							}, 200)
						} catch (error) {
							console.error('渲染网络图表失败:', error)
						}
					}, 100)
				})
				// #endif
			},
			renderAllCharts() {
				// 重新渲染所有图表（用于页面 ready 后）
				// #ifdef H5
				if (!window.echarts || !window.echarts.init) return
				
				// 这里可以存储数据，然后重新渲染
				// 由于数据可能还未加载，这个方法主要用于确保图表容器存在时重新渲染
				// #endif
			},
			getBatteryClass(level) {
				if (level === undefined || level === null) return ''
				if (level <= 20) return 'battery-low'
				if (level <= 50) return 'battery-medium'
				return 'battery-high'
			},
			formatAddress(address) {
				if (!address || typeof address !== 'object') return 'N/A'
				const parts = []
				if (address.country) parts.push(address.country)
				if (address.province) parts.push(address.province)
				if (address.city) parts.push(address.city)
				if (address.district) parts.push(address.district)
				if (address.street) parts.push(address.street)
				if (address.streetNum) parts.push(address.streetNum)
				return parts.length > 0 ? parts.join(' ') : 'N/A'
			},
			formatUpdateTime(timeStr) {
				if (!timeStr) return 'N/A'
				try {
					const updateTime = new Date(timeStr)
					const now = new Date()
					const diff = now - updateTime
					
					// 计算时间差（秒）
					const seconds = Math.floor(diff / 1000)
					
					if (seconds < 60) {
						return `${seconds}秒前`
					}
					
					// 计算时间差（分钟）
					const minutes = Math.floor(seconds / 60)
					if (minutes < 60) {
						return `${minutes}分钟前`
					}
					
					// 计算时间差（小时）
					const hours = Math.floor(minutes / 60)
					if (hours < 24) {
						return `${hours}小时前`
					}
					
					// 计算时间差（天）
					const days = Math.floor(hours / 24)
					if (days < 7) {
						return `${days}天前`
					}
					
					// 超过7天，显示完整日期时间
					return updateTime.toLocaleString('zh-CN', {
						year: 'numeric',
						month: '2-digit',
						day: '2-digit',
						hour: '2-digit',
						minute: '2-digit'
					})
				} catch (error) {
					console.error('格式化更新时间失败:', error)
					return 'N/A'
				}
			},
			setupResizeHandler() {
				// #ifdef H5
				if (typeof window === 'undefined') return
				
				// 创建防抖的resize处理函数
				let resizeTimer = null
				this.resizeHandler = () => {
					if (resizeTimer) {
						clearTimeout(resizeTimer)
					}
					resizeTimer = setTimeout(() => {
						this.resizeAllCharts()
					}, 100) // 防抖延迟100ms
				}
				
				// 添加窗口resize监听
				window.addEventListener('resize', this.resizeHandler)
				
				// 使用ResizeObserver监听图表容器大小变化
				this.setupResizeObservers()
				// #endif
			},
			setupResizeObservers() {
				// #ifdef H5
				if (typeof ResizeObserver === 'undefined') {
					console.warn('ResizeObserver不支持，使用window resize事件')
					return
				}
				
				// 为每个图表容器设置ResizeObserver
				this.$nextTick(() => {
					// 电量图表容器
					const batteryChartDom = this.getChartDom('battery-chart', 'batteryChart')
					if (batteryChartDom && this.charts.battery && !this.resizeObservers.find(obs => obs.target === batteryChartDom)) {
						const batteryObserver = new ResizeObserver(() => {
							if (this.charts.battery && typeof this.charts.battery.resize === 'function') {
								try {
									// 检查容器是否仍然存在且有有效尺寸
									if (batteryChartDom && batteryChartDom.parentNode && 
										batteryChartDom.offsetWidth > 0 && batteryChartDom.offsetHeight > 0) {
										// 检查图表是否已被销毁
										if (this.charts.battery.isDisposed && this.charts.battery.isDisposed()) {
											return
										}
										// 检查图表是否已设置 option
										let option = null
										try {
											option = this.charts.battery.getOption ? this.charts.battery.getOption() : null
										} catch (e) {
											// getOption 可能抛出错误，忽略
											return
										}
										if (option) {
											this.charts.battery.resize()
										}
									}
								} catch (error) {
									// 静默处理错误，避免频繁报错
									// console.warn('调整电量图表大小失败:', error)
								}
							}
						})
						batteryObserver.observe(batteryChartDom)
						this.resizeObservers.push(batteryObserver)
					}
					
					// 网络图表容器
					const networkChartDom = this.getChartDom('network-chart', 'networkChart')
					if (networkChartDom && this.charts.network && !this.resizeObservers.find(obs => obs.target === networkChartDom)) {
						const networkObserver = new ResizeObserver(() => {
							if (this.charts.network && typeof this.charts.network.resize === 'function') {
								try {
									// 检查容器是否仍然存在且有有效尺寸
									if (networkChartDom && networkChartDom.parentNode && 
										networkChartDom.offsetWidth > 0 && networkChartDom.offsetHeight > 0) {
										// 检查图表是否已被销毁
										if (this.charts.network.isDisposed && this.charts.network.isDisposed()) {
											return
										}
										// 检查图表是否已设置 option
										let option = null
										try {
											option = this.charts.network.getOption ? this.charts.network.getOption() : null
										} catch (e) {
											// getOption 可能抛出错误，忽略
											return
										}
										if (option) {
											this.charts.network.resize()
										}
									}
								} catch (error) {
									// 静默处理错误，避免频繁报错
									// console.warn('调整网络图表大小失败:', error)
								}
							}
						})
						networkObserver.observe(networkChartDom)
						this.resizeObservers.push(networkObserver)
					}
				})
				// #endif
			},
			resizeAllCharts() {
				// #ifdef H5
				Object.keys(this.charts).forEach(key => {
					const chart = this.charts[key]
					if (chart && typeof chart.resize === 'function') {
						try {
							// 检查图表是否已被销毁
							if (chart.isDisposed && chart.isDisposed()) {
								return
							}
							// 检查图表是否已初始化且容器存在
							const chartDom = chart.getDom ? chart.getDom() : null
							if (chartDom && chartDom.offsetWidth > 0 && chartDom.offsetHeight > 0) {
								// 检查图表是否已设置 option
								let option = null
								try {
									option = chart.getOption ? chart.getOption() : null
								} catch (e) {
									// getOption 可能抛出错误，忽略
									return
								}
								if (option) {
									chart.resize()
								}
							}
						} catch (error) {
							// 如果检查失败，静默处理，避免频繁报错
							// console.warn(`调整图表 ${key} 大小失败:`, error)
						}
					}
				})
				// #endif
			},
		}
	}
</script>

<style scoped>
	.dashboard {
		height: 100vh;
		overflow: hidden;
		padding: 10px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		display: flex;
		flex-direction: column;
	}

	.header {
		text-align: center;
		margin-bottom: 8px;
		padding: 8px 15px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		backdrop-filter: blur(10px);
		flex-shrink: 0;
	}

	.title {
		display: block;
		font-size: 1.5em;
		margin-bottom: 8px;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
		color: #fff;
		font-weight: bold;
	}

	.header-info {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 16px;
		flex-wrap: wrap;
	}

	.time {
		display: block;
		font-size: 0.9em;
		opacity: 0.9;
		color: #fff;
	}

	.update-time {
		display: block;
		font-size: 0.85em;
		opacity: 0.8;
		color: #fff;
		padding: 4px 8px;
		background: rgba(255, 255, 255, 0.15);
		border-radius: 4px;
	}

	.device-info-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 8px;
		margin-bottom: 8px;
		flex-shrink: 0;
	}

	.info-card {
		background: rgba(255, 255, 255, 0.15);
		backdrop-filter: blur(10px);
		border-radius: 8px;
		padding: 10px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		display: flex;
		flex-direction: column;
	}

	.info-title {
		display: block;
		font-size: 0.9em;
		font-weight: bold;
		color: #fff;
		margin-bottom: 8px;
		padding-bottom: 6px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
	}

	.info-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.info-item {
		display: flex;
		align-items: flex-start;
		font-size: 0.8em;
	}

	.info-label {
		color: rgba(255, 255, 255, 0.7);
		margin-right: 6px;
		flex-shrink: 0;
	}

	.info-value {
		color: #fff;
		flex: 1;
		word-break: break-all;
	}

	.address-value {
		line-height: 1.4;
	}

	.battery-value {
		font-weight: bold;
		font-size: 1.1em;
	}

	.battery-value.battery-low {
		color: #ff6b6b;
	}

	.battery-value.battery-medium {
		color: #ffd93d;
	}

	.battery-value.battery-high {
		color: #6bcf7f;
	}

	.battery-bar {
		width: 100%;
		height: 8px;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 4px;
		overflow: hidden;
		margin-top: 4px;
	}

	.battery-fill {
		height: 100%;
		background: linear-gradient(90deg, #6bcf7f 0%, #ffd93d 50%, #ff6b6b 100%);
		transition: width 0.3s;
	}

	.content-wrapper {
		flex: 1;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		min-height: 0;
	}

	.charts-grid {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 8px;
		flex: 1;
		overflow: hidden;
	}

	.chart-container {
		background: rgba(255, 255, 255, 0.15);
		backdrop-filter: blur(10px);
		border-radius: 8px;
		padding: 8px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.battery-container {
		grid-column: span 1;
	}

	.battery-summary {
		padding: 8px;
		margin-bottom: 8px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 6px;
		flex-shrink: 0;
	}

	.battery-summary-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 6px;
		font-size: 0.85em;
	}

	.battery-summary-item:last-of-type {
		margin-bottom: 0;
	}

	.battery-summary-label {
		color: rgba(255, 255, 255, 0.7);
	}

	.battery-summary-value {
		color: #fff;
		font-weight: bold;
	}

	.battery-chart {
		flex: 1;
		min-height: 200px;
	}

	.chart-title {
		display: block;
		margin-bottom: 4px;
		font-size: 0.85em;
		text-align: center;
		color: #fff;
		font-weight: bold;
		flex-shrink: 0;
	}

	.chart {
		width: 100%;
		flex: 1;
		min-height: 0;
	}

	.chart.small {
		flex: 1;
		min-height: 0;
	}

	.loading {
		text-align: center;
		padding: 20px;
		font-size: 1em;
		color: #fff;
	}

	.error {
		background: rgba(255, 0, 0, 0.2);
		border: 1px solid rgba(255, 0, 0, 0.5);
		border-radius: 8px;
		padding: 8px;
		margin: 8px;
		text-align: center;
		color: #fff;
		font-size: 0.85em;
	}

	/* 移动端适配 */
	@media (max-width: 1200px) {
		.charts-grid {
			grid-template-columns: repeat(1, 1fr);
		}
	}

	@media (max-width: 768px) {
		.dashboard {
			padding: 5px;
		}
		
		.device-info-grid {
			grid-template-columns: repeat(2, 1fr);
		}
		
		.charts-grid {
			grid-template-columns: 1fr;
		}
		
		.header {
			padding: 5px 10px;
		}
		
		.title {
			font-size: 1.2em;
		}
	}
</style>

