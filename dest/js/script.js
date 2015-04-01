"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Item = undefined,
    User = undefined,
    addOnloadHandler = undefined,
    corsRequest = undefined,
    getElementsByClassName = undefined,
    main = undefined,
    setIframeHeight = undefined,
    setInnerText = undefined,
    template = undefined;

var ItemRepository = (function () {
  function ItemRepository() {
    _classCallCheck(this, ItemRepository);

    this.itemContainer = {};
  }

  _createClass(ItemRepository, {
    findByUsername: {
      value: function findByUsername(username, callback) {

        if (username in this.itemContainer) {
          callback(this.itemContainer[username]);
          return;
        }
        return corsRequest("https://service.visasq.com/api/v3/users/" + username + "/topics", function () {
          return function (rows) {
            var j = undefined,
                len = undefined,
                row = undefined;
            this.itemContainer[username] = [];
            for (j = 0, len = rows.length; j < len; j++) {
              row = rows[j];
              this.itemContainer[username].push(new Item(row));
            }
            return callback(this.itemContainer[username]);
          };
        });
      }
    }
  });

  return ItemRepository;
})();

corsRequest = function (url, callback) {
  var method = undefined,
      request = undefined;
  method = "get";
  request = new XMLHttpRequest();
  if ("withCredentials" in request) {
    request.open(method, url, true);
  } else if (typeof XDomainRequest !== "undefined") {
    request = new XDomainRequest();
    request.open(method, url);
  } else {
    throw "Failed to initialize CORSRequest";
  }
  request.onload = function () {
    return function () {
      var result = undefined;
      result = JSON.parse(request.response);
      if (request.status < 200 || 300 <= request.status) {
        throw result.error;
      }
      return callback(result);
    };
  };
  return request.send();
};

getElementsByClassName = function (oElm, strTagName, strClassName) {
  var arrElements = undefined,
      arrReturnElements = undefined,
      i = undefined,
      j = undefined,
      oElement = undefined,
      oRegExp = undefined,
      ref = undefined;
  if (strTagName === "*" && oElm.all) {
    arrElements = oElm.all;
  } else {
    arrElements = oElm.getElementsByTagName(strTagName);
  }
  arrReturnElements = [];
  strClassName = strClassName.replace(/\-/g, "\\-");
  oRegExp = new RegExp("(^|\\s)" + strClassName + "(\\s|$)");
  oElement;
  for (i = j = 0, ref = arrElements.length; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
    oElement = arrElements[i];
    if (oElement && oRegExp.test(oElement.className)) {
      arrReturnElements.push(oElement);
    }
  }
  return arrReturnElements;
};

addOnloadHandler = function (newFunction) {
  if (window.addEventListener) {
    return window.addEventListener("load", newFunction, false);
  } else if (window.attachEvent) {
    return window.attachEvent("onload", newFunction);
  }
};

setIframeHeight = function (iframe) {
  var iframeWin = undefined;
  if (iframe) {
    iframeWin = iframe.contentWindow || iframe.contentDocument.parentWindow;
    if (iframeWin.document.body) {
      return iframe.height = iframeWin.document.documentElement.scrollHeight || iframeWin.document.body.scrollHeight;
    }
  }
};

setInnerText = function (element, text) {
  if (typeof element.textContent !== "undefined") {
    return element.textContent = text;
  } else {
    return element.innerText = text;
  }
};

template = "<!DOCTYPE html>\n<html lang=\"ja\">\n<head>\n<meta charset=\"utf-8\" />\n<style type=\"text/css\">\n<!--%css%-->\n</style>\n</head>\n<body>\n<div class=\"bar\">\n    <a href=\"http://qiita.com\" class=\"logo\" target=\"_blank\"></a>\n    <a href=\"\" class=\"user\" id=\"user_url\" target=\"_blank\">\n        <img class=\"avatar\" src=\"#\" id=\"user_avatar\">\n       <span class=\"username\" id=\"user_name\"></span>\n </a>\n</div>\n<div class=\"items\" id=\"items\"></div>\n</body>\n</html>";

main = function () {
  var widgets = undefined;
  widgets = getElementsByClassName(document, "a", "visasq-cards");
  return addOnloadHandler(function () {
    var doc = undefined,
        iframe = undefined,
        itemRepository = undefined,
        itemsBlock = undefined,
        j = undefined,
        len = undefined,
        results = undefined,
        username = undefined,
        widget = undefined;
    results = [];
    for (j = 0, len = widgets.length; j < len; j++) {
      widget = widgets[j];
      username = widget.getAttribute("data-visasq-username");
      iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.setAttribute("frameBorder", "0");
      iframe.style.width = "100%";
      widget.parentNode.appendChild(iframe);
      widget.style.display = "none";
      doc = frames[frames.length - 1].document;
      doc.open();
      doc.write(template);
      doc.close();
      setInnerText(doc.getElementById("user_name"), username);
      itemsBlock = doc.getElementById("items");
      itemRepository = new ItemRepository();
      results.push(itemRepository.findByUsername(username, function (items) {
        var item = undefined,
            itemElement = undefined,
            k = undefined,
            l = undefined,
            len1 = undefined,
            len2 = undefined,
            ref = undefined,
            tag = undefined,
            tagElement = undefined,
            title = undefined;
        if (items.length > 0) {
          doc.getElementById("user_avatar").setAttribute("src", items[0].user.profileImageUrl);
          doc.getElementById("user_url").setAttribute("href", items[0].user.url);
        }
        for (k = 0, len1 = items.length; k < len1; k++) {
          item = items[k];
          itemElement = document.createElement("div");
          itemElement.setAttribute("class", "item");
          title = document.createElement("a");
          setInnerText(title, item.title);
          title.setAttribute("href", item.url);
          title.setAttribute("class", "title");
          title.setAttribute("target", "_blank");
          itemElement.appendChild(title);
          ref = item.tags;
          for (l = 0, len2 = ref.length; l < len2; l++) {
            tag = ref[l];
            tagElement = document.createElement("a");
            setInnerText(tagElement, tag.name);
            tagElement.setAttribute("href", tag.url);
            tagElement.setAttribute("class", "tag");
            tagElement.setAttribute("target", "_blank");
            itemElement.appendChild(tagElement);
          }
          itemsBlock.appendChild(itemElement);
        }
        iframe.style.display = "block";
        return setIframeHeight(iframe);
      }));
    }
    return results;
  });
};

main();