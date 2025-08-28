export const translations = {
  en: {
    title: 'Gemini Image Editor',
    promptPlaceholder: 'Describe your edit',
    uploadLabel: 'Upload image',
    editButton: 'Edit Image',
    downloadButton: 'Download',
    resultTitle: 'Result',
    payButton: 'Pay to use'
  },
  zh: {
    title: 'Gemini图像编辑器',
    promptPlaceholder: '描述你想要的编辑',
    uploadLabel: '上传图片',
    editButton: '编辑图片',
    downloadButton: '下载',
    resultTitle: '结果',
    payButton: '支付后使用'
  },
  ja: {
    title: 'Gemini画像エディタ',
    promptPlaceholder: '編集内容を入力してください',
    uploadLabel: '画像をアップロード',
    editButton: '画像を編集',
    downloadButton: 'ダウンロード',
    resultTitle: '結果',
    payButton: '支払いして使用'
  }
};

export function detectLocale() {
  const lang = navigator.language.toLowerCase();
  if (lang.startsWith('zh')) return 'zh';
  if (lang.startsWith('ja')) return 'ja';
  return 'en';
}
