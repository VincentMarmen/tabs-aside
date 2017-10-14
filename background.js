const FOLDERNAME = "Tabs Aside";
const BMPREFIX = "Session #";

var session = -1;
var bookmarkFolder = null;

// basic error handler
function onRejected(error) {
  console.log(`An error: ${error}`);
}

// load session index
browser.storage.local.get("session").then(data => {
  if (data.session) {
    session = data.session;
  } else {
    session = 0;

    browser.storage.local.set({
      session: session
    });
  }
}, onRejected);

// load root bookmark folder (Tabs Aside folder)
browser.bookmarks.getTree().then(data => {
  let root = data[0];

  console.log("searching for Tabs Aside folder");

  outerloop: for (rbm of root.children) {
    for (bm of rbm.children) {
      if (bm.title === FOLDERNAME && bm.type === "folder") {
        bookmarkFolder = bm;
        //console.log("Folder found!");
        break outerloop;
      }
    }
  }

  // Tabs Aside folder wasnt found
  if (bookmarkFolder === null) {
    console.log("Folder not found, lets create it!");

    browser.bookmarks.create({
      title: FOLDERNAME
    }).then(bm => {
      console.log("Folder successfully created");

      bookmarkFolder = bm;
    }, onRejected);
  }
}, onRejected);


// tab filter function
function tabFilter(tab) {
  // only http(s)
  return tab.url.indexOf("http") === 0;
}

function aside(tabs) {
  if (tabs.length > 0) {
    session++;

    // create session bm folder
    browser.bookmarks.create({
      parentId: bookmarkFolder.id,
      title: BMPREFIX + session
    }).then(bm => {
      // move tabs aside one by one
      asideOne(tabs, bm.id);

      // WARNING: this is not synchronous code

      // update storage
      browser.storage.local.set({
        session: session
      });
    }).catch(onRejected);
    
  } else {
    //console.log("no tabs to move aside!");
  }
}

// functional style :D
function asideOne(tabs, pID) {

  if (tabs.length > 0) {
    let tab = tabs.shift();

    //console.log("create bookmark for " + tab.title);
    // create bookmark
    browser.bookmarks.create({
      parentId: pID,
      title: tab.title,
      url: tab.url
    }).then(() => {
      // close tab
      return browser.tabs.remove(tab.id);
      }).then(() => {
      
        if (tabs.length === 0) {
          browser.runtime.sendMessage({ command: "refresh" });
        } else {
          // next one
          asideOne(tabs, pID);
        }
    }).catch(onRejected);
  }
}

/*browser.browserAction.onClicked.addListener(() => {
  // browser action button clicked

  browser.tabs.query({
    currentWindow: true,
    pinned: false,
    //active: false
  }).then((tabs) => {
    console.log("query returned " + tabs.length + " tabs");
    //aside(tabs.filter(tabFilter));
  }).catch(onRejected);
  
});*/

// message listener
browser.runtime.onMessage.addListener(message => {
  if (message.command === "aside") {

    browser.tabs.query({
      currentWindow: true,
      pinned: false,
      //active: false
    }).then((tabs) => {
      console.log("query returned " + tabs.length + " tabs");

      // open a new empty tab (async)
      browser.tabs.create({});

      // tabs aside!
      aside(tabs.filter(tabFilter));
    }).catch(onRejected);
    
  } else {
    console.error("Unknown message: " + JSON.stringify(message));
  }
});