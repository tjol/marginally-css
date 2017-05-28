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

(function() {
    var scripts = document.getElementsByTagName('script');
    var index = scripts.length - 1;
    var my_script = scripts[index];
    var my_root = my_script.src.replace(/js\/[^/]+\.js$/, '');

    $(document).ready(function() {
        $("body").append("<a href='#' id='toggle_grid_link'>show grid</a>");
        $("#toggle_grid_link").click(function(ev) {
            var style = $("#auto-stylesheet-grid");
            if (style.length) {
                style.remove();
                $(this).text("show grid");
            } else {
                $("head").append("<link rel='stylesheet' href='" + my_root
                                + "css/show-grid.css' id='auto-stylesheet-grid'>");
                $(this).text("hide grid");
            }
            return false;
        });
    });
})();


