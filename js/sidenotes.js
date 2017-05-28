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


var sidenotes_config = {
    csl_style: 'elsevier-without-titles',
    csl_locales_location: 'https://raw.githubusercontent.com/Juris-M/citeproc-js-docs/master/',
    csl_location: 'https://raw.githubusercontent.com/citation-style-language/styles/master/'
}


function foreachSidenote (callback) {
    $("a.sidenote").each(function(i, elem) {
        var href = $(elem).attr("href");
        var m = href.match(/^#(.*)$/);
        if (m != null) {
            var sidenote = document.getElementById(m[1]);
            if (sidenote.tagName.toLowerCase() == "aside"
                && $(sidenote).hasClass("sidenote")) {

                callback(elem, sidenote);

            }
        }
    });
}

function moveSideNotes () {

    $("aside.sidenote").each(function(i, elem) {
        $(elem).css("margin-top", "0");
    });

    var em = parseFloat($("body").css("font-size"));
    // This checks whether we are in three column mode
    if ($("aside").css("float") != "right") {
        if ($("#footnotes").length) {
            var footnotebox = $("#footnotes");
            $(":not(#footnotes) > aside.sidenote").each(
                function(idx, sidenote) {
                    // Turn the sidenotes into footnotes.
                    $(sidenote).before(
                        "<span class='_sidenote_placeholder'" +
                        " data-sidenote='" + sidenote.id + "'></span>");
                    $(sidenote).detach();
                    footnotebox.append(sidenote);
                });
        }

        return;
    } else {
        $("span._sidenote_placeholder").each(function(idx, placeholder) {
            sidenote = document.getElementById(
                            placeholder.getAttribute("data-sidenote"));
            $(sidenote).detach();
            $(placeholder).replaceWith(sidenote);
        });
    }

    foreachSidenote(function(number, sidenote) {
        // We'll want to move this <aside> up to meet the <a>
        var label_offset = $(number).offset().top;
        var sidenote_offset = $(sidenote).offset().top;
        sidenote_offset += parseFloat($(sidenote).css("padding-top"));
        var diff = sidenote_offset - label_offset;
        var lines = Math.round(diff / (1.5 * em));
        $(sidenote).css("margin-top", "-" + (1.5 * lines) + "rem");

        // defined in beauty.js
        deOverlap(sidenote);
    });
}

function initSideNote (number, sidenote) {
    function attention(e) {
        var is_hover = (e.type != "click");

        if (this != e.target && /^(a|button|input)$/i.test(e.target.tagName)
                             && !is_hover) return;

        if (this == sidenote && $(sidenote).css("position") != "fixed"
                             && $(sidenote).css("float") != "right") {
            // This sidenote is an inactive footnote, and should not be
            // activated on click - only activate footnotes if the number
            // is clicked.
            return;
        }

        if (is_hover) {
            if ($(sidenote).css("float") != "right") {
                // Sidenotes are endnotes; hover is disabled.
                return;
            }

            if ($(sidenote).hasClass("attention")) {
                // my sidenote is active!
                if ($(sidenote).hasClass("_activated_by_click")) {
                    // don't change anything done by clicking without
                    // clicking.
                    return;
                } else if (e.type == "mouseover") {
                    return;
                }
            } else {
                // Check if any other sidenotes are active
                let any_active = false;
                $("aside.sidenote").each(function(idx, elem) {
                    if ($(elem).hasClass("attention")) {
                        any_active = true;
                        return false;
                    }
                });
                if (any_active) {
                    return;
                }
            }
        }

        if ($(sidenote).css("position") == "fixed") {
            // we're animating it away!
            $(sidenote).addClass("shift-out");
            window.setTimeout(function() {
                $(".sidenote").removeClass("attention")
                              .removeClass("shift-out")
                              .removeClass("_activated_by_click");
            }, 500);
            return false;
        }

        if ($(number).hasClass("attention")) {
            if (e.type == "mouseover") return; // can't deactivate by mouseover

            if (!is_hover && !$(sidenote).hasClass("_activated_by_click")) {
                // clicking on a hover-activated note!
                $(sidenote).addClass("_activated_by_click");
            } else {
                $(".sidenote").removeClass("attention");
                $(sidenote).removeClass("_activated_by_click");
            }
        } else {
            if (e.type == "mouseout") return; // Can't activate by mouseout

            $(".sidenote").removeClass("attention");
            if ($(sidenote).css("float") != "right") {
                $(sidenote).addClass("shift-in");
                window.setTimeout(function() {
                    $(".sidenote").removeClass("shift-in");
                }, 500);
            }
            $(number).addClass("attention");
            $(sidenote).addClass("attention");
            if (!is_hover) {
                $(sidenote).addClass("_activated_by_click");
            }
        }
        // stop propagating!
        return false;
    }

    function clearSelection(e) {
        $(".sidenote").removeClass("attention")
                      .removeClass("shift-out")
                      .removeClass("_activated_by_click");
    }
    
    $(sidenote).click(attention).mouseover(attention).mouseout(attention);
    $(number).click(attention).mouseover(attention).mouseout(attention);
    $(document).click(clearSelection);
}

function initSideNotes() {
    autoSideNotes();
    reNumberSideNotes();
    foreachSidenote(initSideNote);
    moveSideNotes();
}

function reNumberSideNotes() {
    var numbers = {};
    var counter = 1;

    $("a.sidenote:not(.hand-numbered), a.sidenote._auto_numbered").each(
        function(idx, ref_elem) {
            var href = $(ref_elem).attr("href");
            var m = href.match(/^#(.*)$/);
            if (m != null) {
                var sn_id = m[1];
                var sn_number = counter;
                if (sn_id in numbers) {
                    sn_number = numbers[sn_id]
                } else {
                    counter ++;
                }
                var sidenote = document.getElementById(sn_id);

                // Already auto renumbered?
                if ($(ref_elem).hasClass("_auto_numbered")) {
                    $(ref_elem).find(".number").text(sn_number);
                } else {
                    $(ref_elem).append("<span class='number'>"+sn_number+"</span>")
                               .addClass("hand-numbered")
                               .addClass("_auto_numbered");
                }

                if ($(sidenote).hasClass("_auto_numbered")) {
                    $(sidenote).find(".number").text(sn_number);
                } else {
                    $(sidenote).prepend("<span class='number'>"+sn_number+"</span>")
                               .addClass("hand-numbered")
                               .addClass("_auto_numbered");
                }
            }
        });
}

function escapeSpecialChars(s) {
    return s.replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&apos;");
}

function fixProtocol(url) {
    // Change the protocol of the URL to match mine!
    // cross-origin requirements forbid loading HTTP content from HTTPS.
    var m = window.location.href.match(/^(https?)/);
    if (m != null) {
        var my_proto = m[1];
        return url.replace(/^(https?)/, my_proto);
    } else {
        return url;
    }
}

function formatCitation(url, csl_json, callback) {
    var citation = JSON.parse(csl_json);
    citation.id = 1
    var citeprocSys = {
        retrieveLocale: function (lang){
            var xhr = new XMLHttpRequest();
            xhr.open('GET', fixProtocol(sidenotes_config.csl_locales_location + '/locales-' + lang + '.xml'), false);
            xhr.send(null);
            return xhr.responseText;
        },
        retrieveItem: function(id){
            return citation;
        }
    };

    function getProcessor(styleID, proc_callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', fixProtocol(sidenotes_config.csl_location + '/' + styleID + '.csl'));
        xhr.onload = function () {
            var styleAsText = xhr.responseText;
            var citeproc = new CSL.Engine(citeprocSys, styleAsText);

            proc_callback(citeproc);
        }
        xhr.send();
    };

    ret = '';
    getProcessor(sidenotes_config.csl_style, function (citeproc) {
        //var citeproc = getProcessor('science');
        citeproc.updateItems([ 1 ]);
        var result = citeproc.makeBibliography();
        var citation_html = result[1][0]

        var doiUrlRegexp = new RegExp('(https?://(?:dx\.)?doi\.org/)([0-9a-zA-Z.]+/[0-9a-zA-Z.]+)');
        var doiRefRegexp = new RegExp('(DOI|doi:)([0-9a-zA-Z.]+/[0-9a-zA-Z.]+)');

        if (doiUrlRegexp.test(citation_html)) {
            citation_html = citation_html.replace(doiUrlRegexp, '<a href="$1$2" class="_doi_link">$1$2</a>');
        } else if (doiRefRegexp.test(citation_html)) {
            citation_html = citation_html.replace(doiRefRegexp, '<a href="http://dx.doi.org/$2" class="_doi_link">$1:$2</a>');
        } else {
            citation_html += (' <a href="' + escapeSpecialChars(url) + '" class="_doi_link">'
                            + escapeSpecialChars(url.replace(doiUrlRegexp, 'DOI:$2')) + '</a>');
        }

        callback(citation_html);
    });
}

function makeCitation(idx, elem, href) {

    var xhr = new XMLHttpRequest();

    function insertCitation(title) {
        var sn_id = "_AUTOSIDENOTE_" + idx;

        $(elem).after("<a href='#" + sn_id + "' class='sidenote' id='" +
                sn_id + "_REF'></a>");
        $(elem).parent().after("<aside class='sidenote' id='" + sn_id
            + "'><cite>" + title + "</cite></aside>");    

        var ref_elem = document.getElementById(sn_id + "_REF");
        var aside_elem = document.getElementById(sn_id);
        initSideNote(ref_elem, aside_elem);
        moveSideNotes();
        reNumberSideNotes();
    }

    // we can't use content negotiation on dx.doi.org as it redirects to
    // non-https content.

    var doi = href.replace(/https?:\/\/(?:dx\.)?doi.org\/(.*)/, "$1")
    https://api.crossref.org/works/10.5555/12345678/transform/

    function try_url(url, is_crossref, is_datacite) {
        xhr.open('GET', fixProtocol(url));
        xhr.setRequestHeader('Accept', 'application/vnd.citationstyles.csl+json');
        xhr.onload = function() {
            var title;
            if (xhr.status == 200) {
                formatCitation(href, xhr.responseText, insertCitation);
            } else {
                if (is_crossref) {
                    // we can still try datacite
                    try_url('https://data.datacite.org/application/vnd.citationstyles.csl+json/' + doi,
                        false, true);
                } else {
                    insertCitation(escapeSpecialChars(href));
                }
            }
            
        };
        xhr.send();
    }

    try_url('https://api.crossref.org/works/' + doi + '/transform/application/vnd.citationstyles.csl+json',
            true, false)
}

function autoSideNotes() {
    var doiRegexp = new RegExp('^https?://(dx\.)?doi\.org/');
    var wikipediaRegexp = new RegExp('^https?://([a-z]{2})\.(?:m\.)?wikipedia\.org/wiki/(.*)$');

    $("a.autosidenote").each(function(idx, elem) {
        var href = elem.getAttribute("href");
        var title = elem.getAttribute("title");
        if (title == undefined) {
            title = href;
            var match;

            if (doiRegexp.test(href) && (typeof CSL != "undefined")) {
                makeCitation(idx, elem, href);
                return;
            } else if ((match = wikipediaRegexp.exec(href)) != null) {
                title = match[2].replace('_', ' ') + ' – Wikipedia [' + match[1] + ']'
            }
        }

        title = escapeSpecialChars(title);

        var sn_id = "_AUTOSIDENOTE_" + idx;
        $(elem).after("<a href='#" + sn_id + "' class='sidenote' id='" +
                    sn_id + "_REF'></a>");
        $(elem).parent().after("<aside class='sidenote' id='" + sn_id
            + "'><cite><a href='" + href + "'>" + title + "</a></cite></aside>");
    });
    
}

$(document).ready(initSideNotes);
$(window).on("load", moveSideNotes);
$(window).resize(moveSideNotes);