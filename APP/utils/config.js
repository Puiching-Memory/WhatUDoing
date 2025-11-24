/**
 * 应用配置
 */
export default {
	// 服务器地址
	serverUrl: 'http://10.228.98.116:8000',
	
	// 数据发送间隔（毫秒）
	// 默认5分钟 = 5 * 60 * 1000
	sendInterval: 5 * 60 * 1000,
	
	// 是否在应用隐藏时继续发送
	keepSendingWhenHidden: false
}

