/**
 * 网络信息收集器
 */
import { BaseCollector } from './BaseCollector.js'

export class NetworkInfoCollector extends BaseCollector {
	constructor() {
		super('networkInfo')
	}

	async collect() {
		return new Promise((resolve, reject) => {
			uni.getNetworkType({
				success: async (res) => {
					const networkInfo = {
						networkType: res.networkType,
						timestamp: Date.now()
					}
					
					if (res.networkType === 'wifi') {
						await this._collectWifiInfo(networkInfo)
					}
					
					this._enhanceByPlus(networkInfo)
					
					this.data = networkInfo
					resolve(this.data)
				},
				fail: (err) => {
					reject(new Error(err.errMsg || '获取网络信息失败'))
				}
			})
		})
	}

	async _collectWifiInfo(networkInfo) {
		if (typeof uni !== 'undefined' && typeof uni.getConnectedWifi === 'function') {
			try {
				if (typeof uni.startWifi === 'function') {
					await new Promise((resolve) => {
						uni.startWifi({ success: () => resolve(), fail: () => resolve() })
					})
				}
				await new Promise((resolve) => {
					uni.getConnectedWifi({
						success: (wifiRes) => {
							networkInfo.wifiInfo = {
								ssid: wifiRes.wifi.SSID,
								bssid: wifiRes.wifi.BSSID,
								secure: wifiRes.wifi.secure,
								signalStrength: wifiRes.wifi.signalStrength,
								frequency: wifiRes.wifi.frequency
							}
							resolve()
						},
						fail: () => resolve()
					})
				})
			} catch (error) {
				// 静默失败
			}
		}
	}

	_enhanceByPlus(networkInfo) {
		// #ifdef APP-PLUS
		if (typeof plus !== 'undefined' && plus.networkinfo) {
			try {
				if (typeof plus.networkinfo.getCurrentType === 'function') {
					networkInfo.currentType = plus.networkinfo.getCurrentType()
				}
				if (typeof plus.networkinfo.isMetered === 'function') {
					networkInfo.isMetered = plus.networkinfo.isMetered()
				}
				
				if (!networkInfo.wifiInfo && typeof plus.networkinfo.getWifiInfo === 'function') {
					const wifiInfo = plus.networkinfo.getWifiInfo()
					if (wifiInfo) {
						networkInfo.wifiInfo = {
							ssid: wifiInfo.ssid,
							bssid: wifiInfo.bssid,
							secure: wifiInfo.secure,
							signalStrength: wifiInfo.signalStrength,
							frequency: wifiInfo.frequency
						}
					}
				}
			} catch (e) {
				// 静默失败
			}
		}
		// #endif
	}
}

