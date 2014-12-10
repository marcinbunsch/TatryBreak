var preloadCameras = function () {
  var cameras, images = [], i = 0;

  cameras = [
    { id: 'mo1', src: 'http://kamery.topr.pl/moko/moko_01.jpg' },
    { id: 'mo2', src: 'http://kamery.topr.pl/moko_TPN/moko_02.jpg' },
    { id: 'ps1', src: 'http://kamery.topr.pl/stawy2/stawy2.jpg' },
    { id: 'ps2', src: 'http://kamery.topr.pl/stawy1/stawy1.jpg' },
    { id: 'gor', src: 'http://kamery.topr.pl/goryczkowa/gorycz.jpg' },
    { id: 'cho', src: 'http://kamery.topr.pl/chocholowska/chocholow.jpg' }
  ];

  $.each(cameras, function(k,v) {
    images[k]     = new Image();
    images[k].id  = v.id;
    images[k].src = v.src;

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
      degrees.gor.wind = $(data).find('#gor').find('wiatr').find('silaMax').text();

      degrees.ps.temp  = $(data).find('#ps').find('temperatura').find('aktualna').text();
      degrees.ps.wind  = $(data).find('#ps').find('wiatr').find('silaMax').text();

      degrees.mo.temp  = $(data).find('#mo').find('temperatura').find('aktualna').text();
      degrees.mo.wind  = $(data).find('#mo').find('wiatr').find('silaMax').text();

      appendTemp(degrees);
    }
  });

};

var appendTemp = function (degrees) {
  $.each(degrees, function (k, v) {
    $('.' + k).append('<div class="condition"><i class="wi wi-thermometer"></i> ' + v.temp + ' °C &nbsp;&nbsp; <i class="wi wi-strong-wind"></i> ' + v.wind + 'm/s</div>');
  });
};

var loadAvalancheWarning = function () {
  var warning = {};

  $('#tmp').load('http://tpn.pl/zwiedzaj/komunikat-lawinowy .degree', function (response, status, xhr) {
    $('#tmp').html('');

    warning.sign = $(response).find('.avalanche').find('img[src*="avalanche"]');
    warning.sign = 'Stopień zagrożenia lawinowego: <img src="http://tpn.pl/themes/' + warning.sign[0].src.split('/themes')[1] + '">';

    appendAvalancheWarning(warning.sign);
  });
};

var appendAvalancheWarning = function (warning) {
  $('#avalanches-warning').html(warning);
};

var init = (function () {
  preloadCameras();
  loadConditions();
  loadAvalancheWarning();
})();
