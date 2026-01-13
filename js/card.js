document.addEventListener("DOMContentLoaded", function() {
  const btn = document.getElementById('toggleBtn');
  const container = document.getElementById('recomGrid');
  
  if (btn && container) {
    btn.addEventListener('click', function() {
      const isCollapsed = container.classList.contains('collapsed');
      
      if (isCollapsed) {
        // 展开
        const fullHeight = container.scrollHeight + "px";
        container.style.maxHeight = fullHeight;
        container.classList.remove('collapsed');
        btn.textContent = "收起内容";
        
        setTimeout(() => {
          if(!container.classList.contains('collapsed')) {
            container.style.maxHeight = "none";
          }
        }, 600);
      } else {
        // 收起（回到 380px）
        container.style.maxHeight = container.scrollHeight + "px";
        setTimeout(() => {
          container.style.maxHeight = "380px";
          container.classList.add('collapsed');
          btn.textContent = "展开全部";
        }, 10);
        
        container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }
});