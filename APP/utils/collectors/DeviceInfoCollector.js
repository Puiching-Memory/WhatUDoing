/**
 * 设备信息收集器
 */
import { BaseCollector } from './BaseCollector.js'

export class DeviceInfoCollector extends BaseCollector {
	constructor() {
		super('deviceInfo')
	}

	async collect() {
		return new Promise((resolve, reject) => {
			uni.getSystemInfo({
				success: (res) => {
					this.data = {
						brand: res.brand || res.deviceBrand,
						model: res.model || res.deviceModel,
						system: res.system,
						platform: res.platform,
						deviceId: res.deviceId,
						deviceBrand: res.deviceBrand,
						deviceModel: res.deviceModel,
						osName: res.osName,
						osVersion: res.osVersion,
						osLanguage: res.osLanguage,
						osTheme: res.osTheme,
						romName: res.romName,
						romVersion: res.romVersion,
						timestamp: Date.now()
					}
					resolve(this.data)
				},
				fail: (err) => {
					reject(new Error(err.errMsg || '获取设备信息失败'))
				}
			})
		})
	}
}

