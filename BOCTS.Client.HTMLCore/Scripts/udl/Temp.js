[].forEach.call($$("*"), function (a) { a.style.outline = "1px solid #" + (~~(Math.random() * (1 << 24))).toString(16); });
[].forEach.call($$('*'), function (element) { /* 在这里修改颜色 */ element.style.backgroundColor = "#" + (~~(Math.random() * (1 << 24))).toString(16); });

