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
                        $('#page').animate({ opacity: 0.35 });
                    },
    onEnd:          function() {
                        $('#page').animate({ opacity: 1 });
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

var loadAvalancheWarning = function () {
  var warning = {};

  $('#tmp').load('http://tpn.pl/zwiedzaj/komunikat-lawinowy .degree', function (response, status, xhr) {
    $('#tmp').html('');

    warning.icon = $(response).find('.avalanche').find('img[src*="avalanche"]');
    warning.icon = '<img src="http://tpn.pl/themes/' + warning.icon[0].src.split('/themes')[1] + '">';

    appendAvalancheWarning(warning.icon);
  });
};

var appendAvalancheWarning = function (warning) {
  $('#avalanches-warning').find('a').html(warning);
};

var getVersion = function () {
  var version = chrome.app.getDetails().version;
  $('#version').html('Version:  <a href="https://chrome.google.com/webstore/detail/tatrrace/mjhjmlmabiniamdimdbalnfeoodcogfl">'+version+'</a>');
};

var getForecast = function () {
  var apiURL, cityID, appID, lang, days;

  apiURL = 'http://api.openweathermap.org/data/2.5/forecast/daily';
  cityID = '3080866'; // Zakopane
  appID  = '8713b46cd91183acd12d67c49c775b1a';
  lang   = 'pl'
  days   = 2;

  var jqxhr = $.ajax({
    type: 'GET',
    url: apiURL,
    data: {
      'id'    : cityID,
      'APPID' : appID,
      'lang'  : lang,
      'cnt'   : days
    }
  });

  jqxhr
    .done(function(response) {
      appendForecast(response.list);
    })
    .fail(function() {

    })
    .always(function() {

    })
  ;
};

var appendForecast = function (forecast) {
  var html = [], iconURL, dayTemp, nightTemp;


  $.each(forecast, function() {
    iconURL   = 'http://openweathermap.org/img/w/' + this.weather[0].icon + '.png';
    tempDay   = this.temp.day;
    tempNight = this.temp.night;

    html[html.length] = '<div class="weather">';
    html[html.length] = '<img src="'+ iconURL +'">';
    html[html.length] = '<span class="temp day">'+ Kelvin2Celcius(tempDay) +' &deg;C</span>';
    html[html.length] = '<span class="temp night">'+ Kelvin2Celcius(tempNight) +' &deg;C</span>';
    html[html.length] = '</div>';
  });

  $('#forecast').append(html.join('\t'));
};

var Kelvin2Celcius = function (deg) {
  return (deg - 273.15).toFixed(0);
};

var init = (function () {
  getVersion();
  preloadCameras();
  loadConditions();
  loadAvalancheWarning();
  getForecast();
})();
