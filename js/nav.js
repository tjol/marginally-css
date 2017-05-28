/*
    Copyright (C) 2017 Thomas Jollans

    This file is part of Marginally-CSS.

    Marginally-CSS is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Marginally-CSS is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with Marginally-CSS.  If not, see <http://www.gnu.org/licenses/>.

    Additional permissions under GNU GPL version 3 section 7

    You may convey source or non-source forms of the covered work without the
    copies of the GNU GPL and GNU LGPL normally required by section 4 of the
    GNU GPL and/or section 4 of the GNU LGPL, provided you include this license
    notice.

    You may combine this library with citeproc-js (or a modified version of that
    library), containing parts which are covered by the terms of the Common
    Public Attribution License (CPAL), and convey the resulting work without
    providing the uncombined version of the library normally required by section
    5(a) of the GNU LGPL.
*/


$(document).ready(function() {
    $("#sidebar, #menu-button").addClass("managed-by-script");

    var sidebarMargin = 0;

    $("#menu-button").click(function() {
        if ($("html").hasClass("sidebar-in-view")) {
            $("html").addClass("sidebar-out-of-view")
                     .removeClass("sidebar-in-view")
                     .addClass("animating-sidebar");
            window.setTimeout(function() {
                $("#sidebar").css("margin-top", sidebarMargin);
                $("body").css("width", "");
                $("html").removeClass("sidebar-out-of-view")
                         .removeClass("animating-sidebar");
            }, 500);
        } else {
            sidebarMargin = parseFloat($("#sidebar").css("margin-top"));
            $("#sidebar").css("margin-top", 0);
            $("body").css("width", $("body").width());
            $("html").addClass("sidebar-in-view");
            $("html").addClass("animating-sidebar");
            window.setTimeout(function() {
                $("html").removeClass("animating-sidebar");
            }, 500);
        }

        return false;
    });

    var xDown = null;
    var xUp = null;

    var oldTouchMove = null;

    function handleTouchStart(evt) {
        xDown = evt.touches[0].clientX;
    };                                                

    function handleTouchMove(evt) {
        if (typeof evt.preventDefault != 'undefined' && evt.preventDefault)
            evt.preventDefault();
        xUp = evt.touches[0].clientX;
        return false;
    };

    function handleTouchEnd(evt) {
        
        if ( ! xDown || ! xUp ) {
            xDown = null;
            xUp = null;
            return;
        }

        var xDiff = xDown - xUp;

        xDown = null;
        xUp = null;

        if ( xDiff > 30 ) {
            /* left swipe */ 
            $("#menu-button").click();
            return false;
        } else {
            /* right swipe */
        }

    }

    document.getElementById('sidebar').addEventListener('touchstart', handleTouchStart, false);
    document.getElementById('sidebar').addEventListener('touchmove', handleTouchMove, false);
    document.getElementById('sidebar').addEventListener('touchend', handleTouchEnd, false);
});

$(window).resize(function() {
    if ($("#menu-button").css("display") == "none") {
        $("#sidebar").css("margin-top", 0);
        $("body").css("width", "");
        $("html").removeClass("sidebar-out-of-view")
                 .removeClass("sidebar-in-view")
                 .removeClass("animating-sidebar");
    }
});

