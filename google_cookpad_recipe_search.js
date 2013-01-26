(function (win) {
  //site:cookpad.comで絞り込んだ場合のみ反映させる
  var match = location.search.match(/site(%3A|:)cookpad.com/);
  if (!match) {
    return;
  }

  var doc = win.document;
  win.addEventListener("scroll", scrollHandler);
  win.addEventListener("resize", resizeHandler);
  //AutoPagerize,AutoPatchWorkのイベントリスナーを登録
  doc.body.addEventListener('AutoPagerize_DOMNodeInserted', moveIframe, false);
  doc.body.addEventListener('AutoPatchWork.DOMNodeInserted', moveIframe, false);

  //iframeの位置を調整
  function scrollHandler(event) {
    if (firstTop + 30 > win.scrollY && iframe.style.position == "fixed") {
      iframe.style.top = firstTop + "px";
      iframe.height = win.innerHeight - firstTop + "px";
    } else if (iframe.style.position == "fixed") {
      iframe.style.top = "0";
      iframe.height = win.innerHeight + "px";
    }
  }

  //iFrameの表示幅をリサイズに追従
  function resizeHandler(event) {
    var sr = doc.getElementById("center_col");
    var tpw = sr.offsetWidth + parseInt(sr.style.marginRight);
    if (win.innerWidth > tpw) {
      iframe.width = win.innerWidth - sr.offsetWidth - 26;
    } else {
      iframe.width = 670;
    }
    iframe.height = sr.offsetHeight;
  }

  function moveIframe() {
    iframe.style.position = "fixed";
    initGCookpad();
  }

  //bookmark一覧を保持する
  var bookmarks = [];

  //bookmark登録用UIを用意
  var bookmarkWin = doc.createElement('div');
  bookmarkWin.id = "bookmark_modal";
  var titleSpan = doc.createElement('span');
  titleSpan.innerText = "ブックマークに追加";
  var overlayAnchor = doc.createElement('span');
  overlayAnchor.addEventListener('click', overlayEnd);
  var bookmarkForm = doc.createElement('div');
  bookmarkForm.id = "bookmark_form";
  bookmarkForm.style.padding = "10px";
  var closeLink = doc.createElement('a');
  closeLink.id = "bookmark_close_link";
  closeLink.addEventListener('click', overlayEnd);
  var titleLabel = doc.createElement('label');
  titleLabel.innerText = "名前:";
  var bookmarkTitle = doc.createElement('input');
  bookmarkTitle.type = "text";
  bookmarkTitle.style.width = "320px";
  var clearFix = doc.createElement('span');
  var bookmarkURL = doc.createElement('input');
  bookmarkURL.type = "hidden";
  var folderLabel = doc.createElement('label');
  folderLabel.innerText = "フォルダ:";
  var folderSelect = doc.createElement('select');
  folderSelect.style.width = "326px";
  var clearFix2 = doc.createElement('div');
  var bookmarkAdd = doc.createElement('input');
  bookmarkAdd.id = "bookmark_add";
  bookmarkAdd.type = "submit";
  bookmarkAdd.value = "追加";
  bookmarkAdd.addEventListener('click', callBookmarking);
  bookmarkForm.appendChild(bookmarkURL);
  bookmarkForm.appendChild(closeLink);
  bookmarkForm.appendChild(titleSpan);
  bookmarkForm.appendChild(doc.createElement('br'));
  bookmarkForm.appendChild(titleLabel);
  bookmarkForm.appendChild(bookmarkTitle);
  bookmarkForm.appendChild(clearFix);
  bookmarkForm.appendChild(doc.createElement('br'));
  bookmarkForm.appendChild(folderLabel);
  bookmarkForm.appendChild(folderSelect);
  bookmarkForm.appendChild(clearFix2);
  bookmarkForm.appendChild(doc.createElement('br'));
  bookmarkForm.appendChild(bookmarkAdd);
  bookmarkWin.appendChild(doc.createElement('br'));
  bookmarkWin.appendChild(overlayAnchor);
  bookmarkWin.appendChild(bookmarkForm);
  doc.body.appendChild(bookmarkWin);
  //モーダルを解消
  function overlayEnd(event) {
    event.preventDefault();
    overlayErase();
  }

  function overlayErase() {
    overlayAnchor.className = "";
    bookmarkForm.className = "";
    bookmarkWin.className = "";
    bookmarkWin.style.display = "none";
  }

  //ブックマーク追加
  function callBookmarking(event) {
    if (bookmarkTitle.value === "") {
      return;
    }
    event.preventDefault();
    chrome.extension.sendRequest({
      "action" : "bookmarking",
      "bookmarkObject" : {
        "parentId" : folderSelect.options[folderSelect.selectedIndex].value,
        "title" : bookmarkTitle.value,
        "url" : bookmarkURL.value
      }
    }, function (data) {
      bookmarks.push(data);
      //urlで走査して✓を追加する
      var xpathString = '//a[@class="bookmarkLink" and @href="' + data.url + '"]';
      var bookmarkLinks = doc.evaluate(xpathString, doc.body, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
      for (var i = 0, len = bookmarkLinks.snapshotLength; i < len; i++) {
        var bmLink = bookmarkLinks.snapshotItem(i);
        if (bmLink.nextSibling.nodeValue != "✓") {
          bmLink.parentElement.insertBefore(doc.createTextNode("✓"), bmLink.nextSibling);
        }
        ;
      }
      ;
      overlayErase();
    });
  }

  //スタート位置を保持する
  var startIndex = 0;
  //プレビューのスタート位置を保持する
  var vspibStartIndex = 0;
  //初期トップ位置
  var firstTop = doc.getElementById("rcnt").offsetTop;
  //左側のナビゲーションエレメント
  var leftnav = doc.getElementById("leftnav");
  //非表示にする
  if (leftnav) {
    leftnav.style.display = "none";
  }
  //検索結果表示位置、幅調整
  var searchResult = doc.getElementById("center_col");
  searchResult.style.marginLeft = "0px";
  searchResult.style.marginRight = "680px";
  searchResult.style.minWidth = searchResult.offsetWidth + "px";
  var twoPaneWidth = searchResult.offsetWidth + parseInt(searchResult.style.marginRight);
  //検索結果の高さを記録
  var pageHeight = searchResult.offsetHeight;
  //検索結果脇にiframeを挿入
  var iframe = doc.createElement('IFRAME');
  iframe.style.position = "absolute";
  iframe.style.right = "0";
  iframe.style.top = firstTop + "px";
  if (win.innerWidth > twoPaneWidth) {
    iframe.width = win.innerWidth - searchResult.offsetWidth - 26;
  } else {
    iframe.width = 670;
  }
  iframe.style.left = (searchResult.offsetWidth + 10) + "px";
  iframe.height = pageHeight + "px";
  iframe.frameBorder = 0;
  doc.body.appendChild(iframe);
  //広告
  var adsense = doc.getElementById("rhs");
  if (adsense) {
    //広告があったら非表示
    adsense.style.display = "none";
  }
  //プレビューを消す
  var bts = doc.getElementById("botstuff");
  if (bts) {
    bts.style.display = "none";
  }
  //上部の検索窓などを消す
  var sftab = doc.getElementById("sftab");
  if (sftab) {
    sftab.style.display = "none";
  }
  var sblsbb = doc.getElementById("sblsbb");
  if (sblsbb) {
    sblsbb.style.display = "none";
  }
  var sflas = doc.getElementById("sflas");
  if (sflas) {
    sflas.style.display = "none";
  }
  var numStats = doc.getElementById("resultStats");
  if (numStats) {
    numStats.style.display = "none";
  }
  var gbqff = doc.getElementById("gbqff");
  if (gbqff) {
    gbqff.style.display = "none";
  }
  var gbqfbw = doc.getElementById("gbqfbw");
  if (gbqfbw) {
    gbqfbw.style.display = "none";
  }
  var gbqfb = doc.getElementById("gbqfb");
  if (gbqfb) {
    gbqfb.style.display = "none";
  }
  //検索件数を取得
  var searchCount = numStats.firstChild.data;
  //検索ワード、件数などの表示位置を取得する
  var title = doc.title;
  var searchWord = title.replace("site:cookpad.com", '').replace(" - Google 検索", '').replace("  ", " ", "g");
  var searchWordStartX = 0;
  var elem = doc.querySelector('.tsf-p table');
  searchWordStartX = getAbsoluteX(elem);
  var newSearchElement = doc.createElement('div');
  var span1 = doc.createElement('span');
  span1.style.fontSize = "1.5em";
  span1.innerText = searchWord;
  newSearchElement.appendChild(span1);
  var span2 = doc.createElement('span');
  span2.style.fontSize = "1.2em";
  span2.innerText = "の検索結果";
  newSearchElement.appendChild(span2);
  var span3 = doc.createElement('span');
  span3.style.fontSize = "1.5em";
  span3.innerText = searchCount;
  newSearchElement.appendChild(span3);
  var gbqf = doc.getElementById('gbqf');
  gbqf.insertBefore(newSearchElement, gbqf.firstChild);
  // newSearchElement.style.position = "absolute";
  newSearchElement.style.left = searchWordStartX + "px";
  newSearchElement.style.top = 0;

  //エレメントのx座標を取得する
  //overflowがないものとして処理
  function getAbsoluteX(e) {
    var x = 0;
    while (e) {
      x += e.offsetLeft;
      e = e.offsetParent;
    }
    return x;
  }

  //検索結果のリンクを取得
  function linkeventFook() {
    var links = doc.querySelectorAll('h3 > a.l');
    for (var i = 0 + startIndex, len = links.length; i < len; i++) {
      var link = links[i];
      //インスタント検索にもっていかれてページ遷移してしまうので、元の表示をすべて非表示にしてanchor,description等を作成する
      link.parentElement.parentElement.style.display = "none";

      //新たにanchorを作成する。
      var newLink = doc.createElement('a');
      newLink.href = link.href;
      var t = link.innerText;
      newLink.innerText = t;
      newLink.style.fontSize = "medium";
      newLink.addEventListener('click', clickOpenIFrameHandler);
      link.parentElement.parentElement.parentElement.appendChild(newLink);

      //二段目のdivを作成
      var secondDiv = doc.createElement('div');
      //新たに開く用にanchorを作成する
      var anchor = doc.createElement('a');
      anchor.href = link.href;
      anchor.target = "_blank";
      anchor.style.marginLeft = "5px";
      anchor.innerText = "新しく開く";
      secondDiv.appendChild(anchor);

      //bookmarkリンク作成
      var bmAnchor = doc.createElement('a');
      bmAnchor.innerText = "ブックマーク";
      bmAnchor.className = "bookmarkLink";
      bmAnchor.href = link.href;
      bmAnchor.title = link.innerText;
      bmAnchor.style.marginLeft = "5px";
      bmAnchor.addEventListener('click', bookmarkWindowOpen);
      secondDiv.appendChild(bmAnchor);
      //ブックマーク済みかチェックする
      var bool = bookmarks.some(function (elem, idx, array) {
        return elem.url == link.href;
      });
      if (bool) {
        var checkMarkString = doc.createTextNode("✓");
        //ブックマーク済みなら✓をつける
        secondDiv.appendChild(checkMarkString);
      }
      //つくれぽ件数
      var tsukurepoSpan = doc.createElement('span');
      tsukurepoSpan.id = "tsukurepoSpan" + i;
      tsukurepoSpan.style.marginLeft = "5px";
      secondDiv.appendChild(tsukurepoSpan);
      //はてぶ
      var hatebuAnchor = doc.createElement('a');
      hatebuAnchor.style.marginLeft = '5px';
      var encodeRecipeURL = link.href.replace(/#/, '%23');
      hatebuAnchor.href = 'http://b.hatena.ne.jp/entry/' + encodeRecipeURL;
      var img = doc.createElement('img');
      img.src = "http://b.hatena.ne.jp/entry/image/" + encodeRecipeURL;
      hatebuAnchor.appendChild(img);
      secondDiv.appendChild(hatebuAnchor);

      var recipeMatch = link.href.match(/cookpad.com\/recipe/);
      if (recipeMatch) {
        var recipeURL = cookpadRecipeURL(link.href);
        //Facebookのlike boxを生成
        var fSpan = doc.createElement('span');
        fSpan.style.marginLeft = '5px';
        fSpan.innerHTML = '<iframe src="https://www.facebook.com/plugins/like.php?href=' + encodeURIComponent(recipeURL) +
          '&amp;send=false&amp;layout=button_count&amp;width=150&amp;show_faces=false&amp;font&amp;colorscheme=light&amp;action=like&amp;height=21" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:150px; height:21px;" allowTransparency="true"></iframe>';
        secondDiv.appendChild(fSpan);

        //非同期でつくれぽ件数を取得する
        //つくれぽ件数、人数
        chrome.extension.sendRequest({
          "action" : "getCookpadTsukurepo",
          "recipeURL" : recipeURL,
          "spanPosition" : i
        }, function (response) {
          //つくれぽ件数表示用span
          var span = doc.getElementById('tsukurepoSpan' + response.spanPosition);
          var frag = doc.createDocumentFragment();
          var textNode1 = doc.createTextNode("つくれぽ");
          frag.appendChild(textNode1);
          var em1 = doc.createElement("em");
          em1.innerText = response.count;
          frag.appendChild(em1);
          var textNode2 = doc.createTextNode("件");
          frag.appendChild(textNode2);
          var em2 = doc.createElement("em");
          em2.innerText = response.uuCount;
          frag.appendChild(em2);
          span.appendChild(frag);
        });
      }

      link.parentElement.parentElement.parentElement.appendChild(secondDiv);

      //descriptionを作成する
      var description = link.parentElement.parentElement.querySelector('.st').innerHTML;
      var descriptionDiv = doc.createElement('div');
      descriptionDiv.style.marginTop = '5px';
      descriptionDiv.innerHTML = description;
      link.parentElement.parentElement.parentElement.appendChild(descriptionDiv);

    }
    startIndex = links.length;
  }

  //bookmark追加のモーダルウィンドウを表示
  function bookmarkWindowOpen(event) {
    event.preventDefault();
    var that = this;
    chrome.extension.sendRequest({
      "action" : "getAllBookmarkFolders"
    }, function (data) {
      titleLabel.className = "bookmark_label";
      folderLabel.className = "bookmark_label";
      clearFix.className = "float_clear_fix";
      clearFix2.className = "float_clear_fix";
      bookmarkWin.className = "modal_open";
      bookmarkWin.style.display = "block";
      overlayAnchor.className = "close_overlay";
      overlayAnchor.style.height = doc.body.clientHeight + "px";
      bookmarkForm.style.top = win.innerHeight / 2 + doc.body.scrollTop + "px";
      bookmarkForm.className = "bookmark_form";
      bookmarkTitle.value = that.title;
      bookmarkURL.value = that.href;
      //一旦optionを全削除
      while (folderSelect.firstChild) {
        folderSelect.removeChild(folderSelect.firstChild);
      }
      //再度フォルダー一覧でselectのoptionを構築する
      for (var i = 0, le = data.length; i < le; i++) {
        var node = data[i];
        var opt = doc.createElement('option');
        opt.value = node.id;
        opt.innerText = makeNestTitle(node);
        folderSelect.appendChild(opt);
      }
    });
  }

  //モバれぴ対応
  function cookpadRecipeURL(url) {
    var recipeURL = url;
    if (url.indexOf("http://m.cookpad.com") != -1) {
      recipeURL = url.replace("http://m.cookpad.com", "http://cookpad.com");
    }
    return recipeURL;
  }

  function makeNestTitle(node) {
    var s = "";
    for (var j = 0, len = node.ancestorCount; j < len; j++) {
      s += "　";
    }
    return s + node.title;
  }

  //クリックイベントをキャンセルしてiframeのソースにhrefをセットする
  function clickOpenIFrameHandler(event) {
    event.preventDefault();
    iframe.src = this.href;
  }

  function initGCookpad() {
    //ブックマーク取得
    chrome.extension.sendRequest({
      "action" : "getAllBookmarks"
    }, function (data) {
      bookmarks = data;
      linkeventFook();
    });
  }

  //インスタント検索対策としてナビゲーションのクリックを横取りする
  var navLinks = doc.querySelectorAll('#nav a');
  for (var j = 0, le = navLinks.length; j < le; j++) {
    var navLink = navLinks[j];
    navLink.addEventListener('click', clickAjaxStealHandler);
  }
  function clickAjaxStealHandler(event) {
    event.preventDefault();
    location.href = this.href;
  }

  initGCookpad();

})(window);
