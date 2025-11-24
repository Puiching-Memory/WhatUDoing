/**
 * 电量信息收集器
 */
import { BaseCollector } from './BaseCollector.js'

export class BatteryCollector extends BaseCollector {
	constructor() {
		super('battery')
	}

	async collect() {
		const timeoutPromise = this.createTimeoutPromise(5000, '收集电量信息超时（5秒）')
		
		const collectPromise = new Promise((resolve, reject) => {
			if (typeof uni !== 'undefined' && typeof uni.getBatteryInfo === 'function') {
				uni.getBatteryInfo({
					success: (res) => {
						this.data = {
							level: res.level,
							isCharging: res.isCharging,
							timestamp: Date.now()
						}
						resolve(this.data)
					},
					fail: (err) => {
						this._collectByPlus(resolve, reject, err)
					}
				})
			} else {
				this._collectByPlus(resolve, reject, null)
			}
		})
		
		return Promise.race([collectPromise, timeoutPromise])
	}

	_collectByPlus(resolve, reject, previousError) {
		// #ifdef APP-PLUS
		if (typeof plus !== 'undefined' && plus.battery && typeof plus.battery.getCurrentBatteryInfo === 'function') {
			plus.battery.getCurrentBatteryInfo((info) => {
				this.data = {
					level: info.level,
					isCharging: info.isCharging,
					timestamp: Date.now()
				}
				resolve(this.data)
			}, (error) => {
				reject(new Error(`获取电量信息失败: ${previousError?.errMsg || error || '未知错误'}`))
			})
		} else {
			reject(new Error(`当前平台不支持获取电量信息: ${previousError?.errMsg || 'API不可用'}`))
		}
		// #endif
		
		// #ifndef APP-PLUS
		reject(new Error(`当前平台不支持获取电量信息: ${previousError?.errMsg || 'uni.getBatteryInfo不可用'}`))
		// #endif
	}
}

