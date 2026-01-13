function verifyEncrypt(uid, correctPwd) {
  const inputVal = document.getElementById(uid + '-input').value;
  const content = document.getElementById(uid + '-content');
  const widget = document.getElementById(uid + '-widget');

  if (inputVal === correctPwd) {
    content.style.display = 'block'; // 显示内容
    widget.style.display = 'none';   // 隐藏输入框
  } else {
    alert('密码错误！');
  }
}