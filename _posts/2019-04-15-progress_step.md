---
layout: post
title:  "flex를 활용한 progress step 만들기"
date:   2019-04-15
categories: [all, html-css]
---

![Demo Image](/assets/20190415-img1.png)

위와 같은 progress step을 만드는 방법은 여러가지가 있지만,
반응형으로 요소의 갯수도 변하는 스타일을 만드는건 쉽지 않습니다.
보통은 3단계, 4단계, 5단계 등 고정적인 step이 있다면, 클래스를 처리하여 width값을 비율로
33.3%, 25%, 20% 등으로 가져갈 수 있겠지만, 만약 단계가 고정적이지 않고 몇 개가 추가될지 모를 경우는 어떻게 해야할까요?

IE때문에 잘 쓰지는 않지만, 이럴때 유용한 속성이 flex 입니다. (IE10 이상 지원)
html 구조는 아래와 같이 만들면 됩니다.

```html
<!-- html -->
<ul>
<li>step1</li>
<li>step2</li>
<li>step3</li>
</ul>
```
ul이 flex container 이고, li가 flex 요소가 되겠죠.

컨테이너는 ul에에는 다음의 속성이 들어갑니다.
```css
<!-- css -->
display:flex;
justify-content: space-between;
```

우선 display속석을 flex로 주고,
justify-content 로 flex 요소의 수평 방향 정렬을 정할수 있습니다.
정렬 값은  아래 5가지가 있습니다.

- flex-start : default 값으로 좌측 정렬을 합니다.
- flex-end : 우측 정렬을 합니다.
- center : 중앙 정렬을 합니다.
- space-between : 컨테이너의 앞/뒤 여백 없이 요소들 사이에만 여백 두고 정렬합니다.
- space-around : 컨테이너의 앞/뒤와 요소들 사이에 여백을 두고 정렬합니다.

위와 같은 progress step을 만들려면 이 중에서 space-between을 사용하여 앞뒤 여백 없이 꽉 채워 줘야 합니다.
이렇게하게면 앞뒤 여백없이 요소가 차기는 하지만 <li> 사이 사이에는 여백이 존재하게 됩니다.
이때는 flex 요소인 <li>에서 flex-grow 속성으로 요소들 사이의 여백을 꽉 채워주면 됩니다.

```css
<!-- css -->
flex-grow:1; /*  flex:1 0 auto; */
```

flex-grow는 여분의 공간이 있을 경우 확장을 시켜 채우게해줍니다.
즉, 요소들 사이의 여백 없이 flex 컨테이너를 꽉 채우게 해줍니다.
flex는 IE 상위버전이나 모바일에서 유용하게 사용될 수 있기 때문에

잘 배워두면 쓰일 곳이 많습니다~!

[> 예제보기](https://codepen.io/niizguy/pen/NmaMPw){:class="text-link" target="blank"}