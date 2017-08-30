var linkmatches = [
  "([\\]\\[]|\\b|\\.)\\.torrent\\b([^\\-]|$)",
  "torrents\\.php\\?action=download",
  "magnet:"
];

// handle events from global
safari.self.addEventListener("message", function(msg){
  switch(msg.name){
    case "log": // handle global console logs
      return console.log("global:", msg.message);

    default: // unhandled
      return console.log("tab: " + msg.name, msg);
  }
}, false);



/**
 * gather all the links on a page that might contain a torrent
 *
 *  - this is taken from: https://github.com/bogenpirat/remote-torrent-adder
 *  to trim down the links and add the addTorrent stuff for clicking a link
 *
 * @param      {Object}  the page document
 */
function registerLinks(document) {
  // handle common links
  var rL = document.getElementsByTagName('a');
  var links = new Array();
  for(lkey in rL) {
    for(mkey in linkmatches) {
      if(rL[lkey].href && rL[lkey].href.match(new RegExp(linkmatches[mkey], "g"))) {
        links.push(rL[lkey]);
        break;
      }
  }}

  // handle forms
  var rB1 = Array.prototype.slice.call(document.getElementsByTagName('button'));
  var rB2 = Array.prototype.slice.call(document.getElementsByTagName('input'));
  var rB = rB1.concat(rB2);

  var forms = new Array();
  for (x in rB) { // get an index-parallel array of parent forms
    forms.push(rB[x].form);
  }
  for (x in rB) {
    for(mkey in linkmatches) {
      if(forms[x] != null && forms[x].hasAttribute('action') && forms[x].action.match && forms[x].action.match(new RegExp(linkmatches[mkey], "g"))) {
        rB[x].href = forms[x].action;
        links.push(rB[x]);
        break;
      }
    }
  }

  // re-register actions
  if (links.length != 0) {
    for (key in links) {
      if (links[key].addEventListener) {
        links[key].addEventListener('click', function(e) {
          if (!(e.ctrlKey || e.shiftKey || e.altKey)) {
            e.preventDefault();
            var url = this.href;
            safari.self.tab.dispatchMessage('addTorrent', url);
          }
        });
      }
    }
  }
}

registerLinks(document);