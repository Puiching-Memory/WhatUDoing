/**
 * 加速度计信息收集器
 * 参考文档：https://uniapp.dcloud.net.cn/api/system/accelerometer.html
 */
import { BaseCollector } from './BaseCollector.js'

export class AccelerometerCollector extends BaseCollector {
	constructor() {
		super('accelerometer')
	}

	async collect() {
		const timeoutPromise = this.createTimeoutPromise(3000, '收集加速度计信息超时（3秒）')
		
		const collectPromise = new Promise((resolve, reject) => {
			if (typeof uni === 'undefined' || typeof uni.startAccelerometer !== 'function') {
				reject(new Error('加速度计API不可用'))
				return
			}
			
			let accelerometerData = null
			let listener = null
			
			// 监听加速度数据
			listener = (res) => {
				accelerometerData = {
					x: res.x,
					y: res.y,
					z: res.z,
					timestamp: Date.now()
				}
				this.data = accelerometerData
			}
			
			uni.onAccelerometerChange(listener)
			
			// 开始监听
			uni.startAccelerometer({
				interval: 'normal',
				success: () => {
					// 等待一段时间收集数据
					setTimeout(() => {
						// 停止监听
						uni.stopAccelerometer({
							success: () => {
								// 取消监听
								if (listener) {
									uni.offAccelerometerChange(listener)
								}
								
								if (accelerometerData) {
									resolve(accelerometerData)
								} else {
									reject(new Error('未获取到加速度数据'))
								}
							},
							fail: (err) => {
								if (listener) {
									uni.offAccelerometerChange(listener)
								}
								reject(new Error(err.errMsg || '停止加速度计失败'))
							}
						})
					}, 500) // 等待500ms收集数据
				},
				fail: (err) => {
					if (listener) {
						uni.offAccelerometerChange(listener)
					}
					reject(new Error(err.errMsg || '启动加速度计失败'))
				}
			})
		})
		
		return Promise.race([collectPromise, timeoutPromise]).catch((error) => {
			// 确保清理监听器
			if (typeof uni !== 'undefined' && typeof uni.offAccelerometerChange === 'function') {
				try {
					uni.offAccelerometerChange()
				} catch (e) {
					// 忽略清理错误
				}
			}
			if (typeof uni !== 'undefined' && typeof uni.stopAccelerometer === 'function') {
				try {
					uni.stopAccelerometer()
				} catch (e) {
					// 忽略清理错误
				}
			}
			throw error
		})
	}
}

