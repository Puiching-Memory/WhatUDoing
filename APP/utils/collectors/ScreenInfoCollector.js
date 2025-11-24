/**
 * 屏幕信息收集器
 */
import { BaseCollector } from './BaseCollector.js'

export class ScreenInfoCollector extends BaseCollector {
	constructor() {
		super('screenInfo')
	}

	async collect() {
		return new Promise((resolve, reject) => {
			uni.getSystemInfo({
				success: (res) => {
					this.data = {
						screenWidth: res.screenWidth,
						screenHeight: res.screenHeight,
						windowWidth: res.windowWidth,
						windowHeight: res.windowHeight,
						pixelRatio: res.pixelRatio,
						safeArea: res.safeArea,
						safeAreaInsets: res.safeAreaInsets,
						statusBarHeight: res.statusBarHeight,
						navigationBarHeight: res.navigationBarHeight,
						windowTop: res.windowTop,
						windowBottom: res.windowBottom,
						timestamp: Date.now()
					}
					resolve(this.data)
				},
				fail: (err) => {
					reject(new Error(err.errMsg || '获取屏幕信息失败'))
				}
			})
		})
	}
}

