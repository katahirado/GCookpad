(function (win) {
  var doc = win.document;
  var googleURL = "http://www.google.co.jp/search?q=";
  var cookpad = "+site%3Acookpad.com";
  var popular = "人気検索";
  var numOne = "1位";
  var keyword = doc.getElementById("keyword");
  keyword.focus();
  keyword.addEventListener("keydown", function (event) {
    if (keyword.value == "") {
      return;
    }
    if (event.keyCode == 13) {
      createGoogleTab();
    }
  }, false);
  var search = doc.getElementById("search");
  search.addEventListener("click", function (event) {
    if (keyword.value == "") {
      return;
    }
    createGoogleTab();
  }, false);
  function createGoogleTab() {
    var urlString = googleURL + encodeURI(keyword.value) + cookpad;
    if (doc.getElementById("chkbox").checked) {
      urlString += '+' + encodeURI(popular);
    }
    if (doc.getElementById("chkbox2").checked) {
      urlString += "+" + encodeURI(numOne);
    }
    chrome.tabs.create({
      url : urlString
    });
    win.close();
  }

})(window);