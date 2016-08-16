---
layout: post
title:  "input 속성 중 placeholder 의 색 바꾸기"
date:   2014-07-24
categories: [all, html-css]
---

보통 회원가입 페이지 등에 많이 사용되는 형태로<br>
input을 이용하여 이름이나 비밀번호, 전화번호 등을 입력받을 때가 있다.<br>
  
보통 아래와 같은 형식으로 쓰이게 되는데,<br>

```html
<input type="text" placeholder="휴대폰 번호를 입력하세요" maxlength="11">​
```

placeholder 를 사용하게 되면 전화번호 입력 전 빈공간에 "휴대폰 번호를 입력하세요" 라는 가이드 문구가 노출되게 된다.<br>
문제는 이 문구의 색상을 바꾸고 싶을 때 발생하는데,<br>
html5 이전 버전에서는 css에서 지원을 하지 않았기 때문에 label과 스크리트를 활용하여 일종의 편법으로 placeholder의 스타일을 변경했다.<br>
 
 
하지만 html5에서는 placeholder 선택자를 사용해서 스타일링 할 수 있게 변경되었다.<br>
다만, 모든 브라우저에서 지원되는 것이 아니기 때문에 사용할때 유의해야 한다.<br>
  
사용 방법은 아래와 같다.<br>

```css
::-webkit-input-placeholder { color: #CCC; }

/* Firefox 4-18 */
:-moz-placeholder { color: #CCC; }

/* Firefox 19+ */
::-moz-placeholder { color: #CCC; }

/* IE10+ */
:-ms-input-placeholder { color: #CCC; } 
```

[> 예제보기](http://codepen.io/anon/pen/cxrKz){:class="text-link" target="blank"}
