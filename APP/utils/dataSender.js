/**
 * 数据发送工具
 * 负责将收集的数据发送到服务器
 */
import dataCollector from './dataCollector.js'
import config from './config.js'

class DataSender {
	constructor() {
		// 服务器地址，从配置文件读取
		this.serverUrl = config.serverUrl
		// 发送间隔（毫秒），从配置文件读取
		this.interval = config.sendInterval
		// 定时器ID
		this.timerId = null
		// 是否正在发送
		this.isSending = false
		// 设备ID
		this.deviceId = null
		// 初始化设备ID
		this.initDeviceId()
	}

	/**
	 * 初始化设备ID
	 */
	initDeviceId() {
		try {
			// 尝试从本地存储获取设备ID
			this.deviceId = uni.getStorageSync('device_id')
			
			if (!this.deviceId) {
				// 如果没有，生成一个新的设备ID
				this.deviceId = this.generateDeviceId()
				// 保存到本地存储
				uni.setStorageSync('device_id', this.deviceId)
			}
		} catch (error) {
			console.error('初始化设备ID失败:', error)
			// 如果获取失败，生成一个临时ID
			this.deviceId = this.generateDeviceId()
		}
	}

	/**
	 * 生成设备ID
	 */
	generateDeviceId() {
		// 使用时间戳和随机数生成唯一ID
		const timestamp = Date.now()
		const random = Math.random().toString(36).substring(2, 15)
		return `device_${timestamp}_${random}`
	}

	/**
	 * 设置服务器地址
	 * @param {string} url 服务器地址
	 */
	setServerUrl(url) {
		this.serverUrl = url
	}

	/**
	 * 设置发送间隔
	 * @param {number} interval 间隔时间（毫秒）
	 */
	setInterval(interval) {
		this.interval = interval
		// 如果定时器正在运行，重新启动
		if (this.timerId) {
			this.stop()
			this.start()
		}
	}

	/**
	 * 发送数据到服务器
	 * @param {object} data 要发送的数据
	 * @returns {Promise<object>} 发送结果
	 */
	async sendData(data) {
		if (this.isSending) {
			console.warn('正在发送数据，跳过本次发送')
			return { success: false, message: '正在发送中' }
		}

		this.isSending = true

		try {
			const url = `${this.serverUrl}/api/submit`
			
			const response = await uni.request({
				url: url,
				method: 'POST',
				header: {
					'Content-Type': 'application/json'
				},
				data: {
					device_id: this.deviceId,
					timestamp: data.timestamp || Date.now(),
					data: data
				},
				timeout: 10000 // 10秒超时
			})

			if (response.statusCode === 200) {
				console.log('数据发送成功:', response.data)
				return { success: true, data: response.data }
			} else {
				console.error('数据发送失败:', response.statusCode, response.data)
				return { success: false, message: `服务器返回错误: ${response.statusCode}` }
			}
		} catch (error) {
			console.error('发送数据时出错:', error)
			return { 
				success: false, 
				message: error.errMsg || error.message || '网络错误' 
			}
		} finally {
			this.isSending = false
		}
	}

	/**
	 * 收集并发送数据
	 */
	async collectAndSend() {
		try {
			console.log('开始收集数据...')
			// 收集所有数据
			const collectedData = await dataCollector.collectAll()
			
			console.log('数据收集完成，开始发送...')
			// 发送数据
			const result = await this.sendData(collectedData)
			
			if (result.success) {
				console.log('数据发送成功')
			} else {
				console.error('数据发送失败:', result.message)
			}
			
			return result
		} catch (error) {
			console.error('收集并发送数据时出错:', error)
			return { success: false, message: error.message }
		}
	}

	/**
	 * 启动定时发送
	 */
	start() {
		if (this.timerId) {
			console.warn('定时发送已经启动')
			return
		}

		console.log(`启动定时发送，间隔: ${this.interval / 1000}秒`)
		
		// 立即执行一次
		this.collectAndSend()
		
		// 设置定时器
		this.timerId = setInterval(() => {
			this.collectAndSend()
		}, this.interval)
	}

	/**
	 * 停止定时发送
	 */
	stop() {
		if (this.timerId) {
			clearInterval(this.timerId)
			this.timerId = null
			console.log('定时发送已停止')
		}
	}

	/**
	 * 手动触发一次收集和发送
	 */
	async trigger() {
		return await this.collectAndSend()
	}

	/**
	 * 获取设备ID
	 */
	getDeviceId() {
		return this.deviceId
	}

	/**
	 * 检查服务器连接
	 */
	async checkConnection() {
		try {
			const url = `${this.serverUrl}/health`
			const response = await uni.request({
				url: url,
				method: 'GET',
				timeout: 5000
			})
			
			return response.statusCode === 200
		} catch (error) {
			console.error('检查服务器连接失败:', error)
			return false
		}
	}
}

export default new DataSender()

