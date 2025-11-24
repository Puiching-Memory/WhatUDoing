/**
 * 应用信息收集器
 */
import { BaseCollector } from './BaseCollector.js'

export class AppInfoCollector extends BaseCollector {
	constructor() {
		super('appInfo')
	}

	async collect() {
		return new Promise((resolve, reject) => {
			uni.getSystemInfo({
				success: (res) => {
					const appInfo = {
						appName: res.appName,
						appVersion: res.appVersion,
						appVersionCode: res.appVersionCode,
						appLanguage: res.appLanguage,
						uniVersion: res.uniVersion,
						uniCompileVersion: res.uniCompileVersion,
						timestamp: Date.now()
					}
					
					// #ifdef APP-PLUS
					if (typeof plus !== 'undefined' && plus.runtime) {
						try {
							appInfo.appid = plus.runtime.appid
							appInfo.version = plus.runtime.version
							appInfo.versionCode = plus.runtime.versionCode
							appInfo.name = plus.runtime.name
							appInfo.launcher = plus.runtime.launcher
							appInfo.origin = plus.runtime.origin
						} catch (e) {
							// 静默失败
						}
					}
					// #endif
					
					this.data = appInfo
					resolve(this.data)
				},
				fail: (err) => {
					reject(new Error(err.errMsg || '获取应用信息失败'))
				}
			})
		})
	}
}

