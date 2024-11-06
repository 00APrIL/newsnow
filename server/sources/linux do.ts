// 定义文章数据接口
interface Article {
  id: string
  title: string
  author: string
  content_html: string
  date_published: string
  date_modified?: string
  url: string
  tags?: string[]
}

// 定义API响应接口
interface LinuxDoResponse {
  version: string
  title: string
  description: string
  home_page_url: string
  feed_url: string
  items: Article[]
}

// 定义输出文章格式
interface ProcessedArticle {
  id: string
  title: string
  extra: {
    date: string
    author: string
    tags?: string[]
  }
  url: string
}

// 定义数据源函数
const linuxDoFeed = defineSource(async () => {
  try {
    // 获取不同分类的文章
    // 这里假设linux.do有以下几个主要分类
    const categories = [
      'latest',      // 最新文章
      'featured',    // 精选文章
      'tutorials',   // 教程
      'discussion'   // 讨论
    ]
    
    // 并行获取所有分类的数据
    const responses = await Promise.all(
      categories.map(category => 
        myFetch(`https://linux.do/api/${category}.json`) as Promise<LinuxDoResponse>
      )
    )
    
    // 处理获取到的数据
    const processedArticles = responses
      .map(response => response.items)  // 提取所有文章
      .flat()                          // 扁平化数组
      .map(article => ({
        id: article.id,
        title: article.title,
        extra: {
          date: article.date_modified ?? article.date_published,
          author: article.author,
          tags: article.tags
        },
        url: article.url
      }))
      // 按日期降序排序，最新的文章在前面
      .sort((a, b) => 
        new Date(b.extra.date).getTime() - new Date(a.extra.date).getTime()
      )
    
    // 去重，避免同一篇文章在不同分类中重复出现
    const uniqueArticles = Array.from(
      new Map(processedArticles.map(article => [article.id, article]))
      .values()
    )
    
    return uniqueArticles
    
  } catch (error) {
    console.error('Error fetching Linux.do feed:', error)
    return []
  }
})

// 导出数据源
export default defineSource({
  "linux-do": linuxDoFeed,
  "linux-do-feed": linuxDoFeed
})
