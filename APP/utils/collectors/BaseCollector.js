/**
 * 基础收集器类
 * 所有收集器模块的基类
 */
export class BaseCollector {
	constructor(name) {
		this.name = name
		this.data = null
	}

	/**
	 * 收集数据（子类必须实现）
	 * @returns {Promise<Object>} 收集到的数据
	 */
	async collect() {
		throw new Error('collect() 方法必须在子类中实现')
	}

	/**
	 * 获取收集到的数据
	 * @returns {Object|null} 收集到的数据
	 */
	getData() {
		return this.data
	}

	/**
	 * 清空数据
	 */
	clear() {
		this.data = null
	}

	/**
	 * 创建超时Promise
	 * @param {number} timeout 超时时间（毫秒）
	 * @param {string} message 超时错误消息
	 * @returns {Promise} 超时Promise
	 */
	createTimeoutPromise(timeout, message) {
		return new Promise((_, reject) => {
			setTimeout(() => reject(new Error(message)), timeout)
		})
	}
}

