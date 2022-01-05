---
layout: post
title:  "수직/수평 정렬방법 그리고 가변되는 말풍선"
date:   2014-03-31
categories: [all, html-css]
---

수직, 수평정렬 방법에 대해서 알아보고자 합니다.<br>
컨텐츠를 가운데 정렬시키기 위해서 흔히 ```text-align:center, vertical-align:middle```을 많이 사용하지만,<br>
경우에 따라서 위의 두가지 속성을 사용할 수 없을 때가 있는데요,<br>

이럴 경우 ```margin:0 auto```와 같은 방식으로 중앙정렬을 할 수 있습니다.<br><br>
아래 코드는 말풍선을 중앙으로 이동시킨 후에 텍스트의 크기에 따라 말풍선의 크기가 변동되는걸 보여주는 예제입니다.<br>

```html
<div class="box">
     <span class="left">
             <span class="right">test</span>
     </span>
     <span class="arrow"></span>
</div>
```

```css
.box{position:relative;width:100%;margin-left:50%}
.left{display:inline-block;height:20px;width:5px;background:url(sp.png) -892px -231px no-repeat}
.right{display:inline-block;height:20px;margin-left:5px;padding-right:5px;
        background:url(sp7.png) 100% -231px no-repeat}
.arrow{position:absolute;width:10px;height:5px;left:15px;bottom:-5px;margin-right:-5px;background:blue}
```

{% include codepen.html hash="fwmup" title="수직/수평 정렬방법 그리고 가변되는 말풍선" %}
<br><br>

box 클래스를 보면 넓이를 100%로 지정한 이후 ```margin-left:50%```만큼 우로 이동시키고 있습니다.<br>
다시말하면, 전체 영역에서 반만큼 우측으로 이동하게 되기 때문에 결과적으로 해당 박스는 화면 중앙에 위치할 수 있습니다.<br>

말풍선을 가변시키기 위해서 left, right 라는 두개의 span 클래스를 사용하였습니다.<br>
먼저 left는 좌측둥근변을 그려주게되며,<br>
right는 우측의 둥근변과 중앙에 텍스트가 써지는 bg이미지를 그리게 됩니다.<br>
텍스트가 길어질수록 right의 넓이도 길어지기 때문에 스프라이트 이미지를 만들때 텍스트 영역을 충분히 길게 만들 필요가 있습니다.<br>
