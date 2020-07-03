/**
 * @fileoverview Utility class for ist wetter
 * @authors jona@adeia.de
 */
 
/**
 * @namespace top level namespace. 
 */
window.IW = window.IW || {};



/** 
 * @module Weather fetching
 */
IW.Query = (function(module) 
{
  
  /** 
   * Fetches weather data from open weather
   */
  module.OpenWeather = function(my) 
  { 
    var that;           ///< the OpenWeather object under construction
    
    my   = my || {};    ///< does hold protected attributes shared with child classes
    
    that = {};
    
    that.init = function() {
    }
    
    that.lang = "de";
    that.isWeatherToday = true;
    that.isWeatherTomorrow = true;
    that.textToday = "";
    that.textTomorrow = "";

    that.weatherApiUrl = 'https://api.openweathermap.org/data/2.5/';
    that.API_TOKEN = '43ebcdf780a5cae314ccde1054dac873';

    that.todayText = {
      "de" : "",
      "en" : ""
    };

    that.tomorrowText = {
      "de" : "",
      "en" : ""
    };
    
    that.isWeatherText = {
      "de" : "Aktuell<br/>ist Wetter",
      "en" : "Currently<br/>is weather"
    };
    
    that.isNoWeatherText = {
      "de" : "Aktuell<br/>ist kein Wetter",
      "en" : "Currently<br/>is no weather"
    };
    
    that.isWeatherTomorrowText = {
      "de" : "Morgen<br/>ist Wetter",
      "en" : "Tomorrow<br/>is weather"
    };
    
    that.isNoWeatherTomorrowText = {
      "de" : "Morgen<br/>ist kein Wetter",
      "en" : "Tomorrow<br/>is no weather"
    };
    
    that.atText = {
      "de" : "bei",
      "en" : "at"
    };

    that.curText = {
      "de" : "aktuell",
      "en" : "currently"
    };
    
    that.noWeatherDataFoundText = {
      "de" : "Keine Wetterdaten für den aktuellen Ort gefunden.",
      "en" : "No weather data found for this location."
    };
    
    that.andTomorrowText = {
      "de" : "[...und morgen?]",
      "en" : "[...and tomorrow?]",
    };
    
    that.andTodayText = {
      "de" : "[...und aktuell?]",
      //"de" : "[...und heute?]",
      "en" : "[...and currently?]",
      //"en" : "[...and today?]",
    };
    
    that.wrongKeyText = {
      "de" : "Zugriff nicht erlaubt!",
      "en" : "Access denied!"
    };
    
    that.switchToTomorrow = function() {
      $('#content').html(that.textTomorrow);
      $('body').removeClass('background-sunny');
      $('body').removeClass('background-rainy');
      $('body').removeClass('background-fallback');
      $('body').addClass(that.isWeatherTomorrow ? 'background-sunny' : 'background-rainy');
    };
  
    that.switchToToday = function() {
      $('#content').html(that.textToday);
      $('body').removeClass('background-sunny');
      $('body').removeClass('background-rainy');
      $('body').removeClass('background-fallback');
      $('body').addClass(that.isWeatherToday ? 'background-sunny' : 'background-rainy');
    };
    
    that.urlParam = function(name){
      var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
      if (results == null){
        return null;
      }      
      return results[1] || 0;      
    }
    
    that.getWeatherData = function() {
      that.lang = that.urlParam("lang") || "de";
      var secret = that.urlParam("secret") || 0;
      if (secret === "43522f2893f99a7c9a5e1ccee8a573f8a45e6d06") {
        var lat = that.urlParam("lat") || 47.881417;
        var lon = that.urlParam("lon") || 7.727939;
        // this.getWeatherDataWithLatAndLon(lat, lon, that.gotWeatherData);
        this.getWeatherDataWithLatAndLon(lat, lon, that.gotWeatherDataOpenWeather);
      }
      else {
        this.requestRejected();
      }
    }
    
    that.getWeatherDataWithLatAndLon = function(lat, lon, callback) {
      // lat = Math.round(lat * 100) / 100;
      // lon = Math.round(lon * 100) / 100;
      const url = this.weatherApiUrl + 'forecast?lat=' + lat + '&lon=' + lon + '&APPID=' + this.API_TOKEN;
      $.get(url, function(data) {
        if (callback) {
          callback(data);
        }
      });
    }

    that.gotWeatherData = function(data) {
      var weatherToday = 0;
      var weatherTomorrow = 0;
      var city = "";

      if (data && data.query && data.query.results && data.query.results.channel &&
          data.query.results.channel.item && data.query.results.channel.item.forecast) {
        var condition = data.query.results.channel.item.condition; 
        var forecast = data.query.results.channel.item.forecast;
        if (typeof(condition) !== "undefined") {
          weatherToday = condition;
        }
        // current or forecast???
        /*if (typeof(forecast) !== "undefined" && forecast.length > 0) {
          weatherToday = forecast[0];
        }*/
        if (typeof(forecast) !== "undefined" && forecast.length > 1) {
          weatherTomorrow = forecast[1];
        }
        if (data.query.results.channel.location && data.query.results.channel.location.city) {
          city = data.query.results.channel.location.city;
        }
      }
    
      $('#spinner').remove();
      
      if (weatherToday !== 0) {
        var isWeather = (weatherToday.code >= 29 && weatherToday.code <= 34) || weatherToday.code === 36;
        that.isWeatherToday = isWeather;
        var temperature = (weatherToday.temp - 32) * (5/9);
        //var temperature = (weatherToday.high - 32) * (5/9);
        temperature = Math.round(temperature);
        var text = that.todayText[that.lang];
        text += "<br/>";
        text += isWeather ? that.isWeatherText[that.lang] : that.isNoWeatherText[that.lang];
        text += "<br/>in " + city;
        text += "<br/><br/> " + that.atText[that.lang] + " " + temperature + "°C";
        text += "<br/><br/><br/> <a href='#' onclick='weather.switchToTomorrow()'>" + that.andTomorrowText[that.lang] + "</a>";
        that.textToday = text;
        $('#content').html(text);
        $('body').addClass(isWeather ? 'background-sunny' : 'background-rainy');
      }
      else {
        $('#content').html(that.noWeatherDataFoundText[that.lang]);
        $('body').addClass('background-fallback');
      }
      
      if (weatherTomorrow !== 0) {
        var isWeather = (weatherTomorrow.code >= 29 && weatherTomorrow.code <= 34) || weatherTomorrow.code === 36;
        that.isWeatherTomorrow = isWeather;
        var temperature = (weatherTomorrow.high - 32) * (5/9);
        temperature = Math.round(temperature);
        var text = that.tomorrowText[that.lang];
        text += "<br/>";
        text += isWeather ? that.isWeatherTomorrowText[that.lang] : that.isNoWeatherTomorrowText[that.lang];
        text += "<br/>in " + city;
        text += "<br/><br/> " + that.atText[that.lang] + " " + temperature + "°C";
        text += "<br/><br/><br/> <a href='#' onclick='weather.switchToToday()'>" + that.andTodayText[that.lang] + "</a>";
        that.textTomorrow = text;
      }
      else {
        $('#content-tomorrow').html(that.noWeatherDataFoundText[that.lang]);
      }
    }
    
    that.gotWeatherDataOpenWeather = function(data) {
      var date = new Date();
      var todayString = new Date().toISOString().substring(0, 10);
      date.setDate(date.getDate() + 1);
      var tomorrowString = date.toISOString().substring(0, 10);
      var weatherToday = {};
      var mainToday = null;
      var weatherTomorrow = {};
      var mainTomorrow = null;
      if (data.list && data.list.length > 0) {
        var i = 0;
        for (; i < data.list.length; i++) {
          var item = data.list[i];
          var dt = item.dt_txt || "";
          if (dt.indexOf(todayString + " 15:00:00") !== -1) {
            weatherToday = item.weather || {};
            mainToday = item.main;
          }
          if (dt.indexOf(tomorrowString + " 15:00:00") !== -1) {
            weatherTomorrow = item.weather || {};
            mainTomorrow = item.main;
          }
        }
        if (!mainToday) {
          weatherToday = data.list[0].weather || {};
          mainToday = data.list[0].main;
        }
      }
    
      $('#spinner').remove();
      
      if (weatherToday[0]) {
        var weatherId = weatherToday[0].id;
        var isWeather = weatherId === 800 || weatherId === 801 || weatherId === 802;
        that.isWeatherToday = isWeather;
        var temperature = mainToday ? (mainToday.temp - 273.15) : 0;
        temperature = Math.round(temperature);
        var text = isWeather ? that.isWeatherText[that.lang] : that.isNoWeatherText[that.lang];
        text += "<br/><br/> " + that.atText[that.lang] + " " + temperature + "°C";
        text += "<br/><br/><br/> <a href='#' onclick='weather.switchToTomorrow()'>" + that.andTomorrowText[that.lang] + "</a>";
        that.textToday = text;
        $('#content').html(text);
        $('body').addClass(isWeather ? 'background-sunny' : 'background-rainy');
      }
      else {
        $('#content').html(that.noWeatherDataFoundText[that.lang]);
        $('body').addClass('background-fallback');
      }
      
      if (weatherTomorrow[0]) {
        var weatherId = weatherTomorrow[0].id;
        var isWeather = weatherId === 800 || weatherId === 801 || weatherId === 802;
        that.isWeatherTomorrow = isWeather;
        var temperature = mainTomorrow ? (mainTomorrow.temp - 273.15) : 0;
        temperature = Math.round(temperature);
        var text = isWeather ? that.isWeatherTomorrowText[that.lang] : that.isNoWeatherTomorrowText[that.lang];
        text += "<br/><br/> " + that.atText[that.lang] + " " + temperature + "°C";
        text += "<br/><br/><br/> <a href='#' onclick='weather.switchToToday()'>" + that.andTodayText[that.lang] + "</a>";
        that.textTomorrow = text;
      }
      else {
        $('#content-tomorrow').html(that.noWeatherDataFoundText[that.lang]);
      }
    }
    
    that.requestRejected = function() {
      $('#spinner').remove();
      $('#content').html(that.wrongKeyText[that.lang]);
      $('body').addClass('background-fallback');
    }
  
  return that;
  };
  
  return module;
  
})(IW.Query || {});