/**
 * API 调用工具类
 * 统一处理 API 请求、错误处理和响应解析
 */

class ApiClient {
	constructor(baseURL) {
		this.baseURL = baseURL || '/api'
	}

	/**
	 * 发送请求
	 * @param {string} url - 请求路径（相对于 baseURL）
	 * @param {object} options - 请求选项
	 * @returns {Promise<object>} 响应数据
	 */
	async request(url, options = {}) {
		const {
			method = 'GET',
			data = null,
			params = null,
			headers = {}
		} = options

		// 构建完整 URL
		let fullUrl = `${this.baseURL}${url}`
		
		// 添加查询参数
		if (params && method === 'GET') {
			const queryString = Object.keys(params)
				.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
				.join('&')
			if (queryString) {
				fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryString
			}
		}

		try {
			const requestOptions = {
				url: fullUrl,
				method: method,
				header: {
					'Content-Type': 'application/json',
					...headers
				}
			}

			// POST/PUT 请求添加 data
			if (data && (method === 'POST' || method === 'PUT')) {
				requestOptions.data = data
			}

			const res = await uni.request(requestOptions)

			// 检查状态码
			if (res.statusCode !== 200) {
				throw new Error(`请求失败: ${res.statusCode} ${res.errMsg || ''}`)
			}

			// 检查返回的是否是 HTML（可能是路由错误）
			if (typeof res.data === 'string' && res.data.startsWith('<!DOCTYPE')) {
				throw new Error(`API 返回了 HTML 页面，请检查 API 地址: ${fullUrl}`)
			}

			return res.data
		} catch (error) {
			console.error(`API 请求失败 [${method} ${fullUrl}]:`, error)
			throw error
		}
	}

	/**
	 * GET 请求
	 */
	async get(url, params = null) {
		return this.request(url, { method: 'GET', params })
	}

	/**
	 * POST 请求
	 */
	async post(url, data = null) {
		return this.request(url, { method: 'POST', data })
	}

	/**
	 * PUT 请求
	 */
	async put(url, data = null) {
		return this.request(url, { method: 'PUT', data })
	}

	/**
	 * DELETE 请求
	 */
	async delete(url) {
		return this.request(url, { method: 'DELETE' })
	}

	// ========== 数据大屏 API ==========

	/**
	 * 获取最新设备数据
	 * @param {string} deviceId - 设备ID（可选）
	 */
	async getLatestData(deviceId = null) {
		const params = deviceId ? { device_id: deviceId } : null
		return this.get('/dashboard/latest', params)
	}

	/**
	 * 获取数据概览
	 * @param {number} hours - 统计最近N小时（默认24）
	 */
	async getOverview(hours = 24) {
		return this.get('/dashboard/overview', { hours })
	}

	/**
	 * 获取时间序列数据
	 * @param {number} hours - 统计最近N小时（默认24）
	 * @param {string} interval - 时间间隔：'hour' 或 'day'（默认 'hour'）
	 */
	async getTimeline(hours = 24, interval = 'hour') {
		return this.get('/dashboard/timeline', { hours, interval })
	}

	/**
	 * 获取设备统计
	 * @param {number} limit - 返回前N个设备（默认10）
	 */
	async getDevices(limit = 10) {
		return this.get('/dashboard/devices', { limit })
	}

	/**
	 * 获取电量时间序列数据
	 * @param {number} hours - 统计最近N小时（默认24）
	 * @param {string} interval - 时间间隔：'hour' 或 'day'（默认 'hour'）
	 */
	async getBattery(hours = 24, interval = 'hour') {
		return this.get('/dashboard/battery', { hours, interval })
	}

	/**
	 * 获取位置统计
	 * @param {number} hours - 统计最近N小时（默认24）
	 */
	async getLocation(hours = 24) {
		return this.get('/dashboard/location', { hours })
	}

	/**
	 * 获取网络统计
	 * @param {number} hours - 统计最近N小时（默认24）
	 */
	async getNetwork(hours = 24) {
		return this.get('/dashboard/network', { hours })
	}

	/**
	 * 获取应用统计
	 * @param {number} hours - 统计最近N小时（默认24）
	 * @param {number} limit - 返回前N个应用（默认10）
	 */
	async getApps(hours = 24, limit = 10) {
		return this.get('/dashboard/apps', { hours, limit })
	}

	// ========== 数据 API ==========

	/**
	 * 提交数据
	 * @param {object} submission - 数据提交对象
	 */
	async submitData(submission) {
		return this.post('/submit', submission)
	}

	/**
	 * 查询数据
	 * @param {object} options - 查询选项
	 */
	async getData(options = {}) {
		const { device_id, limit = 100, offset = 0 } = options
		const params = { limit, offset }
		if (device_id) {
			params.device_id = device_id
		}
		return this.get('/data', params)
	}

	/**
	 * 根据ID获取数据
	 * @param {number} dataId - 数据ID
	 */
	async getDataById(dataId) {
		return this.get(`/data/${dataId}`)
	}

	/**
	 * 删除数据
	 * @param {number} dataId - 数据ID
	 */
	async deleteData(dataId) {
		return this.delete(`/data/${dataId}`)
	}

	/**
	 * 获取统计信息
	 */
	async getStats() {
		return this.get('/stats')
	}
}

// 创建默认实例
// 根据环境自动配置 API 地址
const getApiBase = () => {
	// #ifdef H5
	if (typeof window !== 'undefined') {
		// 开发环境：使用完整地址
		if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
			return 'http://10.228.98.116:8000/api'
		}
	}
	// #endif
	// 生产环境：使用相对路径
	return '/api'
}

export default new ApiClient(getApiBase())

