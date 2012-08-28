/**
 * Created with JetBrains WebStorm.
 * User: yuichi_katahira
 * Date: 12/07/04
 * Time: 8:06
 */
(function () {
  var folders = [];
  var bookmarks = [];
  //ブックマークツリー全体を取得し、平滑化してcontentscriptに返す
  function getAllBookmarks(callback) {
    chrome.bookmarks.getTree(function (bookmarkTreeNodes) {
      bookmarks = [];
      findBookmark(bookmarkTreeNodes[0].children);
      callback(bookmarks);
    });
  }

  //再帰的にブックマークツリーをたどり、ブックマークのみを抽出する
  function findBookmark(bookmarkNodes) {
    for (var i = 0, len = bookmarkNodes.length; i < len; i++) {
      var bookmarkTreeNode = bookmarkNodes[i];
      if (!bookmarkTreeNode.url) {
        if (bookmarkTreeNode.children) {
          findBookmark(bookmarkTreeNode.children);
        }
      } else {
        bookmarks.push(bookmarkTreeNode);
      }
    }
  }

  //ブックマークツリー全体を取得し、フォルダーのみをcontentscriptに返す
  function getAllBookmarkFolders(callback) {
    chrome.bookmarks.getTree(function (bookmarkTreeNodes) {
      folders = [];
      findFolder(bookmarkTreeNodes[0].children);
      for (var j = 0, len = folders.length; j < len; j++) {
        var folder = folders[j];
        folder.ancestorCount = getAncestorCount(folder.parentId);
      }
      callback(folders);
    });
  }

  //再帰的にブックマークツリーをたどり、フォルダーのみを抽出する
  function findFolder(bookmarkNodes) {
    for (var i = 0, len = bookmarkNodes.length; i < len; i++) {
      var bookmarkTreeNode = bookmarkNodes[i];
      if (!bookmarkTreeNode.url) {
        folders.push(bookmarkTreeNode);
        if (bookmarkTreeNode.children) {
          findFolder(bookmarkTreeNode.children);
        }
      }
    }
  }

  //ブックマークフォルダの深度を得る
  function getAncestorCount(parentId) {
    var count = 0;
    while (parentId) {
      for (var k = 0, len = folders.length; k < len; k++) {
        var folder = folders[k];
        if (parentId == "0") {
          parentId = null;
          break;
        } else if (folder.id == parentId) {
          count += 1;
          parentId = folder.parentId;
          break;
        }
      }
    }
    return count;
  }

  function bookmarking(bookmarkObject, callback) {
    chrome.bookmarks.create(bookmarkObject, function (bookmarkTreeNode) {
      callback(bookmarkTreeNode);
    });
  }

  function getCookpadTsukurepo(recipeURL, spanPosition, callback) {
    //モバれぴ対応
    if (recipeURL.indexOf("http://m.cookpad.com") != -1) {
      recipeURL = recipeURL.replace("http://m.cookpad.com", "http://cookpad.com");
    }
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
      //つくれぽ件数を抜き出す
      var recipePage = xhr.responseText;
      var tsukurepoMatch = recipePage.match(/<span class=["']tsukurepo_count["']>([\s\S]?[0-9,]{1,}[\s\S]?)<\/span>/);
      var tsukurepoUUMatch = recipePage.match(/<span class=["']tsukurepo_uu_count["']>([\s\S]*?)<\/span>/);
      var uuCount="";
      if (tsukurepoMatch) {
        if(tsukurepoUUMatch[1]){
         uuCount=tsukurepoUUMatch[1].replace(/\r?\n/g,"");
        }
        var result = {
          'count' : tsukurepoMatch[1],
          'uuCount' : uuCount,
          'spanPosition' : spanPosition
        };
        callback(result);
      }
    }
    xhr.open('GET', recipeURL, true);
    xhr.send(null);
  }

  function getFacebookLikeCount(recipeURL, spanPosition, callback) {
    //モバれぴ対応
    if (recipeURL.indexOf("http://m.cookpad.com") != -1) {
      recipeURL = recipeURL.replace("http://m.cookpad.com", "http://cookpad.com");
    }
    var xhr = new XMLHttpRequest();
    var requestURL = "http://api.facebook.com/restserver.php?method=links.getStats&format=json&urls=" + encodeURIComponent(recipeURL);
    xhr.onload = function () {
      //total Countを抜き出す
      var responseJson = JSON.parse(xhr.responseText);
      var result = {
        'likeCount' : responseJson[0].total_count,
        'spanPosition' : spanPosition
      };
      callback(result);
    }
    xhr.open('GET', requestURL, true);
    xhr.send(null);
  }

  //呼び出しメソッドの振り分け
  function onRequest(request, sender, callback) {
    switch (request.action) {
      case "getAllBookmarks":
        getAllBookmarks(callback);
        break;
      case "getAllBookmarkFolders":
        getAllBookmarkFolders(callback);
        break;
      case "bookmarking":
        bookmarking(request.bookmarkObject, callback);
        break;
      case "getCookpadTsukurepo":
        getCookpadTsukurepo(request.recipeURL, request.spanPosition, callback);
        break;
      case "getFacebookLikeCount":
        getFacebookLikeCount(request.recipeURL, request.spanPosition, callback);
        break;
    }
  }

  //register
  chrome.extension.onRequest.addListener(onRequest);
})();
