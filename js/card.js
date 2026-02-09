document.addEventListener("DOMContentLoaded", function() {
  // 1. 改为获取所有带有相应类名的按钮
  const buttons = document.querySelectorAll('.recom-toggle-btn');
  
  buttons.forEach(btn => {
    btn.addEventListener('click', function() {
      // 2. 关键：通过 this (当前点击的按钮) 找到它同层级的容器
      // 向上找 wrapper，再从 wrapper 向下找 container
      const wrapper = this.closest('.recom-wrapper');
      const container = wrapper.querySelector('.recom-container');
      
      if (!container) return;

      const isCollapsed = container.classList.contains('collapsed');
      
      if (isCollapsed) {
        // 展开
        const fullHeight = container.scrollHeight + "px";
        container.style.maxHeight = fullHeight;
        container.classList.remove('collapsed');
        this.textContent = "收起内容";
        
        setTimeout(() => {
          if(!container.classList.contains('collapsed')) {
            container.style.maxHeight = "none";
          }
        }, 600);
      } else {
        // 收起
        container.style.maxHeight = container.scrollHeight + "px";
        
        // 强制触发重绘，确保动画丝滑
        container.offsetHeight; 

        setTimeout(() => {
          container.style.maxHeight = "380px";
          container.classList.add('collapsed');
          this.textContent = "展开全部";
        }, 10);
        
        // 滚动到当前这个 wrapper 的位置
        wrapper.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  });
});