/**
 * 前台APP信息收集器
 */
import { BaseCollector } from './BaseCollector.js'

export class ForegroundAppCollector extends BaseCollector {
	constructor() {
		super('foregroundApp')
	}

	async collect() {
		const timeoutPromise = this.createTimeoutPromise(5000, '收集前台APP信息超时（5秒）')
		
		const collectPromise = new Promise((resolve, reject) => {
			// #ifdef APP-PLUS-ANDROID
			this._collectAndroid(resolve, reject)
			// #endif
			
			// #ifdef APP-PLUS-IOS
			this._collectIOS(resolve, reject)
			// #endif
			
			// #ifndef APP-PLUS
			this.data = {
				packageName: 'N/A',
				className: 'N/A',
				timestamp: Date.now(),
				note: '当前平台不支持获取前台APP信息'
			}
			resolve(this.data)
			// #endif
		})
		
		return Promise.race([collectPromise, timeoutPromise])
	}

	_collectAndroid(resolve, reject) {
		if (typeof plus === 'undefined' || !plus.android) {
			reject(new Error('Android API不可用'))
			return
		}

		try {
			const main = plus.android.runtimeMainActivity()
			const UsageStatsManager = plus.android.importClass('android.app.usage.UsageStatsManager')
			const System = plus.android.importClass('android.os.System')
			const Context = plus.android.importClass('android.content.Context')
			const context = main.getApplicationContext()
			const usm = context.getSystemService(Context.USAGE_STATS_SERVICE)
			
			if (!usm) {
				reject(new Error('无法获取UsageStatsManager服务，可能需要PACKAGE_USAGE_STATS权限'))
				return
			}
			
			const time = System.currentTimeMillis()
			const stats = usm.queryUsageStats(UsageStatsManager.INTERVAL_BEST, time - 1000 * 60, time)
			
			if (stats && stats.size() > 0) {
				let mostRecent = null
				let mostRecentTime = 0
				
				for (let i = 0; i < stats.size(); i++) {
					const stat = stats.get(i)
					if (stat.getLastTimeUsed() > mostRecentTime) {
						mostRecentTime = stat.getLastTimeUsed()
						mostRecent = stat
					}
				}
				
				if (mostRecent) {
					this.data = {
						packageName: mostRecent.getPackageName(),
						className: mostRecent.getClassName() || 'N/A',
						timestamp: Date.now()
					}
					resolve(this.data)
				} else {
					reject(new Error('无法从使用统计中找到最近的应用'))
				}
			} else {
				reject(new Error('使用统计为空，需要PACKAGE_USAGE_STATS权限'))
			}
		} catch (error) {
			reject(new Error(`获取前台APP失败: ${error.message || error}`))
		}
	}

	_collectIOS(resolve, reject) {
		if (typeof plus !== 'undefined' && plus.runtime) {
			this.data = {
				packageName: plus.runtime.appid,
				className: '当前应用',
				timestamp: Date.now(),
				note: 'iOS平台需要特殊权限才能获取其他应用信息'
			}
		} else {
			this.data = {
				packageName: 'N/A',
				className: 'N/A',
				timestamp: Date.now(),
				note: 'iOS平台不支持获取其他应用信息'
			}
		}
		resolve(this.data)
	}
}

