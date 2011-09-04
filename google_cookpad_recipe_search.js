(function(win) {
    //site:cookpad.comで絞り込んだ場合のみ反映させる
    var match = location.search.match(/&?q=.*(site(%3A|:)cookpad.com)/);
    if(!match) {
        return;
    }
    var doc = win.document;
    win.addEventListener("scroll", scrollHandler);
    win.addEventListener("resize", resizeHandler);
    doc.body.addEventListener('AutoPagerize_DOMNodeInserted', moveIframe, false);
    doc.body.addEventListener('AutoPatchWork.DOMNodeInserted', moveIframe, false);

    function scrollHandler(event) {
        if(firstTop + 30 > win.scrollY && iframe.style.position == "fixed") {
            iframe.style.top = firstTop + "px";
            iframe.height = win.innerHeight - firstTop + "px";
        } else if(iframe.style.position == "fixed") {
            iframe.style.top = "0";
            iframe.height = win.innerHeight + "px";
        }
    };

    function resizeHandler(event) {
        var sr = doc.getElementById("center_col");
        var tpw = sr.offsetWidth + parseInt(sr.style.marginRight);
        if(win.innerWidth > tpw) {
            iframe.width = win.innerWidth - sr.offsetWidth - 26;
        } else {
            iframe.width = 670;
        }
    }

    function moveIframe() {
        iframe.style.position = "fixed";
        linkeventFook();
    }

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
        bookmarkWin.style.display="none";
    }

    //ブックマーク追加
    function callBookmarking(event) {
        if(bookmarkTitle.value === "") {
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
        }, function(data) {
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
    leftnav.style.display = "none";
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
    if(win.innerWidth > twoPaneWidth) {
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
    if(adsense) {
        //広告があったら非表示
        adsense.style.display = "none";
    }
    //プレビューを消す
    var bts = doc.getElementById("botstuff");
    if(bts) {
        bts.style.display = "none";
    }
    //上部の検索窓などを消す
    var sftab = doc.getElementById("sftab");
    if(sftab) {
        sftab.style.display = "none";
    }
    var sblsbb = doc.getElementById("sblsbb");
    if(sblsbb) {
        sblsbb.style.display = "none";
    }
    var sflas = doc.getElementById("sflas");
    if(sflas) {
        sflas.style.display = "none";
    }
    var numStats = doc.getElementById("resultStats");
    if(numStats) {
        numStats.style.display = "none";
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
    newSearchElement.innerHTML = '<span style="font-size:1.5em">' + searchWord + '</span><span style="font-size:1.2em">の検索結果 </span><span style="font-size:1.5em">' + searchCount + '</span>';
    doc.getElementById("tsf").appendChild(newSearchElement);
    newSearchElement.style.position = "absolute";
    newSearchElement.style.left = searchWordStartX + "px";
    newSearchElement.style.top = 0;

    //エレメントのx座標を取得する
    //overflowがないものとして処理
    function getAbsoluteX(e) {
        var x = 0;
        while(e) {
            x += e.offsetLeft;
            e = e.offsetParent;
        }
        return x;
    }

    //検索結果のリンクを取得
    function linkeventFook() {
        var links = doc.querySelectorAll('h3 > a.l');
        for(var i = 0 + startIndex, len = links.length; i < len; i++) {
            var link = links[i];
            //クリックイベントをキャンセルしてiframeのソースにhrefをセットする
            link.addEventListener('click', clickOpenIFrameHandler);
            //プレビュー表示の虫眼鏡を消す
            var vspib = link.parentNode.parentNode.querySelector('.vspib');
            if(vspib) {
                vspib.style.display = "none";
            }
            //新たに開く用にanchorを作成する
            var anchor = doc.createElement('a');
            anchor.href = link.href;
            anchor.target = "_blank";
            anchor.style.marginLeft = "5px";
            anchor.innerText = "新しく開く";
            link.parentNode.parentNode.appendChild(anchor);
            //bookmarkリンク作成
            var bmAnchor = doc.createElement('a');
            bmAnchor.innerText = "ブックマーク";
            bmAnchor.href = link.href;
            bmAnchor.title = link.innerText;
            bmAnchor.style.marginLeft = "5px";
            link.parentNode.parentNode.appendChild(bmAnchor);
            bmAnchor.addEventListener('click', bookmarkWindowOpen);
        }
        startIndex = links.length;
    }

    //bookmark追加のモーダルウィンドウを表示
    function bookmarkWindowOpen(event) {
        event.preventDefault();
        var that = this;
        chrome.extension.sendRequest({
            "action" : "getAllBookmarks"
        }, function(data) {
            titleLabel.className = "bookmark_label";
            folderLabel.className = "bookmark_label";
            clearFix.className = "float_clear_fix";
            clearFix2.className = "float_clear_fix";
            bookmarkWin.className = "modal_open";
            bookmarkWin.style.height = doc.body.clientHeight + "px";
            bookmarkWin.style.display="block";
            overlayAnchor.className = "close_overlay";
            overlayAnchor.style.height = doc.body.clientHeight + "px";
            bookmarkForm.style.top=win.innerHeight/2+doc.body.scrollTop+"px";
            bookmarkForm.className = "bookmark_form";
            bookmarkTitle.value = that.title;
            bookmarkURL.value = that.href;
            //一旦optionを全削除
            while(folderSelect.firstChild) {
                folderSelect.removeChild(folderSelect.firstChild);
            }
            //再度フォルダー一覧でselectのoptionを構築する
            for(var i = 0, le = data.length; i < le; i++) {
                var node = data[i];
                var opt = doc.createElement('option');
                opt.value = node.id;
                opt.innerHTML = makeNestTitle(node);
                folderSelect.appendChild(opt);
            }
        });
    }

    function makeNestTitle(node) {
        var s = "";
        for(var j = 0, len = node.ancestorCount; j < len; j++) {
            s += "&nbsp;&nbsp;&nbsp;";
        }
        return s + node.title;
    }

    function clickOpenIFrameHandler(event) {
        event.preventDefault();
        iframe.src = this.href;
    }

    linkeventFook();

    //インスタント検索対策としてナビゲーションのクリックを横取りする
    var navLinks = doc.querySelectorAll('#nav a');
    for(var j = 0, le = navLinks.length; j < le; j++) {
        var navLink = navLinks[j];
        navLink.addEventListener('click', clickAjaxStealHandler);
    }
    function clickAjaxStealHandler(event) {
        event.preventDefault();
        location.href = this.href;
    }

})(window);
