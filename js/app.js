var storeData = function (object) {
  chrome.storage.sync.set(object);
};

var restoreData = function (key, callback) {
  chrome.storage.sync.get(key, callback);
};

var isExpired = function (timeFrom, timeTo, expiryTime) {
  return timeTo - timeFrom >= expiryTime;
}

var preloadCameras = function () {
  var cameras, i = 0;

  cameras = [
    { id: 'mo1', src: 'http://kamery.topr.pl/moko/moko_01.jpg', alt: "Morskie Oko" },
    { id: 'mo2', src: 'http://kamery.topr.pl/moko_TPN/moko_02.jpg', alt: "Morskie Oki" },
    { id: 'ps1', src: 'http://kamery.topr.pl/stawy2/stawy2.jpg', alt: "Dolina Pięciu Stawów Polskich" },
    { id: 'ps2', src: 'http://kamery.topr.pl/stawy1/stawy1.jpg', alt: "Dolina Pięciu Stawów Polskich" },
    { id: 'gor', src: 'http://kamery.topr.pl/goryczkowa/gorycz.jpg', alt: "Dolina Gorczykowa" },
    { id: 'cho', src: 'http://kamery.topr.pl/chocholowska/chocholow.jpg', alt: "Polana Chochołowska" }
  ];

  $.each(cameras, function(k,v) {
    var image = new Image(),
        $link = $('<a></a>');

    $(image)
      .load(function() { console.log("Camera's image loaded correctly"); })
      .error(function() {
        console.log("Error loading camera's image");

        $(this)
          .parents('td')
            .first()
              .append('<div class="error"><span>' + v.alt + '</span></div>')
            .end()
          .end()
        .remove();
      });

    image.id  = v.id;
    image.src = v.src;
    image.alt = v.alt;

    $link.attr({ 'href': v.src, 'class': 'zoom'});
    $link.append(image);

    $('#' + v.id).append($link);
  });

  $('.zoom').imageLightbox({
    preloadNext:    false,
    quitOnImgClick: true,
    onStart:        function() {
                        $('#container').animate({ opacity: 0.35 });
                    },
    onEnd:          function() {
                        $('#container').animate({ opacity: 1 });
                    }
  });

};

var loadConditions = function () {
  var url = "http://www.test.tatrynet.pl/pogoda/weatherMiddleware_v1.0/xml/lokalizacje1.xml";

  var degrees = { 'gor': {}, 'ps': {}, 'mo': {} };

  $.ajax({
    url: url,
    dataType: "xml",
    success: function(data) {
      var data = data;

      degrees.gor.temp = $(data).find('#gor').find('temperatura').find('aktualna').text();
      degrees.gor.temp = degrees.gor.temp.length ? degrees.gor.temp : '';

      degrees.gor.wind = $(data).find('#gor').find('wiatr').find('silaAvg').text();
      degrees.gor.wind = degrees.gor.wind.length ? parseFloat( degrees.gor.wind ).toFixed(1) : '';

      degrees.ps.temp  = $(data).find('#ps').find('temperatura').find('aktualna').text();
      degrees.ps.temp  = degrees.ps.temp.length ? degrees.ps.temp : '';

      degrees.ps.wind  = $(data).find('#ps').find('wiatr').find('silaAvg').text();
      degrees.ps.wind  = degrees.ps.wind.length ? parseFloat( degrees.ps.wind ).toFixed(1) : '';

      degrees.mo.temp  = $(data).find('#mo').find('temperatura').find('aktualna').text();
      degrees.mo.temp  = degrees.mo.temp.length ? degrees.mo.temp : '';

      degrees.mo.wind  = $(data).find('#mo').find('wiatr').find('silaAvg').text();
      degrees.mo.wind  = degrees.mo.wind.length ? parseFloat( degrees.mo.wind ).toFixed(1) : '';

      appendTemp(degrees);
    }
  });

};

var appendTemp = function (degrees) {

  $.each(degrees, function (k, v) {
    var degrees, wind;

    degrees = v.temp !== '' ? '<i class="wi wi-thermometer"></i> ' + v.temp + ' <small>&deg;C</small>' : '';
    wind    = v.wind !== '' ? '<i class="wi wi-strong-wind"></i> ' + v.wind + ' <small>m/s</small>' : '';

    $('.' + k).append('<div class="condition">' + degrees + ' ' + wind + '</div>');
  });
};

var fetchAvalancheWarning = function () {
  console.log('Fetch avalanche warning');

  $('#tmp').load('http://tpn.pl/zwiedzaj/komunikat-lawinowy .degree', function (response, status, xhr) {
    var data = {};

    $('#tmp').html('');

    response = $(response).find('p.degree');

    data.icon = response.find('img').attr('src');
    response.find('img').remove();
    data.text = response.text().replace('zagrożenia lawinowego', '');
    data.text = data.text.replace(/\s+/g, ' ');
    data.timestamp = new Date().getTime();

    storeData({ 'avalanche': data });
    appendAvalancheWarning(data);
  });
};


var getAvalancheWarning = function () {
  var data, timestamp, expiredTime;

  data        = {};
  timestamp   = new Date().getTime();
  expiredTime = 2*60*60*1000; // 2 hours

  restoreData('avalanche', function (items) {

    if ( !$.isEmptyObject(items) && !isExpired(items['avalanche'].timestamp, timestamp, expiredTime) ) {
      console.log('Restore avalanche warning');

      data = items['avalanche'];
      appendAvalancheWarning(data)

    } else {
      fetchAvalancheWarning();
    }

  });
};

var appendAvalancheWarning = function (data) {
  var html = [];

  html[html.length] = '<span class="icon">';
  html[html.length] =   '<img src="http://tpn.pl/' + data.icon +'">';
  html[html.length] = '</span>';
  html[html.length] = data.text;


  $('#avalanches-warning').find('a').html(html.join('\t'));
};

var getVersion = function () {
  var version = chrome.app.getDetails().version;
  $('#version').html('Version:  <a href="https://chrome.google.com/webstore/detail/tatrrace/mjhjmlmabiniamdimdbalnfeoodcogfl">'+version+'</a>');
};

var processForecast = function (data, callback) {
  var obj = {}, forecast = [], period, day, temp, icon, timeOfDay, periodsCount;

  periodsCount = 0;

  data = $(data).find('forecast').find('time');

  $.each(data, function(k) {
    period = $(data[k]).attr('period');

    if (period === '0' || period === '2') {

      periodsCount++;

      day       = $(data[k]).attr('from');
      temp      = $(data[k]).find('temperature').attr('value');
      icon      = $(data[k]).find('symbol').attr('var');
      timeOfDay = period === '0' ? 'noc' : 'dzień';

      forecast[forecast.length] = { day: day, temp: temp, icon: icon, timeOfDay: timeOfDay };
    }
  });


  obj.forecast = forecast;
  obj.timestamp = new Date().getTime();

  storeData({ 'forecast': obj });
  appendForecast(obj.forecast);

};

var fetchForecast = function () {
  var apiURL, cityID, appID, lang, days;

  apiURL = 'http://www.yr.no/place/Poland/Lesser_Poland/Kasprowy_Wierch/forecast.xml';

  console.log('Fetch forecast');

  var jqxhr = $.ajax({
    type  : 'GET',
    url   : apiURL
  });

  jqxhr
    .done(processForecast)
    .fail(function() {

    })
    .always(function() {

    })
  ;
};

var getForecast = function () {
  var data, timestamp, expiredTime;

  data        = {};
  timestamp   = new Date().getTime();
  expiredTime = 1*60*60*1000; // 1 hours

  restoreData('forecast', function (items) {

    if ( !$.isEmptyObject(items) && !isExpired(items['forecast'].timestamp, timestamp, expiredTime) ) {
      console.log('Restore forecast');

      data = items['forecast'];
      appendForecast(data.forecast)

    } else {
      fetchForecast();
    }

  });
};

var appendForecast = function (forecast) {
  var html = [], icon, day, nextDay, timeOfDay;

  for (var i = 0, len = forecast.length; i < len; i++ ) {

    icon    = 'http://symbol.yr.no/grafikk/sym/b100/' + forecast[i].icon + '.png';
    day     = date2weekday(forecast[i].day);
    nextDay = forecast[i+1] ? date2weekday(forecast[i+1].day) : 0;

    if (day === nextDay || i === 0) {
      html[html.length] = '<h4 class="weather-header">'+ day +'</h4>';
    }

    html[html.length] = '<div class="weather">';
    html[html.length] =   '<img src="'+ icon +'">';
    html[html.length] =   '<div class="info">';
    html[html.length] =     '<span class="temp">'+ forecast[i].temp +' &deg;C</span>';
    html[html.length] =     '<span class="day-label">' + forecast[i].timeOfDay + '</span>';
    html[html.length] =   '</div>';
    html[html.length] = '</div>';

    if (i > 4 && day != nextDay) { // Limit of 3 days
      break;
    }

  };

  $('#forecast').append(html.join('\n'));
};


var date2weekday = function (date) {
  date = new Date(date);

  return getWeekdayName(date.getDay());
};


var getWeekdayName = function (day) {
  var weekday = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];

  return weekday[day];
};

var toggleSidebar = function () {
  var $button, $page, offset;

  $button = $(this);
  $page   = $('#page');
  offset  = 300;

  if ($button.hasClass('active')) {
    offset = 0;
  }

  $button.toggleClass('active');

  $page.css({
    transform: 'translate3d(-'+offset+'px,0,0)'
  })
};

var init = (function () {
  getVersion();
  preloadCameras();
  loadConditions();
  getAvalancheWarning();
  getForecast();


  $('#toggle-sidebar').on('click', toggleSidebar);
})();
