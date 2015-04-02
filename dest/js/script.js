"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var addOnloadHandler = undefined,
    corsRequest = undefined,
    getElementsByClassName = undefined,
    main = undefined,
    setIframeHeight = undefined,
    setInnerText = undefined,
    template = undefined;

// const BASE_URL = 'https://service.visasq.com/';
var BASE_URL = "http://localhost:8080/";
var TOPICS_PATH = "topics";
var USERS_PATH = "users";
var API_PATH = "api/v3/";

var ItemRepository = (function () {
  function ItemRepository() {
    _classCallCheck(this, ItemRepository);

    this.itemContainer = {};
  }

  _createClass(ItemRepository, {
    load: {
      value: function load(userid, username, callback) {
        var _this = this;

        if (username in this.itemContainer) {
          callback(this.itemContainer[username]);
          return;
        }
        return corsRequest("" + BASE_URL + "" + API_PATH + "" + USERS_PATH + "/" + userid, function (user) {
          _this.itemContainer[username] = [];
          _this.itemContainer[username].push(new User(user.result));
          return corsRequest("" + BASE_URL + "" + API_PATH + "" + USERS_PATH + "/" + userid + "/" + TOPICS_PATH, function (topics) {
            topics.map(function (topic) {
              _this.itemContainer[username].push(new Topic(topic));
            });
            return callback(_this.itemContainer[username]);
          });
        });
      }
    }
  });

  return ItemRepository;
})();

var Topic = function Topic(item) {
  _classCallCheck(this, Topic);

  this.__class__ = "Topic";
  var id = item.id;
  this.title = item.title;
  this.description = item.description;
  this.blankPrice = item.blank_price;
  this.price = item.price;
  this.imageUrl = item.author.image_url;
  this.displayName = item.author.display_name;
  this.url = "" + BASE_URL + "" + USERS_PATH + "/" + id;
};

var User = function User(item) {
  _classCallCheck(this, User);

  this.__class__ = "User";
  var id = item.id;
  this.description = item.description;
  this.imageUrl = item.image_url;
  this.displayName = item.display_name;
  this.companyName = item.positions[0].company_name;
  this.title = item.positions[0].title;
  this.url = "" + BASE_URL + "" + TOPICS_PATH + "/" + id;
};

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
  request.onload = function (result) {
    var result = undefined;
    result = JSON.parse(request.response);
    if (request.status < 200 || 300 <= request.status) {
      throw result.error;
    }
    return callback(result);
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

template = "\n<!DOCTYPE html>\n<html lang=\"ja\">\n<head>\n<meta charset=\"utf-8\" />\n<style type=\"text/css\">\n<!--%css%-->\n</style>\n</head>\n<body>\n<div class=\"items\" id=\"items\"></div>\n</body>\n</html>\n";

main = function () {
  var widgets = undefined;
  widgets = getElementsByClassName(document, "a", "visasq-cards");
  return addOnloadHandler(function () {
    var doc = undefined,
        iframe = undefined,
        itemRepository = undefined,
        itemsBlock = undefined,
        results = undefined,
        userid = undefined,
        username = undefined,
        widget = undefined;
    results = [];

    widgets.map(function (widget) {

      username = widget.getAttribute("data-visasq-username");
      userid = widget.getAttribute("data-visasq-userid");
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
      itemsBlock = doc.getElementById("items");
      itemRepository = new ItemRepository();

      results.push(itemRepository.load(userid, username, function (items) {
        var item = undefined,
            itemElement = undefined,
            header = undefined,
            logo = undefined,
            info = undefined,
            end = undefined;

        items.map(function (item) {
          itemElement = document.createElement("div");

          header = document.createElement("div");
          header.setAttribute("class", "card--header");
          itemElement.appendChild(header);

          logo = document.createElement("div");
          logo.setAttribute("class", "icon-logo");
          itemElement.appendChild(logo);

          info = document.createElement("div");
          info.setAttribute("class", "info");
          itemElement.appendChild(info);

          if (item.__class__ === "User") {

            itemElement.setAttribute("class", "card--user--widget");

            var imageUrl = item.imageUrl,
                userImage = undefined,
                text = undefined,
                _name = undefined,
                job = undefined,
                companyName = undefined,
                title = undefined,
                description = undefined,
                _end = undefined,
                button = undefined;

            userImage = document.createElement("div");
            userImage.setAttribute("class", "user-img--s");
            userImage.setAttribute("style", "background-image:url(\"" + imageUrl + "\")");
            info.appendChild(userImage);

            text = document.createElement("div");
            text.setAttribute("class", "text");
            info.appendChild(text);

            _name = document.createElement("h4");
            setInnerText(_name, item.displayName);
            _name.setAttribute("class", "title");
            text.appendChild(_name);

            job = document.createElement("p");
            job.setAttribute("class", "job");
            text.appendChild(job);

            companyName = document.createElement("span");
            setInnerText(companyName, item.companyName);
            job.appendChild(companyName);

            title = document.createElement("span");
            setInnerText(title, item.title);
            job.appendChild(title);

            description = document.createElement("p");
            setInnerText(description, item.description);
            text.setAttribute("class", "descript");
            text.appendChild(description);

            _end = document.createElement("div");
            _end.setAttribute("class", "end");
            itemElement.appendChild(_end);

            button = document.createElement("a");
            button.setAttribute("class", "button_blue");
            setInnerText(button, "ビザスクで相談");
            _end.appendChild(button);
          } else if (item.__class__ === "Topic") {

            var imageUrl = item.imageUrl,
                text = undefined,
                title = undefined,
                description = undefined,
                price = undefined,
                priceIcon = undefined,
                bottom = undefined,
                liked = undefined,
                likedStar = undefined,
                likedCount = undefined,
                divider = undefined,
                userImage = undefined,
                _name2 = undefined,
                _end2 = undefined,
                button = undefined;

            itemElement.setAttribute("class", "topic_item");

            text = document.createElement("div");
            text.setAttribute("class", "text");
            info.appendChild(text);

            title = document.createElement("h4");
            setInnerText(title, item.title);
            text.setAttribute("class", "title");
            text.appendChild(title);

            description = document.createElement("p");
            setInnerText(description, item.description);
            text.setAttribute("class", "descript");
            text.appendChild(description);

            price = document.createElement("span");
            price.setAttribute("class", "price");
            info.appendChild(price);

            priceIcon = document.createElement("i");
            priceIcon.setAttribute("class", "icon-money_e");
            price.appendChild(priceIcon);

            bottom = document.createElement("div");
            bottom.setAttribute("class", "bottom");
            itemElement.appendChild(bottom);

            liked = document.createElement("div");
            liked.setAttribute("class", "liked");
            bottom.appendChild(liked);

            likedStar = document.createElement("div");
            likedStar.setAttribute("class", "fa fa-star");
            liked.appendChild(likedStar);

            likedCount = document.createElement("div");
            likedCount.setAttribute("class", "like_count");
            liked.appendChild(likedCount);

            divider = document.createElement("div");
            divider.setAttribute("class", "divider user");
            bottom.appendChild(divider);

            userImage = document.createElement("div");
            userImage.setAttribute("class", "user-img--s");
            userImage.setAttribute("style", "background-image:url(\"" + imageUrl + "\")");
            info.appendChild(userImage);

            _name2 = document.createElement("div");
            setInnerText(_name2, item.displayName);
            _name2.setAttribute("class", "name");
            itemElement.appendChild(_name2);

            _end2 = document.createElement("div");
            _end2.setAttribute("class", "end");
            itemElement.appendChild(_end2);

            button = document.createElement("a");
            button.setAttribute("class", "button_blue");
            setInnerText(button, "ビザスクで相談");
            _end2.appendChild(button);
          }

          itemsBlock.appendChild(itemElement);
        });

        iframe.style.display = "block";
        return setIframeHeight(iframe);
      }));
    });

    return results;
  });
};

main();