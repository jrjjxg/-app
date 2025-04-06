<script>
export default {
	onLaunch: function () {
		console.log('App Launch')
		// 预加载背景图片
		this.preloadBackgroundImage()
	},
	onShow: function () {
		console.log('App Show')
	},
	onHide: function () {
		console.log('App Hide')
	},
	methods: {
		preloadBackgroundImage() {
			try {
				const savedBackground = uni.getStorageSync('userBackgroundImage')
				if (savedBackground) {
					// 检查图片是否仍然存在
					uni.getFileInfo({
						filePath: savedBackground,
						success: () => {
							console.log('背景图片加载成功')
						},
						fail: (err) => {
							console.error('背景图片不存在，重置为默认图片', err)
							// 如果图片不存在，重置为默认图片
							uni.setStorageSync('userBackgroundImage', '/static/images/calm-bg.jpg')
						}
					})
				}
			} catch (e) {
				console.error('预加载背景图片失败', e)
			}
		}
	}
}
</script>

<style lang="scss">
@import 'tailwindcss/base';
@import 'tailwindcss/utilities';
</style>
