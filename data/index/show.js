window.initBlogStats = async function(config) {
  // 1. 初始化 LeanCloud
  if (typeof AV !== 'undefined' && !AV.applicationId) {
    AV.init({
      appId: config.appId,
      appKey: config.appKey,
      serverURL: config.serverURL
    });
  }

  try {
    // 2. 同时查询流量趋势和文章数据
    const lineQuery = new AV.Query('DailyStat').descending('date').limit(7);
    const barQuery = new AV.Query('Counter').descending('time').limit(20);
	

    const [lineResults, barResults] = await Promise.all([
      lineQuery.find().catch(() => []), 
      barQuery.find()
    ]);

    // --- A. 处理折线图数据 ---
    const lineDates = lineResults.map(i => (i.get('date') || "").substring(5)).reverse();
    const linePVs = lineResults.map(i => i.get('pv') || 0).reverse();
    const lineUVs = lineResults.map(i => i.get('uv') || 0).reverse();

    // --- B. 处理柱状图数据 ---
    const barTitles = [], barViews = [];
    barResults.forEach(item => {
      let target = item.get('target') || "";
      if (target.includes('/20')) { // 仅匹配文章路径
        let title = target.split('/').filter(Boolean).pop();
        barTitles.push(title);
        barViews.push(item.get('time') || 0);
      }
    });

    // --- C. 渲染 ---
    renderLine(config.lineId, lineDates, linePVs, lineUVs);
    renderBar(config.barId, barTitles.slice(0, 10).reverse(), barViews.slice(0, 10).reverse());

  } catch (error) {
    console.error("数据加载失败:", error);
  }
};

function renderLine(id, dates, pvs, uvs) {
  const dom = document.getElementById(id); if (!dom) return;
  const chart = echarts.init(dom);
  chart.setOption({
    title: { text: '近 7 日访问趋势', left: 'center' },
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0, data: ['访问量', '访客数'] },
    xAxis: { type: 'category', boundaryGap: false, data: dates },
    yAxis: { type: 'value' },
    series: [
      { name: '访问量', type: 'line', smooth: true, data: pvs, itemStyle: { color: '#1890ff' } },
      { name: '访客数', type: 'line', smooth: true, data: uvs, itemStyle: { color: '#2fc25b' } }
    ]
  });
}

function renderBar(id, titles, views) {
  const dom = document.getElementById(id); if (!dom) return;
  const chart = echarts.init(dom);
  chart.setOption({
    title: { text: '文章阅读量排行', left: 'center' },
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '12%', bottom: '5%', containLabel: true },
    xAxis: { type: 'value' },
    yAxis: { type: 'category', data: titles },
    series: [{
      name: '次数', type: 'bar', data: views, itemStyle: { color: '#1890ff', borderRadius: [0, 4, 4, 0] },
      label: { show: true, position: 'right' }
    }]
  });
}