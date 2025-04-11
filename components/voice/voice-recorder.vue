<!-- 语音录制组件 -->
<template>
  <view class="voice-recorder">
    <!-- 录音状态显示 -->
    <view class="status-container">
      <view v-if="!isRecording && !hasRecording" class="status-text">点击按钮开始录音</view>
      <view v-if="isRecording" class="status-recording">
        <view class="recording-wave"></view>
        <text>录音中: {{ formatTime(recordingTime) }}</text>
      </view>
      <view v-if="hasRecording && !isRecording" class="status-recorded">
        <text>录音时长: {{ formatTime(recordingDuration) }}</text>
      </view>
    </view>
    
    <!-- 录音控制按钮 -->
    <view class="controls">
      <view 
        v-if="!isRecording && !hasRecording" 
        class="record-btn"
        @tap="startRecording">
        <uni-icons type="mic" size="24" color="#FFF"></uni-icons>
      </view>
      
      <view v-if="isRecording" class="action-btns">
        <view class="cancel-btn" @tap="cancelRecording">
          <uni-icons type="close" size="20" color="#FFF"></uni-icons>
        </view>
        <view class="stop-btn" @tap="stopRecording">
          <uni-icons type="checkbox" size="20" color="#FFF"></uni-icons>
        </view>
      </view>
      
      <view v-if="hasRecording && !isRecording" class="action-btns">
        <view class="play-btn" @tap="playRecording">
          <uni-icons :type="isPlaying ? 'pause' : 'play-right'" size="20" color="#FFF"></uni-icons>
        </view>
        <view class="delete-btn" @tap="deleteRecording">
          <uni-icons type="trash" size="20" color="#FFF"></uni-icons>
        </view>
        <view class="use-btn" @tap="useRecording">
          <uni-icons type="checkbox" size="20" color="#FFF"></uni-icons>
        </view>
      </view>
    </view>
    
    <!-- 分析结果 -->
    <view v-if="analysis && !isAnalyzing" class="analysis-result">
      <view class="result-header">
        <text class="result-title">语音分析结果</text>
      </view>
      <view class="transcription">
        <text>{{ analysis.transcription || '正在处理文本...' }}</text>
      </view>
      <view v-if="analysis.dominantEmotion" class="emotion">
        <text class="emotion-label">情绪类型:</text>
        <text :class="'emotion-value ' + getEmotionClass(analysis.dominantEmotion)">
          {{ getEmotionText(analysis.dominantEmotion) }}
        </text>
      </view>
      
      <view v-if="analysis.audioEvents && hasAudioEvents" class="audio-events">
        <text class="events-label">检测到的音频事件:</text>
        <view class="events-list">
          <view v-for="(count, event) in analysis.audioEvents" :key="event" v-if="count > 0" class="event-item">
            <text>{{ getEventText(event) }} ({{ count }})</text>
          </view>
        </view>
      </view>
      
      <!-- 应用按钮 -->
      <view class="apply-btn" @tap="applyResult">
        <text>应用结果</text>
      </view>
    </view>
    
    <!-- 加载提示 -->
    <view v-if="isAnalyzing" class="loading-container">
      <view class="loading-spinner"></view>
      <text>{{ analyzeStage === 'uploading' ? '上传录音中...' : '分析情绪中...' }}</text>
    </view>
  </view>
</template>

<script>
import { uploadAndAnalyzeVoice, getVoiceAnalysisResult, uploadAudioFile } from '@/api/voice';

let recorderManager = null;
let innerAudioContext = null;
let checkResultTimer = null;
// H5环境下的录音相关变量
let mediaRecorder = null;
let audioChunks = [];
let audioStream = null;

export default {
  name: 'VoiceRecorder',
  props: {
    // 关联的日记ID (如果有)
    journalId: {
      type: String,
      default: ''
    },
    // 关联的情绪记录ID (如果有)
    moodId: {
      type: String,
      default: ''
    },
    // 语言设置
    language: {
      type: String,
      default: 'zh'
    }
  },
  data() {
    return {
      isRecording: false,        // 是否正在录音
      hasRecording: false,       // 是否有录音
      isPlaying: false,          // 是否正在播放
      isAnalyzing: false,        // 是否正在分析
      analyzeStage: '',          // 分析阶段：uploading或analyzing
      recordingTime: 0,          // 录音计时（秒）
      recordingDuration: 0,      // 录音总时长（秒）
      recordingPath: '',         // 录音文件路径
      recordingTimer: null,      // 录音计时器
      analysis: null,            // 分析结果
      taskId: '',                // 任务ID
      audioBlob: null,           // H5环境下的音频Blob对象
    };
  },
  computed: {
    // 判断是否有音频事件
    hasAudioEvents() {
      if (!this.analysis || !this.analysis.audioEvents) return false;
      return Object.values(this.analysis.audioEvents).some(count => count > 0);
    }
  },
  mounted() {
    // #ifdef APP-PLUS || MP-WEIXIN || MP-QQ || MP-TOUTIAO
    this.initRecorder();
    // #endif
    
    // #ifdef H5
    this.initH5Recorder();
    // #endif
  },
  beforeDestroy() {
    this.clearRecordingTimer();
    if (checkResultTimer) {
      clearInterval(checkResultTimer);
      checkResultTimer = null;
    }
    if (innerAudioContext) {
      innerAudioContext.destroy();
    }
    
    // 释放H5录音资源
    this.releaseH5Resources();
  },
  methods: {
    // H5环境下初始化录音
    initH5Recorder() {
      // 创建音频上下文用于播放
      innerAudioContext = uni.createInnerAudioContext();
      if (innerAudioContext) {
        innerAudioContext.onPlay(() => {
          console.log('开始播放');
          this.isPlaying = true;
        });
        
        innerAudioContext.onEnded(() => {
          console.log('播放结束');
          this.isPlaying = false;
        });
        
        innerAudioContext.onError((err) => {
          console.error('播放错误', err);
          this.isPlaying = false;
        });
      }
    },
    
    // 释放H5录音资源
    releaseH5Resources() {
      // #ifdef H5
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
        audioStream = null;
      }
      mediaRecorder = null;
      audioChunks = [];
      // #endif
    },
    
    // 初始化录音管理器
    initRecorder() {
      try {
        // 检查平台兼容性
        // #ifdef APP-PLUS || MP-WEIXIN || MP-QQ || MP-TOUTIAO
        if (typeof uni.getRecorderManager !== 'function') {
          console.error('当前环境不支持录音功能');
          return;
        }
        
        recorderManager = uni.getRecorderManager();
        
        if (!recorderManager) {
          console.error('初始化录音管理器失败');
          return;
        }
        
        recorderManager.onStart(() => {
          console.log('录音开始');
          this.isRecording = true;
          this.startRecordingTimer();
        });
        
        recorderManager.onStop((res) => {
          console.log('录音结束', res);
          this.isRecording = false;
          this.clearRecordingTimer();
          
          if (res.tempFilePath) {
            this.recordingPath = res.tempFilePath;
            this.recordingDuration = Math.ceil(res.duration / 1000);
            this.hasRecording = true;
          }
        });
        
        recorderManager.onError((err) => {
          console.error('录音错误', err);
          uni.showToast({
            title: '录音失败: ' + (err.errMsg || '未知错误'),
            icon: 'none'
          });
          this.isRecording = false;
          this.clearRecordingTimer();
        });
        
        // 初始化音频播放器
        innerAudioContext = uni.createInnerAudioContext();
        if (innerAudioContext) {
          innerAudioContext.onPlay(() => {
            console.log('开始播放');
            this.isPlaying = true;
          });
          
          innerAudioContext.onEnded(() => {
            console.log('播放结束');
            this.isPlaying = false;
          });
          
          innerAudioContext.onError((err) => {
            console.error('播放错误', err);
            this.isPlaying = false;
          });
        }
        // #endif
      } catch (error) {
        console.error('初始化录音管理器异常', error);
        uni.showToast({
          title: '录音功能初始化失败',
          icon: 'none'
        });
      }
    },
    
    // 开始录音
    startRecording() {
      if (this.isRecording) return;
      
      // H5环境使用MediaRecorder API
      // #ifdef H5
      this.startH5Recording();
      return;
      // #endif
      
      // 其他环境使用uni API
      // #ifndef H5
      // 确保recorderManager已正确初始化
      if (!recorderManager) {
        this.initRecorder();
        
        // 如果初始化后仍然为null，显示错误提示
        if (!recorderManager) {
          uni.showToast({
            title: '设备不支持录音功能',
            icon: 'none'
          });
          return;
        }
      }
      
      const options = {
        duration: 60000, // 最长60秒
        sampleRate: 16000, // 采样率
        numberOfChannels: 1, // 录音通道数
        encodeBitRate: 96000, // 编码码率
        format: 'mp3', // 音频格式
        frameSize: 50 // 指定帧大小
      };
      
      recorderManager.start(options);
      // #endif
    },
    
    // H5环境下的录音实现
    startH5Recording() {
      // #ifdef H5
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        uni.showToast({
          title: '您的浏览器不支持录音功能',
          icon: 'none'
        });
        return;
      }
      
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          audioStream = stream;
          audioChunks = [];
          
          // 尝试使用更兼容的设置
          const options = {
            mimeType: 'audio/webm;codecs=opus'
          };
          
          try {
            mediaRecorder = new MediaRecorder(stream, options);
          } catch (err) {
            // 如果不支持webm格式，尝试其他格式
            console.warn('MediaRecorder with webm不支持, 尝试其他格式:', err);
            
            try {
              options.mimeType = 'audio/ogg; codecs=opus';
              mediaRecorder = new MediaRecorder(stream, options);
            } catch (err) {
              console.warn('MediaRecorder with ogg不支持, 尝试其他格式:', err);
              
              try {
                options.mimeType = 'audio/mp4';
                mediaRecorder = new MediaRecorder(stream, options);
              } catch (err) {
                console.warn('MediaRecorder with mp4不支持, 使用默认格式:', err);
                mediaRecorder = new MediaRecorder(stream);
              }
            }
          }
          
          mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              audioChunks.push(e.data);
            }
          };
          
          mediaRecorder.onstop = () => {
            // 获取实际使用的MIME类型
            const mimeType = mediaRecorder.mimeType || 'audio/webm';
            this.audioBlob = new Blob(audioChunks, { type: mimeType });
            
            // 创建临时URL来访问音频
            this.recordingPath = URL.createObjectURL(this.audioBlob);
            console.log('录音完成，创建Blob URL:', this.recordingPath);
            
            this.hasRecording = true;
            this.isRecording = false;
            this.recordingDuration = Math.ceil(this.recordingTime);
            this.clearRecordingTimer();
          };
          
          mediaRecorder.onerror = (e) => {
            console.error('MediaRecorder 错误', e);
            uni.showToast({
              title: '录音失败',
              icon: 'none'
            });
            this.isRecording = false;
            this.clearRecordingTimer();
            this.releaseH5Resources();
          };
          
          // 每秒收集一次数据
          mediaRecorder.start(1000);
          this.isRecording = true;
          this.startRecordingTimer();
        })
        .catch(err => {
          console.error('获取麦克风权限失败', err);
          uni.showToast({
            title: '无法访问麦克风',
            icon: 'none'
          });
        });
      // #endif
    },
    
    // 停止录音
    stopRecording() {
      if (!this.isRecording) return;
      
      // H5环境下
      // #ifdef H5
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        
        // 停止所有音轨
        if (audioStream) {
          audioStream.getTracks().forEach(track => track.stop());
        }
      }
      return;
      // #endif
      
      // 其他环境
      // #ifndef H5
      if (!recorderManager) return;
      recorderManager.stop();
      // #endif
    },
    
    // 取消录音
    cancelRecording() {
      if (!this.isRecording) return;
      
      // H5环境下
      // #ifdef H5
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        
        // 停止所有音轨
        if (audioStream) {
          audioStream.getTracks().forEach(track => track.stop());
        }
      }
      this.hasRecording = false;
      this.recordingPath = '';
      this.audioBlob = null;
      return;
      // #endif
      
      // 其他环境
      // #ifndef H5
      if (!recorderManager) return;
      recorderManager.stop();
      this.hasRecording = false;
      this.recordingPath = '';
      // #endif
    },
    
    // 播放录音
    playRecording() {
      if (!this.hasRecording || !this.recordingPath) return;
      
      if (this.isPlaying) {
        if (innerAudioContext) {
          innerAudioContext.stop();
        }
        this.isPlaying = false;
        return;
      }
      
      if (innerAudioContext) {
        innerAudioContext.src = this.recordingPath;
        innerAudioContext.play();
      }
    },
    
    // 删除录音
    deleteRecording() {
      if (this.isPlaying && innerAudioContext) {
        innerAudioContext.stop();
      }
      
      this.hasRecording = false;
      this.recordingPath = '';
      this.audioBlob = null;
      this.analysis = null;
      
      // 释放H5资源
      // #ifdef H5
      if (this.recordingPath && this.recordingPath.startsWith('blob:')) {
        URL.revokeObjectURL(this.recordingPath);
      }
      // #endif
    },
    
    // 使用录音（上传并分析）
    async useRecording() {
      if (!this.hasRecording) return;
      
      this.isAnalyzing = true;
      this.analyzeStage = 'uploading';
      
      try {
        // H5环境下，使用原生XMLHttpRequest确保multipart格式正确
        // #ifdef H5
        if (this.audioBlob) {
          console.log('准备上传H5录音', this.audioBlob);
          
          // 获取MIME类型并确定文件扩展名
          const mimeType = this.audioBlob.type || 'audio/webm';
          let fileExt = 'webm';
          
          if (mimeType.includes('mp4')) {
            fileExt = 'mp4';
          } else if (mimeType.includes('ogg')) {
            fileExt = 'ogg';
          } else if (mimeType.includes('mp3')) {
            fileExt = 'mp3';
          }
          
          // 创建文件对象
          const file = new File([this.audioBlob], `recording.${fileExt}`, { type: mimeType });
          
          try {
            // 直接使用原生XMLHttpRequest一步上传并分析
            const token = uni.getStorageSync('token');
            
            // 创建FormData
            const formData = new FormData();
            // 这是关键 - 确保file参数名与后端匹配
            formData.append('file', file); 
            formData.append('languageCode', this.language || 'zh');
            if (this.journalId) formData.append('journalId', this.journalId);
            if (this.moodId) formData.append('moodId', this.moodId);
            
            // 使用XMLHttpRequest直接发送multipart请求
            const result = await new Promise((resolve, reject) => {
              const xhr = new XMLHttpRequest();
              xhr.open('POST', 'http://localhost:9000/api/voice/analyze', true);
              
              // 不要手动设置Content-Type，让浏览器自动添加boundary
              if (token) {
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
              }
              
              xhr.onload = function() {
                if (xhr.status >= 200 && xhr.status < 300) {
                  try {
                    const response = JSON.parse(xhr.responseText);
                    resolve(response);
                  } catch (e) {
                    reject(new Error('响应解析失败'));
                  }
                } else {
                  reject(new Error(`HTTP请求失败: ${xhr.status}`));
                }
              };
              
              xhr.onerror = function() {
                reject(new Error('网络请求失败'));
              };
              
              xhr.upload.onprogress = function(e) {
                if (e.lengthComputable) {
                  const percentComplete = Math.round((e.loaded / e.total) * 100);
                  console.log(`上传进度: ${percentComplete}%`);
                }
              };
              
              // 发送请求
              xhr.send(formData);
            });
            
            if (result.code === 200 && result.data) {
              this.taskId = result.data.taskId;
              this.analyzeStage = 'analyzing';
              this.startPollingResult();
            } else {
              throw new Error(result.message || '分析请求失败');
            }
          } catch (error) {
            console.error('文件上传或分析失败', error);
            throw error;
          }
        } else {
          throw new Error('录音数据无效');
        }
        // #endif
        
        // 非H5环境下，直接使用uni.uploadFile确保multipart格式
        // #ifndef H5
        // 使用uni.uploadFile可以正确处理文件上传的multipart格式
        uni.uploadFile({
          url: 'http://localhost:9000/api/voice/analyze',
          filePath: this.recordingPath,
          name: 'file', // 确保参数名与后端匹配
          formData: {
            languageCode: this.language || 'zh',
            journalId: this.journalId || '',
            moodId: this.moodId || ''
          },
          header: {
            'Authorization': `Bearer ${uni.getStorageSync('token')}`
          },
          success: (uploadRes) => {
            try {
              const result = JSON.parse(uploadRes.data);
              if (result.code === 200 && result.data) {
                this.taskId = result.data.taskId;
                this.analyzeStage = 'analyzing';
                this.startPollingResult();
              } else {
                uni.showToast({
                  title: result.message || '上传失败',
                  icon: 'none'
                });
                this.isAnalyzing = false;
              }
            } catch (error) {
              console.error('解析上传结果失败', error);
              uni.showToast({
                title: '上传结果解析失败',
                icon: 'none'
              });
              this.isAnalyzing = false;
            }
          },
          fail: (err) => {
            console.error('上传请求失败', err);
            uni.showToast({
              title: '上传失败: ' + (err.errMsg || '未知错误'),
              icon: 'none'
            });
            this.isAnalyzing = false;
          }
        });
        // #endif
      } catch (error) {
        console.error('上传分析失败', error);
        uni.showToast({
          title: '上传分析失败: ' + (error.message || '未知错误'),
          icon: 'none'
        });
        this.isAnalyzing = false;
      }
    },
    
    // 开始轮询获取分析结果
    startPollingResult() {
      if (checkResultTimer) {
        clearInterval(checkResultTimer);
      }
      
      // 添加轮询计数和最大尝试次数
      let pollingCount = 0;
      const maxPollingAttempts = 30; // 最多尝试30次，约60秒
      
      checkResultTimer = setInterval(async () => {
        try {
          // 增加轮询计数
          pollingCount++;
          console.log(`轮询分析结果第 ${pollingCount}/${maxPollingAttempts} 次`);
          
          // 如果超过最大尝试次数，停止轮询
          if (pollingCount > maxPollingAttempts) {
            console.warn('轮询超过最大次数，停止轮询');
            clearInterval(checkResultTimer);
            checkResultTimer = null;
            this.isAnalyzing = false;
            
            uni.showToast({
              title: '分析超时，请稍后查看结果',
              icon: 'none'
            });
            return;
          }
          
          let response;
          // #ifdef H5
          // 在H5环境中使用XMLHttpRequest获取结果
          const token = uni.getStorageSync('token');
          response = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', `http://localhost:9000/api/voice/result/${this.taskId}`, true);
            
            if (token) {
              xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            }
            
            xhr.onload = function() {
              if (xhr.status >= 200 && xhr.status < 300) {
                try {
                  const response = JSON.parse(xhr.responseText);
                  resolve(response);
                } catch (e) {
                  reject(new Error('响应解析失败'));
                }
              } else {
                reject(new Error(`HTTP请求失败: ${xhr.status}`));
              }
            };
            
            xhr.onerror = function() {
              reject(new Error('网络请求失败'));
            };
            
            xhr.send();
          });
          // #endif
          
          // #ifndef H5
          // 使用getVoiceAnalysisResult API获取分析结果
          response = await getVoiceAnalysisResult(this.taskId);
          // #endif
          
          if (response.code === 200 && response.data) {
            // 根据taskStatus判断任务是否完成，而不是检查transcription字段
            if (response.data.taskStatus === 'SUCCEEDED') {
              this.analysis = response.data;
              this.isAnalyzing = false;
              
              // 清除定时器
              clearInterval(checkResultTimer);
              checkResultTimer = null;
              
              // 分析完成，可以应用结果
              this.$emit('analysis-complete', this.analysis);
            } else if (response.data.taskStatus === 'FAILED') {
              // 任务失败
              clearInterval(checkResultTimer);
              checkResultTimer = null;
              this.isAnalyzing = false;
              
              uni.showToast({
                title: '语音分析失败，请重试',
                icon: 'none'
              });
            } else if (response.data.taskStatus === 'RUNNING') {
              // 任务正在运行，显示提示
              if (pollingCount === 5) {  // 只在第5次轮询时提示，避免频繁提示
                uni.showToast({
                  title: '语音正在分析中...',
                  icon: 'none'
                });
              }
            }
          }
        } catch (error) {
          console.error('获取分析结果失败', error);
          
          // 出错后也增加计数，如果连续失败超过一定次数，也停止轮询
          if (pollingCount > 5) {  // 连续失败5次后停止
            clearInterval(checkResultTimer);
            checkResultTimer = null;
            this.isAnalyzing = false;
            
            uni.showToast({
              title: '获取分析结果失败',
              icon: 'none'
            });
          }
        }
      }, 2000); // 每2秒查询一次
    },
    
    // 开始录音计时器
    startRecordingTimer() {
      this.recordingTime = 0;
      this.recordingTimer = setInterval(() => {
        this.recordingTime++;
        
        // 超过60秒自动停止
        if (this.recordingTime >= 60) {
          this.stopRecording();
        }
      }, 1000);
    },
    
    // 清除录音计时器
    clearRecordingTimer() {
      if (this.recordingTimer) {
        clearInterval(this.recordingTimer);
        this.recordingTimer = null;
      }
    },
    
    // 格式化时间
    formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },
    
    // 获取情绪CSS类
    getEmotionClass(emotion) {
      const classMap = {
        'HAPPY': 'happy',
        'SAD': 'sad',
        'ANGRY': 'angry',
        'NEUTRAL': 'neutral'
      };
      return classMap[emotion] || 'neutral';
    },
    
    // 获取情绪文本描述
    getEmotionText(emotion) {
      const emotionMap = {
        'HAPPY': '高兴',
        'SAD': '伤心',
        'ANGRY': '生气',
        'NEUTRAL': '中性'
      };
      return emotionMap[emotion] || emotion;
    },
    
    // 获取事件文本描述
    getEventText(event) {
      const eventMap = {
        'Applause': '掌声',
        'BGM': '背景音乐',
        'Laughter': '笑声',
        'Speech': '说话声'
      };
      return eventMap[event] || event;
    },
    
    // 应用分析结果
    applyResult() {
      if (!this.analysis) return;
      
      // 将分析结果传递给父组件
      this.$emit('recording-result', this.analysis);
    }
  }
};
</script>

<style>
.voice-recorder {
  width: 100%;
  padding: 10px 0;
}

.status-container {
  text-align: center;
  margin-bottom: 20px;
}

.status-text {
  font-size: 14px;
  color: #666;
}

.status-recording {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.recording-wave {
  width: 16px;
  height: 16px;
  background-color: #f56c6c;
  border-radius: 50%;
  margin-right: 8px;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.8);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(0.8);
    opacity: 0.8;
  }
}

.status-recorded {
  font-size: 14px;
  color: #666;
}

.controls {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.record-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff4757, #ff6b81);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(255, 71, 87, 0.3);
}

.action-btns {
  display: flex;
  align-items: center;
  gap: 20px;
}

.cancel-btn, .delete-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff4757, #ff6b81);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stop-btn, .use-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2ed573, #7bed9f);
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1e90ff, #70a1ff);
  display: flex;
  align-items: center;
  justify-content: center;
}

.analysis-result {
  margin-top: 20px;
  padding: 15px;
  border-radius: 10px;
  background-color: #f8f9fa;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.result-header {
  margin-bottom: 10px;
}

.result-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.transcription {
  margin-bottom: 10px;
  line-height: 1.5;
}

.emotion {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.emotion-label, .events-label {
  margin-right: 8px;
  color: #666;
}

.emotion-value {
  font-weight: 500;
}

.emotion-value.happy {
  color: #2ed573;
}

.emotion-value.sad {
  color: #ff6b81;
}

.emotion-value.angry {
  color: #ff4757;
}

.emotion-value.neutral {
  color: #747d8c;
}

.audio-events {
  margin-top: 8px;
}

.events-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 5px;
}

.event-item {
  background-color: #edf2f7;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  margin-bottom: 10px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 应用按钮样式 */
.apply-btn {
  margin-top: 16px;
  padding: 10px 0;
  background-color: #4CAF50;
  color: white;
  border-radius: 8px;
  text-align: center;
  font-size: 16px;
}

.apply-btn:active {
  background-color: #3e8e41;
}
</style> 