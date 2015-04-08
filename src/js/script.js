let addOnloadHandler, corsRequest, getElementsByClassName, main, setIframeHeight, setInnerText, template;

const BASE_URL = 'https://service.visasq.com/';
const TOPICS_PATH = 'topics';
const USERS_PATH = 'users';
const API_PATH = 'api/v3/';
const CSS_PATH = 'https://rawgithub.com/visasq/visasq-widget/dist/css/styles.css';

template = `
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8" />
<link rel="stylesheet" href="${CSS_PATH}">
<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css">
</head>
<body>

<div class="card--widget">
  <div class="card--header">
    <a class="carousel-control left" href="#carousel" data-slide="prev"><i class="fa fa-angle-left"></i></a>
    <a href="https://service.visasq.com/" target="_blank"><img src="https://rawgithub.com/visasq/visasq-widget/master/assets/img/logo.png" /></a>
    <a class="carousel-control right" href="#carousel" data-slide="next"><i class="fa fa-angle-right"></i></a>
  </div>
  <div id="carousel" class="carousel slide carousel-fade">
    <!-- Carousel items -->
    <div class="items carousel-inner" id="items"></div>
  </div>
</div>

</body>
</html>
`;



class ItemRepository {
  constructor() {
    this.itemContainer = {};
  }
  load(userid, username, callback) {
    if (username in this.itemContainer) {
      callback(this.itemContainer[username]);
      return;
    }

    return corsRequest(`${BASE_URL}${API_PATH}${USERS_PATH}/${userid}`, (user) => {
      this.itemContainer[username] = [];
      this.itemContainer[username].push(new User(user.result));
      return corsRequest(`${BASE_URL}${API_PATH}${USERS_PATH}/${userid}/${TOPICS_PATH}`, (topics) => {
        topics.forEach((topic) => {
          this.itemContainer[username].push(new Topic(topic));
        });
        return callback(this.itemContainer[username]);
      });
    });
  }
}

class Topic {
  constructor(item) {
    this.__class__ = 'Topic';
    let id = item.id;
    this.title = item.title;
    this.description = item.description;
    this.blankPrice = item.blank_price;
    this.price = item.price;
    this.likes = item.likes;
    this.imageUrl = item.author.image_url;
    this.displayName = item.author.display_name;
    this.url = `${BASE_URL}${USERS_PATH}/${id}`;
  }
}

class User {
  constructor(item) {
    this.__class__ = 'User';
    let id = item.id;
    this.description = item.description;
    this.imageUrl = item.image_url;
    this.displayName = item.display_name;
    this.companyName = item.positions[0].company_name;
    this.title = item.positions[0].title;
    this.url = `${BASE_URL}${TOPICS_PATH}/${id}`
  }
}

corsRequest = function(url, callback) {
  let method, request;
  method = 'get';
  request = new XMLHttpRequest();
  if ("withCredentials" in request) {
    request.open(method, url, true);
  } else if (typeof XDomainRequest !== "undefined") {
    request = new XDomainRequest();
    request.open(method, url);
  } else {
    throw "Failed to initialize CORSRequest";
  }
  request.onload = function(result) {
    let result;
    result = JSON.parse(request.response);
    if (request.status < 200 || 300 <= request.status) {
      throw result.error;
    }
    return callback(result);
  };
  return request.send();
};

getElementsByClassName = function(oElm, strTagName, strClassName) {
  let arrElements, arrReturnElements, i, j, oElement, oRegExp, ref;
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

addOnloadHandler = function(newFunction) {
  if (window.addEventListener) {
    return window.addEventListener('load', newFunction, false);
  } else if (window.attachEvent) {
    return window.attachEvent('onload', newFunction);
  }
};

setIframeHeight = function(iframe) {
  let iframeWin;
  if (iframe) {
    iframeWin = iframe.contentWindow || iframe.contentDocument.parentWindow;
    if (iframeWin.document.body) {
      return iframe.height = iframeWin.document.documentElement.scrollHeight || iframeWin.document.body.scrollHeight;
    }
  }
};

setInnerText = function(element, text) {
  if (typeof element.textContent !== "undefined") {
    return element.textContent = text;
  } else {
    return element.innerText = text;
  }
};

main = function() {
  let widgets;
  widgets = getElementsByClassName(document, 'a', 'visasq-cards');
  return addOnloadHandler(function() {
    let doc, iframe, itemRepository, itemsBlock, results, userid, username, widget;
    results = [];

    widgets.forEach((widget) => {

      username = widget.getAttribute('data-visasq-username');
      userid = widget.getAttribute('data-visasq-userid');
      iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.setAttribute("frameBorder", "0");
      iframe.style.width = '100%';
      widget.parentNode.appendChild(iframe);
      widget.style.display = 'none';
      doc = frames[frames.length - 1].document;
      doc.open();
      doc.write(template);
      doc.close();
      itemsBlock = doc.getElementById('items');
      itemRepository = new ItemRepository();

      results.push(itemRepository.load(userid, username, function(items) {
        let item, itemType, id, itemLink, url, itemElement, logo, info;

        items.forEach((item) => {

          itemLink = document.createElement('a');
          itemLink.setAttribute('target', '_blank');
          itemLink.setAttribute('href', item.url);
          itemsBlock.appendChild(itemLink);

          itemElement = document.createElement('div');
          itemLink.appendChild(itemElement);

          info = document.createElement('div');
          info.setAttribute('class', 'info');
          itemElement.appendChild(info);

          if (item.__class__ === 'User') {

            itemLink.setAttribute('class', 'item active card--user--widget');

            let imageUrl = item.imageUrl,
                userImage, text, name, job, companyName,
                title, description, end, button;

            userImage = document.createElement('div');
            userImage.setAttribute('class', 'user-img--s');
            userImage.setAttribute('style', `background-image:url("${imageUrl}")`);
            info.appendChild(userImage);

            text = document.createElement('div');
            text.setAttribute('class', 'text');
            info.appendChild(text);

              name = document.createElement('h4');
              setInnerText(name, item.displayName);
              name.setAttribute('class', 'title');
              text.appendChild(name);

              job = document.createElement('p');
              job.setAttribute('class', 'job');
              text.appendChild(job);

                companyName = document.createElement('span');
                setInnerText(companyName, item.companyName);
                job.appendChild(companyName);

                title = document.createElement('span');
                setInnerText(title, item.title);
                job.appendChild(title);

              description = document.createElement('p');
              setInnerText(description, item.description);
              description.setAttribute('class', 'descript');
              text.appendChild(description);

            end = document.createElement('div');
            end.setAttribute('class', 'end');
            itemElement.appendChild(end);

              button = document.createElement('a');
              button.setAttribute('class', 'button_blue');
              setInnerText(button, 'ビザスクで相談');
              end.appendChild(button);

          } else if(item.__class__ === 'Topic') {

            let imageUrl = item.imageUrl,
                text, title, description, price, priceIcon,
                bottom, liked, likedStar, likedCount, divider,
                userImage, name, end, button;

            itemLink.setAttribute('class', 'item card--topic--widget');

            text = document.createElement('div');
            text.setAttribute('class', 'text');
            info.appendChild(text);

              title = document.createElement('h4');
              setInnerText(title, item.title);
              title.setAttribute('class', 'title');
              text.appendChild(title);

              description = document.createElement('p');
              setInnerText(description, item.description);
              description.setAttribute('class', 'descript');
              text.appendChild(description);

            priceIcon = document.createElement('img');
            priceIcon.setAttribute('src', 'https://rawgithub.com/visasq/visasq-widget/master/assets/img/yen.png');
            priceIcon.setAttribute('class', 'price-icon');
            info.appendChild(priceIcon);

            price = document.createElement('span');
            price.setAttribute('class', 'price');
            if (item.blankPrice) {
              setInnerText(price, "問い合わせ");
            } else {
              setInnerText(price, item.price + " 〜");
            }
            price.setAttribute('class', 'price');
            info.appendChild(price);

            bottom = document.createElement('div');
            bottom.setAttribute('class', 'bottom');
            itemElement.appendChild(bottom);

              liked = document.createElement('div');
              liked.setAttribute('class', 'liked');
              bottom.appendChild(liked);

                likedStar = document.createElement('div');
                likedStar.setAttribute('class', 'fa fa-star');
                liked.appendChild(likedStar);

                likedCount = document.createElement('div');
                likedCount.setAttribute('class', 'like_count');
                setInnerText(likedCount, item.likes);
                liked.appendChild(likedCount);

              divider = document.createElement('div');
              divider.setAttribute('class', 'divider user');
              bottom.appendChild(divider);

              userImage = document.createElement('div');
              userImage.setAttribute('class', 'user-img--min');
              userImage.setAttribute('style', `background-image:url("${imageUrl}")`);
              bottom.appendChild(userImage);

            name = document.createElement('div');
            setInnerText(name, item.displayName);
            name.setAttribute('class', 'name');
            itemElement.appendChild(name);

            end = document.createElement('div');
            end.setAttribute('class', 'end');
            itemElement.appendChild(end);

              button = document.createElement('a');
              button.setAttribute('class', 'button_blue');
              setInnerText(button, 'ビザスクで相談');
              end.appendChild(button);

          }

        });

        iframe.style.display = 'block';

        setIframeHeight(iframe);

        setTimeout(() => {

          $('.carousel').carousel({
            interval: 2000
          })

        }, 2000)

      }));

    });

    return results;
  });
};

main();
