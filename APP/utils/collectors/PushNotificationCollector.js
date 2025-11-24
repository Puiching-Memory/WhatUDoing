/**
 * 推送通知信息收集器
 */
import { BaseCollector } from './BaseCollector.js'

export class PushNotificationCollector extends BaseCollector {
	constructor() {
		super('pushNotification')
	}

	async collect() {
		const pushInfo = {
			timestamp: Date.now()
		}

		try {
			// 获取推送客户端ID（如果支持）
			if (typeof uni !== 'undefined' && typeof uni.getPushClientId === 'function') {
				try {
					const clientIdRes = await new Promise((resolve, reject) => {
						uni.getPushClientId({
							success: (res) => resolve(res),
							fail: (err) => reject(err)
						})
					})
					pushInfo.clientId = clientIdRes.cid || null
					pushInfo.token = clientIdRes.token || null
				} catch (error) {
					console.warn('获取推送客户端ID失败:', error)
				}
			}

			// 5+ App 推送信息增强
			this._enhanceByPlus(pushInfo)

			// 检查推送权限状态
			await this._checkPushPermission(pushInfo)

			this.data = pushInfo
			return this.data
		} catch (error) {
			console.error('收集推送信息失败:', error)
			this.data = {
				...pushInfo,
				error: error.message || '收集推送信息失败'
			}
			return this.data
		}
	}

	_enhanceByPlus(pushInfo) {
		// #ifdef APP-PLUS
		if (typeof plus !== 'undefined' && plus.push) {
			try {
				// 获取推送服务信息
				const pushService = plus.push.getClientInfo()
				if (pushService) {
					pushInfo.pushService = {
						clientid: pushService.clientid || null,
						appid: pushService.appid || null,
						token: pushService.token || null
					}
				}

				// 获取所有推送消息（最近的消息）
				const messages = plus.push.getAllMessage()
				if (messages && Array.isArray(messages)) {
					pushInfo.recentMessages = {
						count: messages.length,
						latestMessage: messages.length > 0 ? {
							title: messages[messages.length - 1].title || null,
							content: messages[messages.length - 1].content || null,
							payload: messages[messages.length - 1].payload || null,
							timestamp: messages[messages.length - 1].timestamp || null
						} : null
					}
				}

				// 检查推送通道状态
				if (typeof plus.push.getChannelInfo === 'function') {
					try {
						const channelInfo = plus.push.getChannelInfo()
						pushInfo.channelInfo = {
							id: channelInfo.id || null,
							name: channelInfo.name || null,
							description: channelInfo.description || null,
							sound: channelInfo.sound || null,
							vibrate: channelInfo.vibrate || null
						}
					} catch (e) {
						// 静默失败
					}
				}
			} catch (e) {
				console.warn('增强推送信息失败:', e)
			}
		}
		// #endif
	}

	async _checkPushPermission(pushInfo) {
		// #ifdef APP-PLUS
		if (typeof plus !== 'undefined' && plus.android) {
			try {
				// Android 检查通知权限
				const main = plus.android.runtimeMainActivity()
				const pkName = main.getPackageName()
				const NotificationManagerCompat = plus.android.importClass('androidx.core.app.NotificationManagerCompat')
				const context = plus.android.importClass('android.content.Context')
				const notificationManager = NotificationManagerCompat.from(main)
				
				const areNotificationsEnabled = notificationManager.areNotificationsEnabled()
				pushInfo.permission = {
					enabled: areNotificationsEnabled,
					platform: 'android'
				}
			} catch (e) {
				// 如果无法检查权限，尝试其他方式
				try {
					// iOS 或其他平台
					pushInfo.permission = {
						enabled: null,
						platform: 'unknown',
						note: '无法检测推送权限状态'
					}
				} catch (e2) {
					// 静默失败
				}
			}
		} else {
			// 非5+ App环境，使用uni API
			if (typeof uni !== 'undefined' && typeof uni.getSetting === 'function') {
				try {
					const settingRes = await new Promise((resolve, reject) => {
						uni.getSetting({
							success: (res) => resolve(res),
							fail: (err) => reject(err)
						})
					})
					
					// 检查通知权限
					if (settingRes.authSetting) {
						pushInfo.permission = {
							notification: settingRes.authSetting['scope.notification'] || null,
							platform: 'uni-app'
						}
					}
				} catch (e) {
					// 静默失败
				}
			}
		}
		// #endif

		// #ifndef APP-PLUS
		// 非App环境，标记为不支持
		pushInfo.permission = {
			enabled: null,
			platform: 'web',
			note: 'Web环境不支持推送通知'
		}
		// #endif
	}
}

