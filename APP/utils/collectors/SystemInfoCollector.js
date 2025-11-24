/**
 * 系统信息收集器
 */
import { BaseCollector } from './BaseCollector.js'

export class SystemInfoCollector extends BaseCollector {
	constructor() {
		super('systemInfo')
	}

	async collect() {
		return new Promise((resolve, reject) => {
			uni.getSystemInfo({
				success: (res) => {
					this.data = {
						platform: res.platform,
						system: res.system,
						timezone: res.timezone,
						timezoneOffset: res.timezoneOffset,
						fontSizeSetting: res.fontSizeSetting,
						SDKVersion: res.SDKVersion,
						swanNativeVersion: res.swanNativeVersion,
						hostSDKVersion: res.hostSDKVersion,
						timestamp: Date.now()
					}
					resolve(this.data)
				},
				fail: (err) => {
					reject(new Error(err.errMsg || '获取系统信息失败'))
				}
			})
		})
	}
}

