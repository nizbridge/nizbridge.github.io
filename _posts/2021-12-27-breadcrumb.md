---
layout: post
title:  "flex를 활용한 breadcrumb 만들기"
date:   2021-12-27
categories: [all, html-css]
---

게시판 같은 글 목록을 만들때 많이 사용되는 breadcrumb를 만들어볼려고 합니다.

스펙은 다음과 같습니다.

- 게시판이 depth 순서대로 표현될 것
- 게시판명이 길 경우 말줄임 될 것
- 마지막 게시판명은 말줄임 되지 않을 것

![Demo Image](/assets/20211227-img1.png)

결과적으로 위 이미지와 같은  breadcrumb이 나오도록 만들어야 합니다.


이런 스펙일 경우 말줄임에 대한 부분 때문에 구현하기가 참 어려울 수 있지만,

flex를 사용해서 비교적 간단하게 구현가능합니다.

우선 html 구조는 아래와 같이 만듭니다.

```html
<ul>
<li>게시판이름</li>
<li>게시판이름</li>
<li>게시판이름</li>
<li>게시판이름</li>
</ul>
```

ul이 'flex container' 이고, li가 'flex item' 입니다.

css를 살펴볼까요.

```css
ul {
	display:flex;
}
li {
	flex:0 1 auto;
	position:relative;
	overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
li:last-of-type{
	flex-shrink:0;
}
li + li {
	margin-left:6px;
	padding-left:12px;
}
li + li:before{
	content: '>';
  position: absolute;
  top: 50%;
  left: 0;
  width: 5px;
  transform: translateY(-50%);
}
```

기본적으로 flex item은 'flex:0 1 auto' 속성으로 되어있습니다. 이건 flex  item의 기본값입니다.

이 의미는 'flex-grow, flex-shrink, flex-basis'를 출약해서 사용하는 것으로 아래와 같습니다.

```css
flex-grow:0;  /* item의 커지는 비율을 정합니다. 0이면 비율이 커지지 않습니다. */
flex-shrink:1; /* item의 작아지는 비율을 정합니다. 1이면 비율에 따라 작아질수있습니다. */
flex-basis:auto; /* item의 기본너비를 정합니다. auto이면 item들의 크기에 따라서 유동적으로 변합니다. */
```

그럼 li에 있는 게시판명에 따라서 균등한 너비를 가지게 되어있습니다.
게시판명이 길 경우 모든 게시판명이 말줄임이 되겠죠.. 아래처럼요..

![Demo Image](/assets/20211227-img2.png)

처음에 정한 스펙에서 마지막 게시판명, 즉 현재 위치한 게시판명은 말줄임되면 안된다고 했습니다.

말줄임을 안되게 하려면 어떻게해야할까요?


flex item의 작아지는 비율을 없애면됩니다. 그게 바로 'flex-shrink' 속성이죠.

마지막 li에 'flex-shrink:0' 을 함으로서 해당 item는 온전히 그 너비를 가질수있게 만들수 있습니다.

```css
li:last-of-type{
	flex-shrink:0;
}
```

그럼 이제 원하는 스펙대로 모두 구현이 되었습니다.

{% include codepen.html hash="rNGpaog" title="flex를 활용한 breadcrumb 만들기" %}
<br><br>
