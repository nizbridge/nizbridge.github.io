---
layout: post
title:  "썸네일의 이미지 사이즈가 다를때 높이를 일정하게 맞추는 방법"
date:   2014-05-20
categories: [all, html-css]
---

썸네일의 이미지의 사이즈가 모두 제각각이지만 보기좋게 하기 위해<br>
가운데 정렬을 할 필요가 있을 때 어떻게 해야 할까?<br>

아래 코드를 살펴보자.<br>

```html
<ul class="img_list">
<li style="background:url(image.jpg) 50% 50%;background-size:cover">
    <img src="dummy_img.png" width="100%" alt="이미지 제목">
</li>
<li style="background:url(image2.jpg) 50% 50%;background-size:cover">
    <img src="dummy_img.png" width="100%" alt="이미지 제목">
</li>
</ul>
```

```css
.img_list{position:absolute;left:0;width:100%;text-align:center}
.img_list li{display:inline-block;position:relative;width:28.3%}
.img_list li .mask{display:inline-block;position:absolute;top:0;left:0;width:90%;}
```

단순히 ul, li 형식의 썸네일 리스트 구조입니다.<br>
하지만 스크립트로 불러올 이미지의 사이즈가 모두 제각각일 경우 썸네일의 높이값을 css로는 알수가 없습니다.<br>
이럴 경우 더미이미지가 하나 필요한데요,<br>
 
썸네일 사이즈의 비율에 맞는 (3x4, 4x5 등의) 투명한 이미지파일을 하나 만들어야 합니다.<br>
위의 코드에서는 "dummy_img.png"가 그런 더미이미지입니다.<br>
 
그럼 더미 이미지는 왜 필요할까?<br>
 
html 코드를 보면,<br>
썸네일 이미지를 ``<img>`` 태그 등으로 불러오는 것이 아니라 ``<li>``에 인라인속성으로 불러오고 있습니다.<br>
결국 불러오는 이미지는 ``<li>``의 크기에 맞게 꽉 차게 들어가면서 중앙정렬이 될텐데요,<br>

이렇게만 한다면, ``<li>``는 height 값이 없기 때문에 자신의 크기가 어느정도인지를 알수 없습니다.<br>
결국 이미지는 노출되지 않게 되는데요, <br>
`<li>` 에 width, height값을 알려주면서, 일정한 비율로 늘어나게 만드는 역확을 하는게,<br>
더미이미지입니다.<br>
더미이미지를 img로 불러옴으로써 ``<li>``가 늘어나는 비율을 일정하게 고정시킬수가 있습니다.<br>

이렇게 하면 어떠한 사이즈의 썸네일이 들어오더라도 모두 일정한 사이즈의 썸네일 이미지를 노출시킬 수 있습니다.<br>
