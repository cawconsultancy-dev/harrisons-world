/* Harrison's World: original drawings for feelings, dressing up, the pop-up garden and breathing. */
(function () {
  "use strict";
  var A = window.HW.art, n = 0;
  function id(p) { n += 1; return p + "y" + n; }
  function svg(vb, body, defs) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb + '">' + (defs ? "<defs>" + defs + "</defs>" : "") + body + "</svg>";
  }
  var INK = "#2b3157";

  /* a round friendly face that shows one feeling at a time, drawn big and clear */
  A.face = function (feel) {
    var g = id("f");
    var skin = feel === "angry" ? ["#ffd9a0", "#f6a96b"] : ["#ffe7a6", "#f7c25a"];
    var defs = '<radialGradient id="' + g + '" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="' + skin[0] + '"/><stop offset="1" stop-color="' + skin[1] + '"/></radialGradient>';
    var head = '<circle cx="100" cy="100" r="92" fill="url(#' + g + ')"/><circle cx="100" cy="100" r="92" fill="none" stroke="#e0a43c" stroke-width="4"/>';
    var cheeks = '<ellipse cx="50" cy="122" rx="14" ry="9" fill="#f59a8f" opacity=".45"/><ellipse cx="150" cy="122" rx="14" ry="9" fill="#f59a8f" opacity=".45"/>';
    var line = 'stroke="' + INK + '" stroke-width="8" stroke-linecap="round" fill="none"';
    var b = "";
    if (feel === "happy") {
      b = '<circle cx="68" cy="84" r="10" fill="' + INK + '"/><circle cx="132" cy="84" r="10" fill="' + INK + '"/>' +
        '<path d="M58 114Q100 172 142 114Z" fill="#7a2d3c" stroke="' + INK + '" stroke-width="7" stroke-linejoin="round"/>' +
        '<path d="M80 142q20 12 40 0q-20-10-40 0z" fill="#f28b9a"/>';
    } else if (feel === "sad") {
      b = '<path d="M54 70q14-2 28-14M118 56q14 12 28 14" ' + line + '/>' +
        '<circle cx="68" cy="92" r="9" fill="' + INK + '"/><circle cx="132" cy="92" r="9" fill="' + INK + '"/>' +
        '<path d="M70 146q30-26 60 0" ' + line + '/>' +
        '<path d="M134 106c0 10-6 16-6 22a6 6 0 0 0 12 0c0-6-6-12-6-22z" fill="#6cb8f0"/>';
    } else if (feel === "angry") {
      b = '<path d="M50 62l34 16M150 62l-34 16" ' + line + '/>' +
        '<circle cx="70" cy="94" r="9" fill="' + INK + '"/><circle cx="130" cy="94" r="9" fill="' + INK + '"/>' +
        '<path d="M70 144q30-16 60 0" ' + line + '/>';
    } else {
      b = '<path d="M52 54q16-14 32 0M116 54q16-14 32 0" ' + line + '/>' +
        '<circle cx="68" cy="86" r="15" fill="#fff" stroke="' + INK + '" stroke-width="5"/><circle cx="132" cy="86" r="15" fill="#fff" stroke="' + INK + '" stroke-width="5"/>' +
        '<circle cx="68" cy="88" r="7" fill="' + INK + '"/><circle cx="132" cy="88" r="7" fill="' + INK + '"/>' +
        '<ellipse cx="100" cy="140" rx="16" ry="20" fill="#7a2d3c" stroke="' + INK + '" stroke-width="6"/>';
    }
    return svg("0 0 200 200", head + cheeks + b, defs);
  };
  A.FEELINGS = ["happy", "sad", "angry", "surprised"];

  /* a child to dress, with no clothes details of their own so each piece reads clearly */
  A.kid = function () {
    var skin = "#e9b48a", hair = "#6b4a2b";
    return svg("0 0 200 320",
      '<rect x="62" y="226" width="30" height="80" rx="14" fill="' + skin + '"/><rect x="108" y="226" width="30" height="80" rx="14" fill="' + skin + '"/>' +
      '<rect x="54" y="296" width="42" height="18" rx="9" fill="#5b6390"/><rect x="104" y="296" width="42" height="18" rx="9" fill="#5b6390"/>' +
      '<path d="M40 132c-14 30-18 60-14 90" stroke="' + skin + '" stroke-width="24" stroke-linecap="round" fill="none"/>' +
      '<path d="M160 132c14 30 18 60 14 90" stroke="' + skin + '" stroke-width="24" stroke-linecap="round" fill="none"/>' +
      '<rect x="52" y="118" width="96" height="124" rx="34" fill="#eef1fb"/>' +
      '<rect x="88" y="104" width="24" height="22" fill="' + skin + '"/>' +
      '<circle cx="100" cy="66" r="48" fill="' + skin + '"/>' +
      '<path d="M52 62c0-34 22-50 48-50s48 16 48 50c-10-16-26-24-48-24s-38 8-48 24z" fill="' + hair + '"/>' +
      '<circle cx="82" cy="70" r="6" fill="' + INK + '"/><circle cx="118" cy="70" r="6" fill="' + INK + '"/>' +
      '<ellipse cx="72" cy="86" rx="8" ry="5" fill="#f08f86" opacity=".5"/><ellipse cx="128" cy="86" rx="8" ry="5" fill="#f08f86" opacity=".5"/>' +
      '<path d="M88 92q12 12 24 0" stroke="' + INK + '" stroke-width="5" stroke-linecap="round" fill="none"/>');
  };
  /* where each piece sits on the child, as % of the drawing box: left, top, width */
  A.WEAR = {
    sunhat: [16, -6, 68], sunglasses: [27, 14, 46], tshirt: [16, 33, 68],
    coat: [10, 31, 80], scarf: [30, 29, 40], gloves: [4, 62, 92], wellies: [22, 84, 56], umbrella: [52, -14, 58]
  };

  /* a hole in the garden, drawn as the back (dark) and front (soil mound) so a vegetable can rise between them */
  A.holeBack = function () {
    return svg("0 0 200 60", '<ellipse cx="100" cy="32" rx="84" ry="22" fill="#4a2f1f"/><ellipse cx="100" cy="36" rx="70" ry="14" fill="#3a2316"/>');
  };
  A.holeFront = function () {
    return svg("0 0 200 60", '<path d="M4 26c20 20 172 20 192 0c4 20-10 32-96 32S0 46 4 26z" fill="#8f6040"/><path d="M14 34c26 14 146 14 172 0" stroke="#a87650" stroke-width="5" fill="none" stroke-linecap="round"/>');
  };

  /* the breathing bubble: a soft glowing circle with a calm smile */
  A.breathBall = function () {
    var g = id("b");
    return svg("0 0 200 200",
      '<circle cx="100" cy="100" r="96" fill="url(#' + g + ')"/>' +
      '<path d="M70 96q10 8 20 0M110 96q10 8 20 0" stroke="#3d3a7a" stroke-width="6" stroke-linecap="round" fill="none"/>' +
      '<path d="M84 122q16 12 32 0" stroke="#3d3a7a" stroke-width="6" stroke-linecap="round" fill="none"/>' +
      '<ellipse cx="68" cy="60" rx="20" ry="11" fill="#fff" opacity=".45" transform="rotate(-30 68 60)"/>',
      '<radialGradient id="' + g + '" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#e6dcff"/><stop offset=".6" stop-color="#b9a4f2"/><stop offset="1" stop-color="#8f79d8"/></radialGradient>');
  };
})();
