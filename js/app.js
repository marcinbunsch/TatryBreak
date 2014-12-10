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
    warning.sign = $(response).find('.avalanche').find('img[src*="avalanche"]');
    warning.sign = 'Stopień zagrożenia lawinowego: <img src="http://tpn.pl/themes/' + warning.sign[0].src.split('/themes')[1] + '">';

    appendAvalancheWarning(warning.sign);
  });
};

var appendAvalancheWarning = function (warning) {
  $('#avalanches-warning').html(warning);
};

loadConditions();
loadAvalancheWarning();
