function show_runtime() {
    // 1. 设置你的建站日期 (年, 月-1, 日)
    // 注意：JavaScript 的月份是从 0 开始的，3月要写 2
    var BirthDay = new Date("2025/10/21 00:00:00"); 
    
    var today = new Date();
    var timeold = (today.getTime() - BirthDay.getTime());
    var msPerDay = 24 * 60 * 60 * 1000;
    
    var e_daysold = timeold / msPerDay;
    var daysold = Math.floor(e_daysold);
    var e_hrsold = (e_daysold - daysold) * 24;
    var hrsold = Math.floor(e_hrsold);
    var e_minsold = (e_hrsold - hrsold) * 60;
    var minsold = Math.floor(e_minsold);
    var seconds = Math.floor((e_minsold - minsold) * 60);

    // 2. 只有当页面存在这些 ID 时才执行，防止报错
    if (document.getElementById('runtime_days')) {
        document.getElementById('runtime_days').innerHTML = daysold;
        document.getElementById('runtime_hours').innerHTML = hrsold;
        document.getElementById('runtime_mins').innerHTML = minsold;
        document.getElementById('runtime_secs').innerHTML = seconds;
    }
}
// 每一秒更新一次
setInterval(show_runtime, 1000);