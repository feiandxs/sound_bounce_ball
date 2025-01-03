module.exports = {
  webpack: {
    configure: {
      resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']  // 设置文件扩展名解析顺序
      }
    }
  }
} 