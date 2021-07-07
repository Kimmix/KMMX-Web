$(window).on('beforeunload', function () {
  $('body').hide();
  $(window).scrollTop(0);
});