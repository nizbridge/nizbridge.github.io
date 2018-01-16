---
layout: post
title:  "Feature Queries @supports 활용하기"
date:   2016-08-25
categories: [all, review]
---

대부분 잘 모를 수 있는 기능인데, @supports 라는 feature quereis를 활용하면 조금 더 유연한 CSS를 만들 수 있습니다.

```
@supports는 브라우저의 해당 속성 지원여부에 따라서 추가적인 속성들을 부여할 수 있도록 해줍니다.
```
{:class="blue-box"}

<br>
예를 들어, `-webkit-`계열 속성은 크롬이나 사파리등에서는 잘 보이지만, 파이어폭스 같은 브라우저에서는 제대로 보여지지 않습니다.
이럴 때 `@supports`를 사용하여 해당 속성이 지원될 때와 안될 때를 구분하여 다른 속성으로 스타일을 줄 수가 있습니다.

```html
<!-- html -->
<p class="warning">이 페이지는 웹킷 브라우저에 최적화되어 있습니다. 다른 브라우저에서는 정상적으로 표현되지 않을 수 있습니다.</div>
<p class="contents">The carrot is a root vegetable, usually orange in colour, though purple, black, red, white, and yellow varieties exist. It has a crisp texture when fresh. The most commonly eaten part of a carrot is a taproot, although the greens are sometimes eaten as well. It is a domesticated form of the wild carrot Daucus carota, native to Europe and southwestern Asia. The domestic carrot has been selectively bred for its greatly enlarged and more palatable, less woody-textured edible taproot. The Food and Agriculture Organization of the United Nations (FAO) reports that world production of carrots and turnips (these plants are combined by the FAO for reporting purposes) for calendar year 2011 was almost 35.658 million tonnes. Almost half were grown in China. Carrots are widely used in many cuisines, especially in the preparation of salads, and carrot salads are a tradition in many regional cuisines.</p>
```

```css
/* css */

.contents {overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;white-space:normal;word-wrap:break-word}
.warning {color:red;font-size: 120%;margin: 2em;}

@supports (display:-webkit-box ) { /* -webkit-box 지원되면 */
  .warning { display: none; }
}

@supports not (display:-webkit-box ) { /* -webkit-box가 지원 안되면 */
  .contents {
    height:2.6em;
  }
}
```

[> 예제보기](http://codepen.io/niizguy/pen/mEYNYG){:class="text-link" target="blank"}

위의 예제는 `display:-webkit-box` 를 사용할 수 있는 브라우저라면 `-webkit-line-clamp`속성을 이용해서 두 줄 말줄임된 텍스트가 출력될 것이고,
지원 안되는 브라우저라면 경고 문구와 함께 단순히 height값을 조절하여 두 줄만 노출되로록 짤라서 표현해줍니다.

이처럼 속성의 지원여부에 따라 다르게 스타일을 할 수 있도록 해주는 것이 Feature queries 입니다.
`display:grid` 처럼 지금은 지원되는 브라우저가 거의 없지만 나중에 많이 사용될 수 있는 속성들도 Feature queries를 사용하여 
작성해 둔다면 추후 유지보수에도 많은 도움이 되지 않을까 생각합니다.

Feature queries는 IE를 제외하고는거의 모든 브라우저에서 사용가능하며,([사용범위 확인](http://caniuse.com/#search=feature){:class="text-link" target="blank"})
<br>
더 자세한 내용은 w3의 아래 문서를 참고하세요.

[Feature queries: the ‘@supports’ rule](https://www.w3.org/TR/css3-conditional/#at-supports){:class="text-link" target="blank"}