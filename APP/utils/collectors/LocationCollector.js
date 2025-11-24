/**
 * 位置信息收集器
 */
import { BaseCollector } from './BaseCollector.js'

export class LocationCollector extends BaseCollector {
	constructor() {
		super('location')
	}

	async collect() {
		const timeoutPromise = this.createTimeoutPromise(15000, '收集位置信息超时（15秒）')
		
		const collectPromise = new Promise((resolve, reject) => {
			uni.getLocation({
				type: 'gcj02',
				geocode: true,
				altitude: true,
				success: (res) => {
					this.data = {
						latitude: res.latitude,
						longitude: res.longitude,
						accuracy: res.accuracy,
						altitude: res.altitude,
						verticalAccuracy: res.verticalAccuracy,
						address: res.address,
						timestamp: Date.now()
					}
					resolve(this.data)
				},
				fail: (err) => {
					reject(new Error(err.errMsg || '获取位置信息失败'))
				}
			})
		})
		
		return Promise.race([collectPromise, timeoutPromise])
	}
}

