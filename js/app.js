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
    $('.' + k).append('<div class="condition"><i class="wi wi-thermometer"></i> ' + v.temp + ' &deg;C &nbsp;&nbsp; <i class="wi wi-strong-wind"></i> ' + v.wind + 'm/s</div>');
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

var init = (function () {
  getVersion();
  preloadCameras();
  loadConditions();
  loadAvalancheWarning();
})();
