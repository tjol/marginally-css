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

function reconstructAsideBottomHere() {
    // aside.bottom-here is great, but CSS transform is NOT the way to do it.
    // It leaves a placeholder in the stack of floats that ruins everything.
    // Use margin-top!
    if ($("aside").css("float") != "right") {
        $("aside.bottom-here-js").each(function(i, elem) {
            $(elem).removeClass("bottom-here-js")
                   .addClass("bottom-here")
                   .css("margin-top", "");
        });
    } else {
        var em = parseFloat($("body").css("font-size"));
        $("aside.bottom-here").each(function(i, elem) {
            $(elem).removeClass("bottom-here")
                   .addClass("bottom-here-js")
                   .css("margin-top", (1.5 * em)-$(elem).height());
        });
    }
}

function enforceRhythm() {
    var em = parseFloat($("body").css("font-size"));
    // This checks whether we are in three column mode
    if ($("aside").css("float") != "right") return;

    function moveIfNeeded(idx, elem) {
        var discrepancy = $(elem).offset().top % (1.5 * em);
        var margin = parseFloat($(elem).css("margin-top"));
        if (discrepancy < 1) {
            return;
        } else if (discrepancy < 0.25 & em
                  || discrepancy < margin / 3) {
            margin -= discrepancy;
            $(elem).css("margin-top", margin);
        } else {
            margin += (1.5 * em) - discrepancy;
            $(elem).css("margin-top", margin);
        }
        
    }
    $("section > *").each(moveIfNeeded);
    $("article > *").each(moveIfNeeded);
    $("main > *").each(moveIfNeeded);
    $("body > *").each(moveIfNeeded);
    $("figure > *").each(moveIfNeeded);  
}

function lockAsidesToPara() {
    // This checks whether we are in three column mode
    if ($("aside").css("float") != "right") return;

    var em = parseFloat($("body").css("font-size"));

    var anchorPoints = new Array();

    $("section > p, article > p, main > p, body > p").each(
        function(i, elem) {
            anchorPoints.push($(elem).offset().top);
        });

    $("aside").each(function(i, elem) {
        var top = $(elem).offset().top;
        for (var i = 0, len = anchorPoints.length; i < len; ++i) {
            var diff_lines = Math.round((top - anchorPoints[i]) / (1.5 * em));
            if (Math.abs(diff_lines) == 1) {
                var my_margin = parseFloat($(elem).css("margin-top"));
                $(elem).css({
                    "margin-top": my_margin - diff_lines * 1.5 * em,
                });
                break;
            } else if (anchorPoints[i] > top) {
                break;
            }
        }
    });
}

function deOverlap(my_aside) {
    var em = parseFloat($("body").css("font-size"));
    var my_top = $(my_aside).offset().top;
    var my_bottom = my_top + $(my_aside).height();

    // This checks whether we are in three column mode
    if ($("aside").css("float") != "right") return;

    var past_me = false;

    $("aside").each(function(i, elem) {
        if ($(elem).is(my_aside)) {
            past_me = true;
            return true; // continue
        }

        var top = $(elem).offset().top - 1.5 * em;
        var bottom = top + $(elem).outerHeight() + 1.5 * em;

        if (my_top > top && my_top < bottom) {
            if (past_me) {
                $(my_aside).detach().insertAfter(elem);
                deOverlap(my_aside);
                return false;
            }

            var new_top = 1.5 * em * Math.round(bottom / (1.5 * em));
            var diff = new_top - my_top;
            my_top = new_top;
            var my_margin = parseFloat($(my_aside).css("margin-top"));
            $(my_aside).css({
                "margin-top": my_margin + diff,
            });
            $(my_aside).addClass("_has_been_moved");
        }

    });
}

function undoMovements() {
    $("aside._has_been_moved").css("margin-top", "")
                              .removeClass("_has_been_moved");
}

function fixVideoHeight() {
    var em = parseFloat($("body").css("font-size"));
    $("iframe.video").each(function(i, elem) {
        var new_height = $(elem).width() / 16.0 * 9;
        // round to the next line-height
        new_height = 1.5 * em * Math.ceil(new_height / (1.5 * em));

        $(elem).height(new_height);
    });
}

$(document).ready(function () {
    $("aside").each(function(i, elem) {
        deOverlap(elem);
    });
})

$(window).on("load", function() {
    reconstructAsideBottomHere();
    fixVideoHeight();
    enforceRhythm();
    undoMovements();
    lockAsidesToPara();
    $("aside").each(function(i, elem) {
        deOverlap(elem);
    });
});

$(window).resize(function() {
    reconstructAsideBottomHere();
    fixVideoHeight();
    enforceRhythm();
    undoMovements();
    lockAsidesToPara();
    $("aside").each(function(i, elem) {
        deOverlap(elem);
    });
});
