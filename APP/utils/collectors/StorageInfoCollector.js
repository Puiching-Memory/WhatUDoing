/**
 * 存储信息收集器
 */
import { BaseCollector } from './BaseCollector.js'

export class StorageInfoCollector extends BaseCollector {
	constructor() {
		super('storageInfo')
	}

	async collect() {
		return new Promise((resolve, reject) => {
			uni.getStorageInfo({
				success: (res) => {
					this.data = {
						keys: res.keys,
						currentSize: res.currentSize,
						limitSize: res.limitSize,
						timestamp: Date.now()
					}
					resolve(this.data)
				},
				fail: (err) => {
					reject(new Error(err.errMsg || '获取存储信息失败'))
				}
			})
		})
	}
}

