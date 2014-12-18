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
  $('#tmp').load('http://tpn.pl/zwiedzaj/komunikat-lawinowy .degree', function (response, status, xhr) {
    $('#tmp').html('');

    response = $(response).find('p.degree');

    appendAvalancheWarning(response);
  });
};

var appendAvalancheWarning = function (data) {
  var html = [];

  html[html.length] = '<img src="http://tpn.pl/' + data.find('img').attr('src') +'">';
  data.find('img').remove();
  html[html.length] = data.text().replace('zagrożenia lawinowego', '');


  $('#avalanches-warning').find('a').html(html.join('\t'));
};

var getVersion = function () {
  var version = chrome.app.getDetails().version;
  $('#version').html('Version:  <a href="https://chrome.google.com/webstore/detail/tatrrace/mjhjmlmabiniamdimdbalnfeoodcogfl">'+version+'</a>');
};

var getForecast = function () {
  var apiURL, cityID, appID, lang, days;

  apiURL = 'http://www.yr.no/place/Poland/Lesser_Poland/Kasprowy_Wierch/forecast.xml';


  var jqxhr = $.ajax({
    type  : 'GET',
    url   : apiURL
  });

  jqxhr
    .done(function(response) {

      appendForecast(response);

    })
    .fail(function() {

    })
    .always(function() {

    })
  ;
};

var appendForecast = function (forecast) {
  var html = [], forecast, periot, date, nextDate, icon, temp, timeOfDay;

  forecast = $(forecast).find('forecast').find('time');

  $.each(forecast, function(k) {
    periot = $(forecast[k]).attr('period');

    if (periot === '0' || periot === '2') {

      date = $(forecast[k]).attr('from');
      date = date2weekday(date);
      nextDate = $(forecast[k+2]).attr('from');
      nextDate = date2weekday(nextDate);

      icon = $(forecast[k]).find('symbol').attr('var');
      icon = 'http://symbol.yr.no/grafikk/sym/b100/' + icon + '.png';
      temp = $(forecast[k]).find('temperature').attr('value');
      timeOfDay = periot === '0' ? 'noc' : 'dzień';

      if (date === nextDate || k === 1) {
        html[html.length] = '<h4 class="section-header">'+ date +'</h4>';
      }

      html[html.length] = '<div class="weather">';
      html[html.length] =   '<img src="'+ icon +'">';
      html[html.length] =   '<div class="info">';
      html[html.length] =     '<span class="temp">'+ temp +' &deg;C</span>';
      html[html.length] =     '<span class="day-label">' + timeOfDay + '</span>';
      html[html.length] =   '</div>';
      html[html.length] = '</div>';
    }

    if (k > 9) {
      return false;
    }
  });

  $('#forecast').append(html.join('\n'));
};


var date2weekday = function (date) {
  date = new Date(date);

  return getWeekdayName(date.getDay());
};


var getWeekdayName = function (day) {
  var weekday = ['poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota', 'niedziela'];

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
  loadAvalancheWarning();
  getForecast();


  $('#toggle-sidebar').on('click', toggleSidebar);
})();
