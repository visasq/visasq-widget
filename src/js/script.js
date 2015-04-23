(function () {

let addOnloadHandler, corsRequest, getElementsByClassName, main, setIframeHeight, setInnerText, template;

const BASE_URL = 'https://service.visasq.com/';
const TOPICS_PATH = 'topics';
const USERS_PATH = 'users';
const API_PATH = 'api/v3/';
const CSS_PATH = 'https://rawgithub.com/visasq/visasq-widget/master/dist/css/styles.css';
const LIB_PATH = 'https://rawgithub.com/visasq/visasq-widget/master/dist/js/lib.js';
template = `
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8" />
<link rel="stylesheet" href="${CSS_PATH}">
<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css">
<script async src="${LIB_PATH}"></script>
</head>
<body>

<div class="card--widget">
  <div id="carousel" class="carousel slide carousel-fade">
    <div id="header">
      <a class="carousel-control left" href="#carousel" data-slide="prev"><i class="fa fa-angle-left"></i></a>
      <a href="https://service.visasq.com/" target="_blank"><img src="https://rawgithub.com/visasq/visasq-widget/master/assets/img/logo.png" /></a>
      <a class="carousel-control right" href="#carousel" data-slide="next"><i class="fa fa-angle-right"></i></a>
    </div>
    <ol id="indicators" class="carousel-indicators"></ol>
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
    this.url = `${BASE_URL}${TOPICS_PATH}/${id}`;
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
    this.url = `${BASE_URL}${USERS_PATH}/${id}`
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

main = function(){

  let widget;
  widget = $('a.visasq-cards');
  let doc, iframe, itemRepository, itemsBlock, results, userid, username, header, width, color;
  username =  widget.data().visasqUsername;
  userid = widget.data().visasqUserid;
  width = widget.attr('width');
  color = widget.attr('color');
  iframe = $('<iframe>', {
    frameBorder: '0'
  });
  iframe.hide();
  iframe.width(width);
  iframe.appendTo(widget.parent());
  widget.hide();

  doc = frames[frames.length - 1].document;
  doc.open();
  doc.write(template);
  doc.close();  

  itemsBlock = $('#items', doc);
  itemRepository = new ItemRepository();

  header = $('#header');
  header.css("background-color", color);

  itemRepository.load(userid, username, function(items) {
    let item, itemType, id, itemLink, url, itemElement, logo, info;

    items.forEach((item) => {

      itemLink = $('<a>', {
        target: '_blank',
        href: item.url
        }).appendTo(itemsBlock);

      itemElement = $('<div>').appendTo(itemLink);

      info = $('<div>',{
        class: 'info'
      }).appendTo(itemElement); 

      if (item.__class__ === 'User') {

        itemLink.attr('class', 'item active card--user--widget');

        let imageUrl = item.imageUrl,
        userImage, text, name, job, companyName,
        title, description, end, button;

        userImage = $('<div>', {
          class: 'user-img--s'
        });
        userImage.css('background-image', 'url(' + imageUrl + ')');
        userImage.appendTo(info);

        text = $('<div>', {
          class: 'text'
        }).appendTo(info);

        name = $('<h4>', {
          class: 'title',
          text: item.displayName
        }).appendTo(text);

        job = $('<p>', {
          class: 'job'
        }).appendTo(text);

        companyName = $('<span>', {
          text: item.companyName
        }).appendTo(job);

        title = $('<span>',{
          text: item.title
        }).appendTo(job);

        description = $('<p>', {
          class: 'descript',
          text: item.description
        }).appendTo(text);

        end = $('<div>', {
          class: 'end'
        }).appendTo(itemElement);

        button = $('<a>', {
          class: 'button',
          text: 'ビザスクで相談'
        });
        button.css("background-color", color);
        button.appendTo(end);

        } else if(item.__class__ === 'Topic') {

          let imageUrl = item.imageUrl,
          text, title, description, price, priceIcon,
          bottom, liked, likedStar, likedCount, divider,
          userImage, name, end, button;

          itemLink.attr('class', 'item card--topic--widget');

          text = $('<div>', {
            class: 'text'
          }).appendTo(info);

          title = $('<h4>',{
            class: 'title',
            title: item.title
          }).appendTo(text);

          description = $('<p>',{
            class: 'descript',
            text: item.description
          }).appendTo(text);

          priceIcon = $('<img>',{
            class: 'price-icon',
            src: 'https://rawgithub.com/visasq/visasq-widget/master/assets/img/yen.png'
          }).appendTo(info);

          price = $('<span>', {
            class: 'price'
          });
          if (item.blankPrice) {
            price.text("問い合わせ");
          } else {
            price.text(item.price + " 〜");
          }
          price.appendTo(info);

          bottom = $('<div>', {
            class: 'bottom'
          }).appendTo(itemElement);

          liked = $('<div>', {
            class: 'liked'
          }).appendTo(bottom);

          likedStar = $('<div>', {
            class: 'fa fa-star'
          }).appendTo(liked);
          
          likedCount = $('<div>', {
            class: 'like_count',
            text: item.likes
          }).appendTo(liked);

          divider = $('<div>', {
            class: 'divider user'
          }).appendTo(bottom);

          userImage = $('<div>', {
              class: 'user-img--min'
          });
          userImage.css('background-image', 'url(' + imageUrl + ')');
          userImage.appendTo(bottom);

          name = $('<div>', {
            class: 'name',
            text: item.displayName
          }).appendTo(itemElement);

          end = $('<div>', {
            class: 'end'
          }).appendTo(itemElement);

          button = $('<a>', {
            class: 'button',
            text: 'ビザスクで相談'
          });
          button.css("background-color", color);
          button.appendTo(end);

        }
      });
    
    iframe.show();
    setTimeout(() => {
      iframe.load(function() {
        $(this).height( $(this).contents().find("body").height() );
      });
        $('.carousel', doc.body).carousel({
          interval: 3000
        })
    }, 50)

  });

}
  
$(document).ready(function(){main()})

})();