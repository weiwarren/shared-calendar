// Slide Side Bar
$("#menu-toggle, a.navbar-brand.filter-control").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
});

// Checkbox select all function



// Angular Gantt
//var myApp = angular.module('myApp', ['gantt']);



// Google Developer Timeline (https://developers.google.com/chart/interactive/docs/gallery/timeline)

/*
google.setOnLoadCallback(drawChart);

      function drawChart() {
        var container = document.getElementById('timeline');
        var chart = new google.visualization.Timeline(container);
        var dataTable = new google.visualization.DataTable();

        dataTable.addColumn({ type: 'string', id: 'President' });
        dataTable.addColumn({ type: 'date', id: 'Start' });
        dataTable.addColumn({ type: 'date', id: 'End' });
        dataTable.addRows([
          [ 'The Star', new Date(1789, 3, 29), new Date(1797, 2, 3) ],
          [ 'Jupiters',      new Date(1797, 2, 3),  new Date(1801, 2, 3) ],
          [ 'The Treasury',  new Date(1801, 2, 3),  new Date(1809, 2, 3) ]]);

        chart.draw(dataTable);
      }
*/

// Day Pilot Plugin

// Add Event Form

$(document).ready(function(){ 
    $("input[name='occur']#occurance-single").click(function() {
        $("#multiple-event").hide();
        $("#single-event").fadeIn(300);
    });
    $("input[name='occur']#occurance-multi").click(function() {
        $("#single-event").hide();
        $("#multiple-event").fadeIn(300);
    }); 
});


$(".reveal").hide();
$("#add_artwork").click(function() {
    if($(this).is(":checked")) {
        $("#add_art_control.reveal").slideDown(300).animate({opacity: 1}, "fast");
    } else {
        $("#add_art_control.reveal").animate({opacity: 0}, "fast").slideUp(200);
    }
});
$("#entry_time").click(function() {
    if($(this).is(":checked")) {
        $("#entry_time_details.reveal").slideDown(300).animate({opacity: 1}, "fast");
    } else {
        $("#entry_time_details.reveal").animate({opacity: 0}, "fast").slideUp(200);
    }
});

$("#draw_date").click(function() {
    if($(this).is(":checked")) {
        $("#draw_date_details.reveal").slideDown(300).animate({opacity: 1}, "fast");
    } else {
        $("#draw_date_details.reveal").animate({opacity: 0}, "fast").slideUp(200);
    }
});
$("#prize_amount").click(function() {
    if($(this).is(":checked")) {
        $("#prize_amount_details.reveal").slideDown(300).animate({opacity: 1}, "fast");
    } else {
        $("#prize_amount_details.reveal").animate({opacity: 0}, "fast").slideUp(200);
    }
});

$("#vip_event").click(function() {
    if($(this).is(":checked")) {
        $("#vip_event_details.reveal").slideDown(300).animate({opacity: 1}, "fast");
    } else {
        $("#vip_event_details.reveal").animate({opacity: 0}, "fast").slideUp(200);
    }
});

$("#entry_criteria").click(function() {
    if($(this).is(":checked")) {
        $("#entry_criteria_details.reveal").slideDown(300).animate({opacity: 1}, "fast");
    } else {
        $("#entry_criteria_details.reveal").animate({opacity: 0}, "fast").slideUp(200);
    }
});

$("#approved").click(function() {
    if($(this).is(":checked")) {
        $("#approval_warning.alert").addClass("hide").removeClass("show");
    } else {
        $("#approval_warning.alert").addClass("show").removeClass("hide");
    }
});

//$( "#additional_attachment" ).click(function() {
  //$( "#additional_attachment_input.reveal" ).toggle().animate({opacity: 1}, "fast");
// });


$( "a.filter-control" ).click(function() {
  $(this).toggleClass("open");
 });

$('.dropdown.year-selector .dropdown-menu a.navigator').click(function(e) {
        e.stopPropagation();
    });

// INITIALIZE TOOLTIPS 

$(function () {
  $('[data-toggle="tooltip"]').tooltip();
});

