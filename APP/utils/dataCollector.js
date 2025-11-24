/**
 * 数据收集工具
 * 采用组合模式组织各个收集器模块
 */
import {
	BatteryCollector,
	LocationCollector,
	ForegroundAppCollector,
	DeviceInfoCollector,
	NetworkInfoCollector,
	StorageInfoCollector,
	AppInfoCollector,
	ScreenInfoCollector,
	SystemInfoCollector,
	AccelerometerCollector,
	PushNotificationCollector
} from './collectors/index.js'

class DataCollector {
	constructor() {
		// 组合各个收集器模块
		this.collectors = {
			battery: new BatteryCollector(),
			location: new LocationCollector(),
			foregroundApp: new ForegroundAppCollector(),
			deviceInfo: new DeviceInfoCollector(),
			networkInfo: new NetworkInfoCollector(),
			storageInfo: new StorageInfoCollector(),
			appInfo: new AppInfoCollector(),
			screenInfo: new ScreenInfoCollector(),
			systemInfo: new SystemInfoCollector(),
			accelerometer: new AccelerometerCollector(),
			pushNotification: new PushNotificationCollector()
		}
		
		// 数据存储
		this.data = {
			battery: null,
			location: null,
			foregroundApp: null,
			deviceInfo: null,
			networkInfo: null,
			storageInfo: null,
			appInfo: null,
			screenInfo: null,
			systemInfo: null,
			accelerometer: null,
			pushNotification: null,
			timestamp: null
		}
	}

	/**
	 * 收集电量信息
	 */
	async collectBattery() {
		const result = await this.collectors.battery.collect()
		this.data.battery = result
		return result
	}

	/**
	 * 收集位置信息
	 */
	async collectLocation() {
		const result = await this.collectors.location.collect()
		this.data.location = result
		return result
	}

	/**
	 * 收集前台APP信息
	 */
	async collectForegroundApp() {
		const result = await this.collectors.foregroundApp.collect()
		this.data.foregroundApp = result
		return result
	}

	/**
	 * 收集设备信息
	 */
	async collectDeviceInfo() {
		const result = await this.collectors.deviceInfo.collect()
		this.data.deviceInfo = result
		return result
	}

	/**
	 * 收集网络信息
	 */
	async collectNetworkInfo() {
		const result = await this.collectors.networkInfo.collect()
		this.data.networkInfo = result
		return result
	}

	/**
	 * 收集存储信息
	 */
	async collectStorageInfo() {
		const result = await this.collectors.storageInfo.collect()
		this.data.storageInfo = result
		return result
	}

	/**
	 * 收集应用信息
	 */
	async collectAppInfo() {
		const result = await this.collectors.appInfo.collect()
		this.data.appInfo = result
		return result
	}

	/**
	 * 收集屏幕信息
	 */
	async collectScreenInfo() {
		const result = await this.collectors.screenInfo.collect()
		this.data.screenInfo = result
		return result
	}

	/**
	 * 收集系统信息
	 */
	async collectSystemInfo() {
		const result = await this.collectors.systemInfo.collect()
		this.data.systemInfo = result
		return result
	}

	/**
	 * 收集加速度计信息
	 */
	async collectAccelerometer() {
		const result = await this.collectors.accelerometer.collect()
		this.data.accelerometer = result
		return result
	}

	/**
	 * 收集推送通知信息
	 */
	async collectPushNotification() {
		const result = await this.collectors.pushNotification.collect()
		this.data.pushNotification = result
		return result
	}

	/**
	 * 收集所有数据
	 */
	async collectAll() {
		this.data.timestamp = Date.now()
		
		try {
			const results = await Promise.allSettled([
				this.collectBattery(),
				this.collectLocation(),
				this.collectForegroundApp(),
				this.collectDeviceInfo(),
				this.collectNetworkInfo(),
				this.collectStorageInfo(),
				this.collectAppInfo(),
				this.collectScreenInfo(),
				this.collectSystemInfo(),
				this.collectAccelerometer(),
				this.collectPushNotification()
			])
			
			const collectedData = {
				battery: results[0].status === 'fulfilled' ? results[0].value : { error: results[0].reason?.message },
				location: results[1].status === 'fulfilled' ? results[1].value : { error: results[1].reason?.message },
				foregroundApp: results[2].status === 'fulfilled' ? results[2].value : { error: results[2].reason?.message },
				deviceInfo: results[3].status === 'fulfilled' ? results[3].value : { error: results[3].reason?.message },
				networkInfo: results[4].status === 'fulfilled' ? results[4].value : { error: results[4].reason?.message },
				storageInfo: results[5].status === 'fulfilled' ? results[5].value : { error: results[5].reason?.message },
				appInfo: results[6].status === 'fulfilled' ? results[6].value : { error: results[6].reason?.message },
				screenInfo: results[7].status === 'fulfilled' ? results[7].value : { error: results[7].reason?.message },
				systemInfo: results[8].status === 'fulfilled' ? results[8].value : { error: results[8].reason?.message },
				accelerometer: results[9].status === 'fulfilled' ? results[9].value : { error: results[9].reason?.message },
				pushNotification: results[10].status === 'fulfilled' ? results[10].value : { error: results[10].reason?.message },
				timestamp: this.data.timestamp
			}
			
			return collectedData
		} catch (error) {
			// 即使出错，也返回已收集到的数据
			const partialData = {
				battery: this.data.battery || { error: '收集失败' },
				location: this.data.location || { error: '收集失败' },
				foregroundApp: this.data.foregroundApp || { error: '收集失败' },
				deviceInfo: this.data.deviceInfo || { error: '收集失败' },
				networkInfo: this.data.networkInfo || { error: '收集失败' },
				storageInfo: this.data.storageInfo || { error: '收集失败' },
				appInfo: this.data.appInfo || { error: '收集失败' },
				screenInfo: this.data.screenInfo || { error: '收集失败' },
				systemInfo: this.data.systemInfo || { error: '收集失败' },
				accelerometer: this.data.accelerometer || { error: '收集失败' },
				pushNotification: this.data.pushNotification || { error: '收集失败' },
				timestamp: this.data.timestamp || Date.now()
			}
			
			return partialData
		}
	}

	/**
	 * 获取收集到的数据
	 */
	getData() {
		return this.data
	}

	/**
	 * 清空数据
	 */
	clear() {
		this.data = {
			battery: null,
			location: null,
			foregroundApp: null,
			deviceInfo: null,
			networkInfo: null,
			storageInfo: null,
			appInfo: null,
			screenInfo: null,
			systemInfo: null,
			accelerometer: null,
			pushNotification: null,
			timestamp: null
		}
		
		// 清空所有收集器的数据
		Object.values(this.collectors).forEach(collector => {
			collector.clear()
		})
	}

	/**
	 * 获取指定的收集器
	 * @param {string} name 收集器名称
	 * @returns {BaseCollector|null} 收集器实例
	 */
	getCollector(name) {
		return this.collectors[name] || null
	}

	/**
	 * 添加自定义收集器
	 * @param {string} name 收集器名称
	 * @param {BaseCollector} collector 收集器实例
	 */
	addCollector(name, collector) {
		this.collectors[name] = collector
		this.data[name] = null
	}
}

export default new DataCollector()
