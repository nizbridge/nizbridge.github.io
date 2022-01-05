---
layout: post
title:  "box-shadow bug"
date:   2016-04-18
categories: [all, html-css]
---

`border-collapse:colllapse` 일때 일부 브라우저에서 box-shdaow가 사라지는 이슈가 있습니다.

해결하기 위해 많이 찾아봤는데,<br>
속성을 `border-collapse:separate`로 한 다음에 필요에 따라서 th, td의 border를 따로 그려주는 방법뿐이 없어보입니다.

망할 IE..

재현 브라우저 : Edge, IE 11이상


{% include codepen.html hash="oNGybNG" title="box-shadow bug" %}

<br><br>