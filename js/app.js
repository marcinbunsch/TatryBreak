var preloadCameras = function () {
  var cameras, images = [], i = 0;

  cameras = [
    { id: 'mo1', src: 'http://kamery.topr.pl/moko/moko_01.jpg', alt: "Morskie Oko" },
    { id: 'mo2', src: 'http://kamery.topr.pl/moko_TPN/moko_02.jpg', alt: "Morskie Oki" },
    { id: 'ps1', src: 'http://kamery.topr.pl/stawy2/stawy2.jpg', alt: "Dolina Pięciu Stawów Polskich" },
    { id: 'ps2', src: 'http://kamery.topr.pl/stawy1/stawy1.jpg', alt: "Dolina Pięciu Stawów Polskich" },
    { id: 'gor', src: 'http://kamery.topr.pl/goryczkowa/gorycz.jpg', alt: "Dolina Gorczykowa" },
    { id: 'cho', src: 'http://kamery.topr.pl/chocholowska/chocholow.jpg', alt: "Polana Chochołowska" }
  ];

  $('<img/>')


  $.each(cameras, function(k,v) {
    images[k]     = new Image();

    $(images[k])
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

    images[k].id  = v.id;
    images[k].src = v.src;
    images[k].alt = v.alt;

    $('#' + v.id).html(images[k]);
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
  var warning = {}, labelHTML = '<a title="Czytaj cały komunikat" href="http://tpn.pl/zwiedzaj/komunikat-lawinowy"><i class="fa fa-info-circle"></i> Stopień zagrożenia lawinowego:</a>';

  $('#tmp').load('http://tpn.pl/zwiedzaj/komunikat-lawinowy .degree', function (response, status, xhr) {
    $('#tmp').html('');

    warning.icon = $(response).find('.avalanche').find('img[src*="avalanche"]');
    warning.icon = labelHTML + ' <img src="http://tpn.pl/themes/' + warning.icon[0].src.split('/themes')[1] + '">';

    appendAvalancheWarning(warning.icon);
  });
};

var appendAvalancheWarning = function (warning) {
  $('#avalanches-warning').html(warning);
};

var getVersion = function () {
  var version = chrome.app.getDetails().version;
  $('#version').html('Version:  <a href="https://chrome.google.com/webstore/detail/tatrrace/mjhjmlmabiniamdimdbalnfeoodcogfl">'+version+'</a>');
};

var shareScreen = function (screen) {
  var canvas, ctx, screenSrc, tmpImage;

  canvas    = document.getElementById('canvas');
  ctx       = canvas.getContext('2d');
  screenSrc = $(screen).find('img').attr('src');

  tmpImage      = document.createElement('img');
  tmpImage.src  = screenSrc;
  tmpImage.onload = function () {
    ctx.drawImage(tmpImage, 0, 0);
  };



};


(function () {
  getVersion();
  preloadCameras();
  loadConditions();
  loadAvalancheWarning();
})();

window.fbAsyncInit = function() {
  FB.init({
    appId      : '1511193279162881',
    xfbml      : true,
    version    : 'v2.2'
  });

  FB.getLoginStatus(function(response) {
    console.log( response.status )
  });
};
